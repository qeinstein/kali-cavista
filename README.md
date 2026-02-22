# 🍽️ Companion_tracker AI — Your Body's Daily Rhythm Partner

> **Hackathon Theme:** Data to Prevention — AI as Your Health Partner  
> **Concept:** A mobile-first AI companion that learns your unique hunger and hydration patterns, then proactively prevents health issues before they happen.

---

## 📌 Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [Core Features](#core-features)
5. [Tech Stack](#tech-stack)
6. [System Architecture](#system-architecture)
7. [Data Sources & Tracking](#data-sources--tracking)
8. [Project Structure](#project-structure)
9. [Setup & Installation](#setup--installation)
10. [Implementation Guide](#implementation-guide)
    - [Step 1: Initialize the Project](#step-1-initialize-the-project)
    - [Step 2: Set Up Data Collection](#step-2-set-up-data-collection)
    - [Step 3: Build the Prediction Model](#step-3-build-the-prediction-model)
    - [Step 4: Build the Backend API](#step-4-build-the-backend-api)
    - [Step 5: Build the Mobile Frontend](#step-5-build-the-mobile-frontend)
    - [Step 6: Integrate AI Nudge System](#step-6-integrate-ai-nudge-system)
    - [Step 7: Connect Everything & Test](#step-7-connect-everything--test)
11. [API Reference](#api-reference)
12. [MVP Scope (Hackathon Focus)](#mvp-scope-hackathon-focus)
13. [Future Enhancements](#future-enhancements)
14. [Awards Alignment](#awards-alignment)
15. [Team Roles](#team-roles)
16. [Contributing](#contributing)
17. [License](#license)

---

## Project Overview

**Companion_tracker AI** is a mobile AI health companion that builds a **living biological rhythm profile** for each user. Instead of reacting to symptoms after they appear, Companion_tracker *predicts* when you'll be hungry, when you're at risk of dehydration, and when your eating patterns are trending toward poor health outcomes — then nudges you *before* the problem hits.

This is prevention through anticipation, not reaction.

---

## Problem Statement

Most people eat reactively. They wait until they're starving, then make poor food choices. They forget to drink water until they already have a headache. Over time, these seemingly small habits lead to:

- Energy crashes and poor concentration
- Metabolic issues and weight gain
- Increased risk of diabetes and hypertension
- Chronic dehydration affecting kidney function

Nobody is connecting these daily behavioral dots — and no app is doing it proactively on a *personal* level.

---

## Solution

Companion_tracker AI solves this by:

1. **Learning your personal patterns** — hunger timing, hydration habits, meal frequency, and lifestyle rhythms unique to you
2. **Predicting future states** — forecasting when you'll next be hungry or at risk of dehydration
3. **Proactively nudging you** — sending smart, timely alerts before the problem occurs
4. **Surfacing insights** — connecting lifestyle data to health patterns over time ("You skip lunch 3x a week — this correlates with your reported afternoon headaches")

---

## Core Features

### 🔮 Hunger Prediction
The AI builds a time-series model of your personal hunger cycles. Based on your last meal, meal size, activity level, and historical patterns, it predicts when you'll next be hungry — and nudges you before you reach that point.

### 💧 Hydration Tracking & Alerts
A live hydration score is computed from your water intake logs, activity level, ambient temperature (via weather API), and personal baseline. You receive alerts *before* dehydration symptoms appear.

### 🍽️ Meal Pattern Intelligence
The app detects when you're skipping meals, eating too late, or spacing meals poorly. It flags the downstream health risk in plain language and suggests corrective action.

### 📊 Prevention Insights
Over weeks, the AI surfaces behavioral correlations: sleep vs. overeating, screen time vs. meal skipping, heat vs. hydration neglect. These are your personal prevention signals.

### 🤖 Conversational AI Check-ins
A lightweight chat interface lets you log meals, report hunger levels, and receive advice — all in a natural conversational tone powered by an LLM.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native (Expo) |
| Backend API | Node.js + Express |
| Database | PostgreSQL + TimescaleDB (time-series) |
| ML / Prediction | Python + scikit-learn / TensorFlow Lite |
| AI Nudge Layer | Claude API (Anthropic) or OpenAI |
| Health Data (iOS) | Apple HealthKit |
| Health Data (Android) | Google Health Connect |
| Weather API | OpenWeatherMap API |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Auth | Firebase Auth / Supabase Auth |
| Deployment | Railway / Render (backend), Expo Go (mobile) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  MOBILE APP (React Native)           │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ One-Tap  │  │  Chat UI │  │  Insights Dashboard│ │
│  │ Logging  │  │ (AI)     │  │                    │ │
│  └────┬─────┘  └────┬─────┘  └────────────────────┘ │
└───────┼─────────────┼────────────────────────────────┘
        │             │
        ▼             ▼
┌───────────────────────────────┐
│        BACKEND API            │
│    Node.js + Express          │
│  ┌──────────┐ ┌────────────┐  │
│  │  Data    │ │ Prediction │  │
│  │  Ingest  │ │  Engine    │  │
│  └──────────┘ └────────────┘  │
└──────────────┬────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│  PostgreSQL │  │  Python ML   │
│  + Timescale│  │  Model Server│
└─────────────┘  └──────────────┘
       ▲
       │
┌──────┴───────────────────────┐
│       DATA SOURCES           │
│  HealthKit / Google Fit      │
│  Manual Logs (meals, water)  │
│  OpenWeatherMap API          │
│  Phone Sensors (steps, GPS)  │
└──────────────────────────────┘
```

---

## Data Sources & Tracking

Companion_tracker tracks your health data using only your **mobile phone** — no wearable required.

### Passive (Automatic)
- **Google Health Connect / Apple HealthKit** — steps, activity, sleep estimates, heart rate (if available)
- **GPS + Weather API** — location-aware hydration scoring based on temperature and humidity
- **Phone accelerometer** — activity level and sedentary detection

### Active (Frictionless User Input)
- **One-tap meal logging** — single button press + light/medium/heavy selector
- **One-tap water logging** — home screen widget that logs a glass instantly
- **Notification-based check-ins** — "Did you eat lunch?" replied to directly from the notification tray
- **Conversational AI input** — chat-based logging that feels like texting

### Contextual (Inferred)
- **Calendar integration** — detects busy blocks and pre-warns about likely meal skipping
- **Screen time patterns** — long unbroken work sessions trigger hydration nudges
- **Time-of-day patterns** — the most powerful signal, built purely from your historical timestamps

---

## Project Structure

```
Companion_tracker-ai/
├── frontend/                   # Next.js web app
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── routes/
│   │   │   │       └── route.ts    # Dynamic routes API
│   │   │   ├── context/
│   │   │   │   └── LoaderContext.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── VoiceNavigator.tsx  # Voice navigation component
│   │   │   ├── TopNav.tsx
│   │   │   ├── SpagLoader.tsx
│   │   │   └── home/
│   │   │       ├── Hero.tsx
│   │   │       ├── About.tsx
│   │   │       └── Modules.tsx
│   │   ├── utils/
│   │   │   ├── apiConfig.ts        # API configuration utility
│   │   │   ├── conversationState.ts # Conversation state management
│   │   │   └── pageAccessibility.ts # Page content extraction
│   │   └── types/
│   │       └── lucide-react.d.ts   # Type declarations for icons
│   ├── .env.local
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                     # React Native (Expo) app
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── chat.tsx
│   │   │   ├── index.tsx
│   │   │   ├── insights.tsx
│   │   │   └── log.tsx
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── onboarding/
│   │   │   ├── permissions.tsx
│   │   │   ├── survey.tsx
│   │   │   └── welcome.tsx
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── HungerTimer.tsx
│   │   │   ├── HydrationScore.tsx
│   │   │   ├── InsightCard.tsx
│   │   │   ├── MealBottomSheet.tsx
│   │   │   ├── MealLogButton.tsx
│   │   │   ├── TodayTimeline.tsx
│   │   │   ├── WaterLogButton.tsx
│   │   │   └── WaterToast.tsx
│   │   ├── constants/
│   │   │   └── theme.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── notifications.ts
│   │   └── store/
│   │       ├── useAppStore.ts
│   │       └── useAuthStore.ts
│   ├── app.json
│   └── package.json
│
├── backend/                    # Python + FastAPI API
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   ├── tracking.py
│   │   │   └── user.py
│   │   ├── routers/
│   │   │   ├── audio.py          # Voice navigation API
│   │   │   ├── auth.py
│   │   │   ├── predictions.py
│   │   │   ├── tracking.py
│   │   │   └── users.py
│   │   ├── services/
│   │   │   ├── llm.py            # LLM service for voice navigation
│   │   │   ├── tts.py            # Text-to-Speech service
│   │   │   └── weather.py
│   │   ├── main.py
│   │   └── __init__.py
│   ├── .env.example
│   └── requirements.txt
│
├── ml/                         # Python ML model
│   ├── data/
│   │   └── sample_logs.csv
│   ├── models/
│   │   └── hunger_model.pkl
│   ├── train.py
│   ├── predict.py
│   ├── server.py               # FastAPI model server
│   └── requirements.txt
│
├── docs/
│   └── api.md
├── docker-compose.yml
└── README.md
```

---

## Setup & Installation

### Prerequisites

Make sure you have the following installed:

- Node.js v18+
- Python 3.9+
- PostgreSQL 14+
- Expo CLI (`npm install -g expo-cli`)
- Docker (optional but recommended)

### Clone the Repository

```bash
git clone https://github.com/your-team/Companion_tracker-ai.git
cd Companion_tracker-ai
```

### Environment Variables

Create a `.env` file in the `backend/` directory using the provided example:

```bash
cp backend/.env.example backend/.env
```

Fill in the following values:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/Companion_tracker
OPENWEATHER_API_KEY=your_openweather_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
FIREBASE_SERVER_KEY=your_firebase_server_key
ML_SERVER_URL=http://localhost:8000
JWT_SECRET=your_jwt_secret
PORT=3000

# Voice Navigation Configuration
API_URL=http://localhost:8000
API_VERSION=v1
TTS_SERVICE=elevenlabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```

### Frontend Environment Variables

For the frontend (Next.js), create a `.env.local` file in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env.local
```

Fill in the following values:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
```

---

## Implementation Guide

### Step 1: Initialize the Project

#### Backend Setup

```bash
cd backend
npm install
npm run db:migrate     # Run PostgreSQL migrations
npm run dev            # Start development server on port 3000
```

#### Mobile Setup

```bash
cd mobile
npm install
npx expo start         # Open Expo dev tools
```

#### ML Server Setup

```bash
cd ml
pip install -r requirements.txt
python server.py       # Start FastAPI model server on port 8000
```

---

### Step 2: Set Up Data Collection

This is the foundation of everything. You need to reliably collect data from the user's phone.

#### 2a. Apple HealthKit Integration (iOS)

Install the required package:

```bash
cd mobile && npm install react-native-health
```

Request permissions and fetch step count and activity data:

```javascript
// mobile/src/services/healthKit.js
import AppleHealthKit from 'react-native-health';

const PERMISSIONS = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
    ],
  },
};

export const initHealthKit = () => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(PERMISSIONS, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
};

export const getStepsToday = () => {
  return new Promise((resolve, reject) => {
    const options = { date: new Date().toISOString() };
    AppleHealthKit.getStepCount(options, (err, result) => {
      if (err) return reject(err);
      resolve(result.value);
    });
  });
};
```

#### 2b. Google Health Connect (Android)

```bash
npm install react-native-health-connect
```

```javascript
// mobile/src/services/googleFit.js
import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect';

export const initGoogleHealth = async () => {
  await initialize();
  await requestPermission([
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    { accessType: 'read', recordType: 'SleepSession' },
  ]);
};

export const getStepsToday = async () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  const result = await readRecords('Steps', {
    timeRangeFilter: {
      operator: 'between',
      startTime: startOfDay.toISOString(),
      endTime: new Date().toISOString(),
    },
  });

  return result.records.reduce((sum, r) => sum + r.count, 0);
};
```

#### 2c. Weather Data (Backend)

```javascript
// backend/src/services/weatherService.js
const axios = require('axios');

const getWeatherData = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/weather`;
  const response = await axios.get(url, {
    params: {
      lat,
      lon,
      appid: process.env.OPENWEATHER_API_KEY,
      units: 'metric',
    },
  });

  return {
    temperature: response.data.main.temp,
    humidity: response.data.main.humidity,
    feelsLike: response.data.main.feels_like,
  };
};

module.exports = { getWeatherData };
```

#### 2d. One-Tap Logging (Mobile UI)

```javascript
// mobile/src/components/MealLogButton.js
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { logMeal } from '../services/api';

const MEAL_SIZES = ['light', 'medium', 'heavy'];

export default function MealLogButton() {
  const [selected, setSelected] = useState('medium');

  const handleLog = async () => {
    await logMeal({
      size: selected,
      timestamp: new Date().toISOString(),
    });
    // Show quick success toast
  };

  return (
    <View style={styles.container}>
      <View style={styles.sizeRow}>
        {MEAL_SIZES.map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.sizeBtn, selected === size && styles.selected]}
            onPress={() => setSelected(size)}
          >
            <Text>{size}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.logBtn} onPress={handleLog}>
        <Text style={styles.logText}>🍽️ I Just Ate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  sizeRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  sizeBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  selected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  logBtn: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center' },
  logText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
```

---

### Step 3: Build the Prediction Model

The ML model takes a user's meal history and context signals to predict when they'll next be hungry.

#### 3a. Database Schema

```sql
-- PostgreSQL schema
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meal_size VARCHAR(10),           -- light / medium / heavy
  hunger_level_before INT,         -- 1-10 scale
  notes TEXT
);

CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount_ml INT DEFAULT 250
);

CREATE TABLE health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  steps_count INT,
  temperature_celsius FLOAT,
  humidity_percent FLOAT,
  active_calories INT
);

CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_hunger_at TIMESTAMPTZ,
  hydration_score FLOAT,          -- 0.0 to 1.0
  confidence FLOAT
);
```

#### 3b. Feature Engineering (Python)

```python
# ml/features.py
import pandas as pd
import numpy as np

def build_features(meal_logs: pd.DataFrame, health_snapshots: pd.DataFrame) -> pd.DataFrame:
    """
    Build feature set for hunger prediction model.
    """
    features = []

    for i in range(1, len(meal_logs)):
        current = meal_logs.iloc[i]
        previous = meal_logs.iloc[i - 1]

        # Time since last meal (hours)
        gap_hours = (current['logged_at'] - previous['logged_at']).seconds / 3600

        # Hour of day when they got hungry
        hour_of_day = current['logged_at'].hour

        # Day of week (0=Monday, 6=Sunday)
        day_of_week = current['logged_at'].weekday()

        # Size of previous meal (encoded)
        meal_size_map = {'light': 1, 'medium': 2, 'heavy': 3}
        prev_size = meal_size_map.get(previous['meal_size'], 2)

        # Activity level in the gap window
        snap = health_snapshots[
            (health_snapshots['snapshot_at'] >= previous['logged_at']) &
            (health_snapshots['snapshot_at'] <= current['logged_at'])
        ]
        avg_steps = snap['steps_count'].mean() if not snap.empty else 0
        avg_temp = snap['temperature_celsius'].mean() if not snap.empty else 22.0

        features.append({
            'gap_hours': gap_hours,                  # TARGET: this is what we predict
            'hour_of_day': hour_of_day,
            'day_of_week': day_of_week,
            'prev_meal_size': prev_size,
            'avg_steps_in_gap': avg_steps,
            'avg_temperature': avg_temp,
        })

    return pd.DataFrame(features)
```

#### 3c. Train the Hunger Prediction Model

```python
# ml/train.py
import pandas as pd
import pickle
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from features import build_features

# Load your data
meal_logs = pd.read_csv('data/meal_logs.csv', parse_dates=['logged_at'])
health_snapshots = pd.read_csv('data/health_snapshots.csv', parse_dates=['snapshot_at'])

# Build features
df = build_features(meal_logs, health_snapshots)

# Features and target
X = df.drop('gap_hours', axis=1)
y = df['gap_hours']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = GradientBoostingRegressor(n_estimators=100, max_depth=4, learning_rate=0.1)
model.fit(X_train, y_train)

# Evaluate
preds = model.predict(X_test)
mae = mean_absolute_error(y_test, preds)
print(f"Mean Absolute Error: {mae:.2f} hours")

# Save model
with open('models/hunger_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Model saved to models/hunger_model.pkl")
```

#### 3d. Model Serving (FastAPI)

```python
# ml/server.py
from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np

app = FastAPI()

# Load trained model
with open('models/hunger_model.pkl', 'rb') as f:
    model = pickle.load(f)

class PredictionRequest(BaseModel):
    hour_of_day: int
    day_of_week: int
    prev_meal_size: int           # 1=light, 2=medium, 3=heavy
    avg_steps_in_gap: float
    avg_temperature: float

@app.post("/predict/hunger")
def predict_hunger(req: PredictionRequest):
    features = np.array([[
        req.hour_of_day,
        req.day_of_week,
        req.prev_meal_size,
        req.avg_steps_in_gap,
        req.avg_temperature,
    ]])
    hours_until_hungry = model.predict(features)[0]
    return {
        "hours_until_hungry": round(float(hours_until_hungry), 2),
        "confidence": 0.82   # Extend with actual confidence intervals
    }

@app.get("/health")
def health():
    return {"status": "ok"}
```

Start the ML server:

```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

---

### Step 4: Build the Backend API

```javascript
// backend/src/routes/meals.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { triggerPrediction } = require('../services/predictionService');

// Log a meal
router.post('/log', async (req, res) => {
  const { userId, mealSize, hungerLevelBefore, notes } = req.body;

  try {
    const meal = await db.query(
      `INSERT INTO meal_logs (user_id, meal_size, hunger_level_before, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, mealSize, hungerLevelBefore, notes]
    );

    // Trigger a new prediction after every meal log
    await triggerPrediction(userId);

    res.json({ success: true, meal: meal.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get meal history
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  const meals = await db.query(
    `SELECT * FROM meal_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 50`,
    [userId]
  );
  res.json(meals.rows);
});

module.exports = router;
```

```javascript
// backend/src/services/predictionService.js
const axios = require('axios');
const { db } = require('../db');
const { getWeatherData } = require('./weatherService');
const { sendPushNotification } = require('./notificationService');

const triggerPrediction = async (userId) => {
  // Get last meal
  const lastMeal = await db.query(
    `SELECT * FROM meal_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 1`,
    [userId]
  );

  if (!lastMeal.rows.length) return;

  // Get user's last known location
  const userLocation = await db.query(
    `SELECT lat, lon FROM user_locations WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [userId]
  );

  const weather = userLocation.rows.length
    ? await getWeatherData(userLocation.rows[0].lat, userLocation.rows[0].lon)
    : { temperature: 22, humidity: 50 };

  const meal = lastMeal.rows[0];
  const mealSizeMap = { light: 1, medium: 2, heavy: 3 };

  // Call ML model
  const mlResponse = await axios.post(`${process.env.ML_SERVER_URL}/predict/hunger`, {
    hour_of_day: new Date().getHours(),
    day_of_week: new Date().getDay(),
    prev_meal_size: mealSizeMap[meal.meal_size] || 2,
    avg_steps_in_gap: 2000,    // Replace with actual step data
    avg_temperature: weather.temperature,
  });

  const { hours_until_hungry } = mlResponse.data;
  const nextHungerAt = new Date(Date.now() + hours_until_hungry * 60 * 60 * 1000);

  // Save prediction
  await db.query(
    `INSERT INTO predictions (user_id, next_hunger_at, confidence)
     VALUES ($1, $2, $3)`,
    [userId, nextHungerAt, mlResponse.data.confidence]
  );

  // Schedule notification 15 minutes before predicted hunger
  const notifyAt = new Date(nextHungerAt.getTime() - 15 * 60 * 1000);
  scheduleNotification(userId, notifyAt, `You'll likely be hungry around ${nextHungerAt.toLocaleTimeString()}. Time to prep a healthy snack!`);
};

module.exports = { triggerPrediction };
```

---

### Step 5: Build the Mobile Frontend

#### Home Screen — Dashboard

```javascript
// mobile/src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HydrationScore from '../components/HydrationScore';
import HungerTimer from '../components/HungerTimer';
import MealLogButton from '../components/MealLogButton';
import WaterLogButton from '../components/WaterLogButton';
import { fetchPredictions } from '../services/api';

export default function HomeScreen() {
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    fetchPredictions().then(setPrediction);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Good morning, Alex 👋</Text>
      <Text style={styles.subtitle}>Here's your health snapshot</Text>

      <HungerTimer nextMealAt={prediction?.nextHungerAt} />
      <HydrationScore score={prediction?.hydrationScore} />

      <View style={styles.actions}>
        <MealLogButton />
        <WaterLogButton />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', marginTop: 40 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  actions: { marginTop: 20, gap: 12 },
});
```

#### Hydration Score Component

```javascript
// mobile/src/components/HydrationScore.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HydrationScore({ score = 0.7 }) {
  const percentage = Math.round(score * 100);
  const color = percentage > 70 ? '#4CAF50' : percentage > 40 ? '#FF9800' : '#F44336';
  const label = percentage > 70 ? 'Well Hydrated' : percentage > 40 ? 'Drink Some Water' : 'Dehydration Risk!';

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.title}>💧 Hydration Score</Text>
      <Text style={[styles.score, { color }]}>{percentage}%</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 14, color: '#666' },
  score: { fontSize: 48, fontWeight: 'bold' },
  label: { fontSize: 16, fontWeight: '600' },
});
```

---

### Step 6: Integrate AI Nudge System

Use Claude or another LLM to make notifications feel personal and intelligent, not robotic.

```javascript
// backend/src/services/aiNudgeService.js
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const generateNudgeMessage = async (context) => {
  const { hoursUntilHungry, hydrationScore, lastMealSize, temperature } = context;

  const prompt = `
You are Companion_tracker, a friendly and caring health AI companion. 
Generate a single, warm, concise push notification message (max 100 characters) based on:

- Hours until user will be hungry: ${hoursUntilHungry.toFixed(1)}
- Hydration score (0-1): ${hydrationScore}
- Last meal size: ${lastMealSize}
- Current temperature: ${temperature}°C

Be encouraging, not alarming. Be specific and personal, not generic.
Return ONLY the notification message text.
  `;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].text;
};

module.exports = { generateNudgeMessage };
```

Example outputs from the AI nudge system:

- *"Your next meal is due in ~1.5hrs. Prep a healthy snack now! 🍎"*
- *"It's 34°C outside and you haven't had water in 2 hours. Drink up! 💧"*
- *"You tend to skip lunch on Tuesdays. Your meeting ends at 1PM — eat before it! 🥗"*

---

### Step 7: Connect Everything & Test

#### Run All Services

```bash
# Terminal 1 - Backend API
cd backend && npm run dev

# Terminal 2 - ML Model Server
cd ml && uvicorn server:app --reload --port 8000

# Terminal 3 - Mobile App
cd mobile && npx expo start

# Optional: Docker Compose (runs all services at once)
docker-compose up
```

#### Test the Full Flow

```bash
# 1. Log a meal
curl -X POST http://localhost:3000/api/meals/log \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123", "mealSize": "medium", "hungerLevelBefore": 7}'

# 2. Get prediction
curl http://localhost:3000/api/predictions/user-123

# 3. Log water
curl -X POST http://localhost:3000/api/hydration/log \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123", "amountMl": 250}'

# 4. Get hydration score
curl http://localhost:3000/api/hydration/score/user-123
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meals/log` | Log a meal |
| GET | `/api/meals/history/:userId` | Get meal history |
| POST | `/api/hydration/log` | Log water intake |
| GET | `/api/hydration/score/:userId` | Get current hydration score |
| GET | `/api/predictions/:userId` | Get current predictions |
| GET | `/api/insights/:userId` | Get behavioral insights |
| POST | `/api/health-data/sync` | Sync HealthKit/Google Fit data |

---

## MVP Scope (Hackathon Focus)

For a 24–48 hour hackathon, focus on these two features only:

**Priority 1 — Hunger Prediction**
- One-tap meal logging UI
- Time-series prediction model (even a simple linear regression works for demo)
- Push notification before predicted hunger window

**Priority 2 — Hydration Alerts**
- Water intake logging (one-tap)
- Hydration score calculated from intake + activity + temperature
- Alert when score drops below 50%

Everything else (insights, calendar integration, camera logging) is a post-hackathon enhancement.

---

## Future Enhancements

- **Camera food logging** — snap a photo, AI vision model estimates meal type and size automatically
- **Calendar integration** — detect busy blocks and pre-warn about likely meal skipping
- **Wearable sync** — Apple Watch, Fitbit, Garmin for richer biometric data
- **Social features** — accountability partners and shared health goals
- **Doctor integration** — share weekly reports with your physician
- **Menstrual cycle awareness** — adapt hunger and hydration predictions to cycle phase
- **Chronic condition modes** — specialized tracking for diabetes, hypertension, kidney disease

---

## Awards Alignment

| Award | How Companion_tracker Wins It |
|---|---|
| **Tech Visionary** | Personal biological rhythm modeling via time-series ML is an underexplored frontier in consumer health tech |
| **Award Spark** | Every judge has been hangry or had a dehydration headache — the idea lands instantly and emotionally |
| **Dream Team** | Clean role split: ML engineer, mobile dev, backend dev, UX/health researcher — every member has a meaningful lane |
| **Best Implementation** | Live demo: log a meal → see prediction update → receive AI-generated nudge in real time |
| **Best Use of Specific Tech** | Anchor to sponsor stack: Claude API for nudges, Google Health Connect, OpenWeatherMap, Firebase |

---

## Team Roles

| Role | Responsibilities |
|---|---|
| ML Engineer | Feature engineering, model training, FastAPI model server |
| Backend Developer | Node.js API, database schema, weather integration, push notifications |
| Mobile Developer | React Native UI, HealthKit/Google Fit integration, one-tap logging |
| UX / Health Researcher | User flows, insights dashboard, health data accuracy validation, pitch deck |

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

MIT License — feel free to build on this for the hackathon and beyond.

---

> Built with ❤️ at [Hackathon Name] | Theme: Data to Prevention — AI as Your Health Partner