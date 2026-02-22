# Kali-Cavista

**Kali-Cavista** is a state-of-the-art biological health monitoring and conversational navigation ecosystem. It combines advanced data visualization with an accessibility-first voice navigation system, providing deep insights into health metrics like energy, focus, hydration, and emotional resilience.

## 🌟 Key Features

### 🎙️ Conversational Voice Navigation
A revolutionary accessibility system designed for visually impaired users.
- **Two-Way Dialogue**: A continuous, context-aware conversational experience. 
- **Interruptible Playback**: Real-time interruption for a natural flow.
- **Page Context Awareness**: Automatically understands headings, buttons, and links on the current page.
- **TTS Versatility**: Supports ElevenLabs (high-quality), Google Cloud, and local fallbacks.

### 🗺️ Global Health & Composite Twin Maps
High-end "CIA-style" visualizations for global and individual health data.
- **Real-time Animations**: Orbiting graphics and dynamic connections.
- **Responsive Design**: Fully optimized for mobile and web screens.
- **Interactive Layers**: Toggle between global trends and personal "Composite Twin" health models.

### 📊 Comprehensive Health Dashboard
- **Biological Pillars**: Visualizations for Energy & Focus, Hydration Equilibrium, and Emotional Resilience.
- **Personalized Insights**: Pill-style data formatting with strict privacy controls.

---

## 🏗️ Project Architecture

The project is divided into three primary components:

### 1. [Frontend](file:///c:/Users/hp/Desktop/kali-cavista/frontend) (Next.js)
The primary user interface and visualization engine.
- **Tech Stack**: Next.js 16, React 19, Tailwind CSS 4.
- **Animations**: Framer Motion, React Spring, Three.js (Fiber).
- **Core Components**: `VoiceNavigator`, `GlobalHealthMap`, `TopNav`. 

### 2. [Backend](file:///c:/Users/hp/Desktop/kali-cavista/backend) (FastAPI)
The central intelligence and data processing hub.
- **Tech Stack**: Python 3.11+, FastAPI, SQLAlchemy, PostgreSQL.
- **AI Services**: Integration with LLMs (via Groq/OpenRouter) and TTS (ElevenLabs).
- **Key Modules**: Audio routing, conversation management, and TTS services.

### 3. [Mobile](file:///c:/Users/hp/Desktop/kali-cavista/mobile) (Expo)
The companion app for mobile health tracking and interactions.
- **Tech Stack**: React Native, Expo.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL

### Setup Instructions

For a detailed guide on environment variables and API keys, please see [ENVIRONMENT_SETUP.md](file:///c:/Users/hp/Desktop/kali-cavista/ENVIRONMENT_SETUP.md).

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Configure your .env file
python -m uvicorn app.main:app --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
# Configure your .env.local file
npm run dev
```

#### 3. Mobile Setup
```bash
cd mobile
npm install
npx expo start
```

---

## 📚 Documentation
- [Environment Setup Guide](file:///c:/Users/hp/Desktop/kali-cavista/ENVIRONMENT_SETUP.md): Detailed configuration for API keys and endpoints.
- [Voice Navigation System](file:///c:/Users/hp/Desktop/kali-cavista/VOICE_NAVIGATION_README.md): deep dive into the conversational AI features.
- [Changes Summary](file:///c:/Users/hp/Desktop/kali-cavista/CHANGES_SUMMARY.md): History of recent architecture and security improvements.
- [Problems & Solutions](file:///c:/Users/hp/Desktop/kali-cavista/PROBLEMS_AND_SOLUTIONS.md): Technical troubleshooting and fixes.

---

## ♿ Accessibility
Kali-Cavista is built with accessibility as a core priority. The voice navigation system provides a fully verbal interface for the entire application, ensuring that health data is accessible to everyone.
