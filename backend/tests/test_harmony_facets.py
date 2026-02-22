import numpy as np
import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

from app.services.harmony_engine import HarmonyEngine
from app.models.user_model import UserModel

@pytest.mark.asyncio
async def test_harmony_engine_multi_facet_isolation():
    """Verify that models for different facets are isolated."""
    user_id = uuid4()
    db = AsyncMock()
    
    # Mock DB storage
    storage = {}
    
    async def mock_execute(q):
        q_str = str(q).lower()
        # Find which facet this query is for
        # Heuristic: check specifically for the facet values in the compiled query
        found_facet = "hunger"
        for f in ["energy", "mood", "hydration"]:
            if f in q_str:
                found_facet = f
                break
        
        # If we can't find it in the string, it might be a parameter.
        # For simplicity in this test, we check if the engine's current facet is what we expect.
        # But since we have multiple engines, let's just make the heuristic stronger.
        if "facet =" in q_str:
             if "energy" in q_str: found_facet = "energy"
             elif "mood" in q_str: found_facet = "mood"
             elif "hydration" in q_str: found_facet = "hydration"

        res = MagicMock()
        res.scalar_one_or_none.return_value = storage.get(found_facet)
        res.scalar.return_value = 1 if storage.get(found_facet) else 0
        return res




    db.execute.side_effect = mock_execute
    
    # db.add is synchronous in SQLAlchemy, so we use MagicMock
    db.add = MagicMock()
    def mock_add(obj):
        storage[obj.facet] = obj
    db.add.side_effect = mock_add


    hunger_engine = HarmonyEngine(facet="hunger", num_features=2)
    energy_engine = HarmonyEngine(facet="energy", num_features=2)

    # Train hunger
    await hunger_engine.train_step(user_id, np.array([1.0, 1.0]), 10.0, db)
    assert "hunger" in storage
    assert "energy" not in storage
    
    # Train energy
    await energy_engine.train_step(user_id, np.array([0.0, 0.0]), 5.0, db)
    assert "energy" in storage
    
    # Verify weights are different
    hunger_model = hunger_engine._deserialize_model(storage["hunger"].model_weights)
    energy_model = energy_engine._deserialize_model(storage["energy"].model_weights)
    
    assert not np.array_equal(hunger_model.coef_, energy_model.coef_)

def test_harmony_engine_scaling():
    engine = HarmonyEngine(facet="test", num_features=1)
    mean = np.array([0.0])
    var = np.array([1.0])
    count = 0
    
    # Train on 10.0
    mean, var, count = engine._update_running_stats(mean, var, count, np.array([10.0]))
    assert mean[0] == 10.0
    assert count == 1
    
    # Train on 20.0
    mean, var, count = engine._update_running_stats(mean, var, count, np.array([20.0]))
    assert mean[0] == 15.0
    assert count == 2
    
    # Normalize 20.0 with these stats
    norm = engine._normalize(np.array([20.0]), mean, var)
    # std = sqrt(var) = sqrt(((1.0*0) + 10*5)/2) = sqrt(25) = 5
    # norm = (20 - 15) / 5 = 1.0
    assert abs(norm[0] - 1.0) < 1e-5
