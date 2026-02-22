"""
HarmonyEngine: Generalized online learning engine for multi-facet predictive modeling.
Handles model persistence, feature scaling, and incremental training for any facet.
"""

import json
import numpy as np
from datetime import datetime, timezone as tz
from typing import Optional, Any

from sklearn.linear_model import SGDRegressor
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user_model import UserModel

class HarmonyEngine:
    def __init__(self, facet: str, num_features: int):
        self.facet = facet
        self.num_features = num_features

    # ── Model & Scaler Serialization ───────────────────────────────────────

    def _serialize_model(self, model: SGDRegressor) -> str:
        return json.dumps({
            "coef": model.coef_.tolist(),
            "intercept": model.intercept_.tolist(),
            "t": float(model.t_),
        })

    def _deserialize_model(self, data: str) -> SGDRegressor:
        parsed = json.loads(data)
        model = self._new_model()
        model.coef_ = np.array(parsed["coef"])
        model.intercept_ = np.array(parsed["intercept"])
        model.t_ = parsed["t"]
        return model

    def _new_model(self) -> SGDRegressor:
        return SGDRegressor(
            loss="huber",
            epsilon=0.5,
            penalty="l2",
            alpha=0.001,
            learning_rate="invscaling",
            eta0=0.05,
            power_t=0.25,
            warm_start=True,
        )

    def _serialize_scaler(self, mean: np.ndarray, var: np.ndarray, count: int) -> str:
        return json.dumps({
            "mean": mean.tolist(),
            "var": var.tolist(),
            "count": count,
        })

    def _deserialize_scaler(self, data: str) -> tuple[np.ndarray, np.ndarray, int]:
        parsed = json.loads(data)
        return np.array(parsed["mean"]), np.array(parsed["var"]), parsed["count"]

    # ── Online Stats (Welford's) ──────────────────────────────────────────

    def _update_running_stats(
        self, old_mean: np.ndarray, old_var: np.ndarray, old_count: int,
        new_x: np.ndarray,
    ) -> tuple[np.ndarray, np.ndarray, int]:
        """Welford's online algorithm for running mean/variance."""
        n = old_count + 1
        delta = new_x - old_mean
        new_mean = old_mean + delta / n
        delta2 = new_x - new_mean
        new_var = ((old_var * old_count) + delta * delta2) / n
        return new_mean, new_var, n

    def _normalize(self, x: np.ndarray, mean: np.ndarray, var: np.ndarray) -> np.ndarray:
        std = np.sqrt(var + 1e-8)
        return (x - mean) / std

    # ── DB Interaction ────────────────────────────────────────────────────

    async def _get_or_create_user_model(self, user_id: Any, db: AsyncSession) -> UserModel:
        result = await db.execute(
            select(UserModel).where(
                UserModel.user_id == user_id,
                UserModel.facet == self.facet
            )
        )
        um = result.scalar_one_or_none()
        if not um:
            um = UserModel(user_id=user_id, facet=self.facet)
            db.add(um)
            await db.flush()
        return um

    # ── Public API ────────────────────────────────────────────────────────

    async def train_step(self, user_id: Any, features: np.ndarray, target: float, db: AsyncSession) -> None:
        """Runs a single online learning step for the specific facet."""
        um = await self._get_or_create_user_model(user_id, db)

        # Update scaler
        if um.feature_scaler:
            mean, var, count = self._deserialize_scaler(um.feature_scaler)
        else:
            mean = np.zeros(self.num_features)
            var = np.ones(self.num_features)
            count = 0

        mean, var, count = self._update_running_stats(mean, var, count, features)
        um.feature_scaler = self._serialize_scaler(mean, var, count)

        # Normalize & Predict
        features_norm = self._normalize(features, mean, var)
        
        if um.model_weights:
            model = self._deserialize_model(um.model_weights)
        else:
            model = self._new_model()

        # Fit
        X = features_norm.reshape(1, -1)
        y = np.array([target])
        model.partial_fit(X, y)

        # Save
        um.model_weights = self._serialize_model(model)
        um.training_samples = (um.training_samples or 0) + 1
        um.last_trained_at = datetime.now(tz.utc)
        
        await db.flush()

    async def predict(self, user_id: Any, features: np.ndarray, db: AsyncSession) -> Optional[float]:
        """Predicts the target value for the given features."""
        um = await self._get_or_create_user_model(user_id, db)
        
        if not um.model_weights or not um.feature_scaler:
            return None
            
        mean, var, _ = self._deserialize_scaler(um.feature_scaler)
        features_norm = self._normalize(features, mean, var)
        
        model = self._deserialize_model(um.model_weights)
        prediction = float(model.predict(features_norm.reshape(1, -1))[0])
        
        return prediction

    async def get_training_samples(self, user_id: Any, db: AsyncSession) -> int:
        um = await self._get_or_create_user_model(user_id, db)
        return um.training_samples or 0
