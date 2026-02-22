import math
import numpy as np
import pytest
from datetime import datetime, timezone as tz
from unittest.mock import AsyncMock, MagicMock

from app.models.tracking import MealLog, MealSize
from app.services.prediction import (
    _build_features, _serialize_model, _deserialize_model,
    _serialize_scaler, _deserialize_scaler, _update_running_stats,
    _compute_confidence, generate_prediction, _new_model
)

@pytest.mark.asyncio
async def test_feature_extraction_dimensions():
    # Mock meal and database
    meal = MagicMock(spec=MealLog)
    meal.logged_at = datetime(2026, 2, 22, 12, 0, tzinfo=tz.utc)
    meal.meal_size = MealSize.MEDIUM
    meal.hunger_level_before = 7
    meal.user_id = uuid4()

    db = AsyncMock()
    
    # Configure execute to return an object with the expected methods
    mock_result = MagicMock()
    mock_result.scalar.side_effect = [500.0, 450.0]  # water, calories
    mock_result.scalar_one_or_none.return_value = 480  # sleep
    
    db.execute.return_value = mock_result

    features = await _build_features(meal, db)
    
    assert features.shape == (9,)
    # hour_sin for 12:00 (midday) should be sin(pi) = 0
    assert abs(features[0]) < 1e-5
    # meal_size for medium should be 0.5
    assert features[4] == 0.5
    # hunger 7/10 -> 0.7
    assert features[5] == 0.7


from uuid import uuid4 # Add missing import


def test_model_serialization():
    model = _new_model()
    # Mock some weights
    model.coef_ = np.random.randn(9)
    model.intercept_ = np.array([0.5])
    model.t_ = 10.0

    serialized = _serialize_model(model)
    deserialized = _deserialize_model(serialized)

    assert np.allclose(model.coef_, deserialized.coef_)
    assert np.allclose(model.intercept_, deserialized.intercept_)
    assert model.t_ == deserialized.t_


def test_scaler_serialization():
    mean = np.array([1.0, 2.0, 3.0])
    var = np.array([0.5, 0.5, 0.5])
    count = 10

    serialized = _serialize_scaler(mean, var, count)
    d_mean, d_var, d_count = _deserialize_scaler(serialized)

    assert np.allclose(mean, d_mean)
    assert np.allclose(var, d_var)
    assert count == d_count


def test_welford_online_stats():
    mean = np.array([0.0])
    var = np.array([1.0])
    count = 0
    
    # Add values [1, 2, 3] manually
    data = [1.0, 2.0, 3.0]
    for x in data:
        mean, var, count = _update_running_stats(mean, var, count, np.array([x]))
    
    expected_mean = sum(data) / len(data)
    expected_var = np.var(data) # This is pop variance which Welford matches
    
    assert mean[0] == expected_mean
    # Welford matches population variance (sum squared diffs / n)
    # np.var default is population variance.
    assert abs(var[0] - expected_var) < 1e-5


def test_confidence_scaling():
    assert _compute_confidence(0) == 0.20
    assert _compute_confidence(1) == 0.25
    assert _compute_confidence(2) == 0.30
    # At 10 samples model kicks in
    c10 = _compute_confidence(10)
    assert c10 > 0.4
    assert _compute_confidence(100) > 0.8
    assert _compute_confidence(1000) <= 0.95
