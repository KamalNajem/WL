# 🎓 Adaptive E-Learning Platform

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Django-5.2-green?logo=django&logoColor=white" alt="Django">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white" alt="TailwindCSS">
</p>

<p align="center">
  <b>An intelligent e-learning platform that adapts content delivery based on individual learning styles using Machine Learning</b>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Machine Learning](#-machine-learning)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **Adaptive E-Learning Platform** is a modern educational platform that personalizes the learning experience for each student. Using **K-Means clustering** and behavioral analysis, the system identifies each student's learning style (Visual, Auditory, Read/Write, Kinesthetic) and automatically reorders course content to match their preferences.

### 🎯 Key Objectives

- **Personalized Learning**: Adapt content presentation based on individual learning styles
- **Engagement Through Gamification**: Points, levels, and badges to motivate learners
- **Data-Driven Insights**: Analytics dashboard for instructors to track student progress
- **Modern User Experience**: Clean, responsive UI with dark mode support

---

## ✨ Features

### 👨‍🎓 For Students

| Feature | Description |
|---------|-------------|
| 📚 **Course Catalog** | Browse, search, and filter courses by category, difficulty, and tags |
| 🎥 **Video Player** | Custom HTML5 player with progress tracking and resume capability |
| 📝 **VARK Assessment** | 15-question questionnaire to determine learning style |
| 🎮 **Gamification** | Earn XP, level up, and unlock badges (Novice, Scholar, Master, Quiz Whiz) |
| 📊 **Progress Dashboard** | Track completion, points, and achievements |
| 💬 **Comments & Notes** | Take notes and discuss content with peers |
| 🌙 **Dark Mode** | Toggle between light and dark themes |

### 👨‍🏫 For Instructors

| Feature | Description |
|---------|-------------|
| 📈 **Analytics Dashboard** | View student engagement, completion rates, and learning patterns |
| 🧠 **ML Model Retraining** | Retrain the clustering model with new behavioral data |
| 📊 **Style Distribution** | Visualize learning style distribution across students |
| ⚠️ **At-Risk Detection** | Identify students who may need additional support |

### 🤖 Adaptive Learning

| Feature | Description |
|---------|-------------|
| 🔄 **Content Reordering** | Automatically prioritize content based on learning style |
| 📐 **K-Means Clustering** | Group students by behavioral patterns |
| 🎯 **Style Prediction** | Predict learning style from interaction data |
| 📝 **VARK + FSLSM Models** | Support for multiple learning style frameworks |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    (Next.js 16 + React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Courses   │  │  Dashboard  │  │   Profile   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API (Axios)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
│                    (Django 5.2 + DRF)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Courses   │  │  Analytics  │  │ Adaptation  │             │
│  │    API      │  │   Engine    │  │   Engine    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │PostgreSQL │ │  ML Model │ │   Data    │
       │  Database │ │ (K-Means) │ │  Bridge   │
       └───────────┘ └───────────┘ └───────────┘
```

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Theme**: next-themes

### Backend
- **Framework**: Django 5.2
- **API**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: Session-based with CSRF protection
- **ML Library**: scikit-learn

### Machine Learning
- **Algorithm**: K-Means Clustering
- **Preprocessing**: StandardScaler
- **Model Persistence**: joblib
- **Data Processing**: pandas, numpy

---

## 🚀 Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/AsociaLad/adaptive-elearning-platform.git
cd adaptive-elearning-platform
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure database in backend/settings.py
# Update DATABASES with your PostgreSQL credentials

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Seed sample data (optional)
python seed_expanded_content.py

# Start development server
python manage.py runserver
```

### 3. Frontend Setup

```bash
# Navigate to frontend (new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

---

## 📖 Usage

### Student Workflow

1. **Register/Login** - Create an account or sign in
2. **Take VARK Assessment** - Complete the 15-question learning style quiz
3. **Browse Courses** - Explore the course catalog with filters
4. **Start Learning** - Content is automatically sorted by your learning style
5. **Track Progress** - View your dashboard, XP, level, and badges

### Instructor Workflow

1. **Login** - Sign in with instructor credentials
2. **View Analytics** - Access the instructor dashboard
3. **Monitor Students** - Check engagement and identify at-risk learners
4. **Retrain Model** - Update the ML model with new behavioral data

---

## 📁 Project Structure

```
adaptive-elearning-platform/
├── backend/
│   ├── backend/          # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── users/            # User management & authentication
│   │   ├── models.py     # User, StudentProfile models
│   │   ├── views.py      # Auth views (Login, Register, etc.)
│   │   └── serializers.py
│   ├── courses/          # Course management
│   │   ├── models.py     # Course, Module, ContentBlock, Progress
│   │   ├── views.py      # Course API endpoints
│   │   └── serializers.py
│   ├── analytics/        # Analytics & gamification
│   │   ├── models.py     # InteractionLog
│   │   ├── gamification.py  # Points, levels, badges engine
│   │   ├── data_bridge.py   # ML data preparation
│   │   └── views.py
│   ├── adaptation/       # ML-based adaptation
│   │   ├── services.py   # LearningStyleClusterer
│   │   ├── engine.py     # ModelRetrainer
│   │   └── views.py      # Retrain API
│   ├── data/             # ML model storage
│   │   ├── kmeans_model.pkl
│   │   ├── scaler.pkl
│   │   └── merged_dataset.csv
│   └── manage.py
│
├── frontend/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Dashboard
│   │   ├── courses/      # Course catalog & details
│   │   ├── profile/      # User profile
│   │   ├── quizzes/      # VARK assessment
│   │   ├── login/        # Authentication
│   │   └── register/
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Sidebar.tsx
│   │   ├── SmartVideoPlayer.tsx
│   │   └── AppLayout.tsx
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── GamificationContext.tsx
│   ├── lib/              # Utilities
│   │   ├── axios.ts      # API client
│   │   └── utils.ts
│   └── public/
│       └── videos/       # Demo video files
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login user |
| POST | `/api/auth/logout/` | Logout user |
| GET | `/api/auth/me/` | Get current user |
| GET | `/api/auth/csrf/` | Get CSRF token |

### Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses/` | List all courses |
| GET | `/api/courses/{id}/` | Get course details with modules |
| POST | `/api/courses/progress/update/` | Update content progress |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/gamification/` | Get user's XP, level, badges |
| GET | `/api/analytics/instructor/` | Get instructor analytics |

### Adaptation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/adaptation/retrain/` | Retrain ML model |

### Quizzes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes/vark/` | Get VARK questions |
| POST | `/api/quizzes/vark/submit/` | Submit VARK answers |

---

## 🧠 Machine Learning

### How It Works

1. **Data Collection**: Track student interactions (video watch time, quiz scores, study hours, etc.)
2. **Feature Engineering**: Normalize features using StandardScaler
3. **Clustering**: Apply K-Means (k=3) to group similar students
4. **Prediction**: Assign new students to clusters based on behavior
5. **Adaptation**: Reorder content to match predicted learning style

### Learning Style Mapping

| Cluster | Learning Style | Content Priority |
|---------|----------------|------------------|
| 0 | Visual | Videos first |
| 1 | Auditory | Podcasts, audio content |
| 2 | Read/Write | PDFs, text documents |

### Model Files

```
backend/data/
├── kmeans_model.pkl      # Trained K-Means model
├── scaler.pkl            # StandardScaler for normalization
└── merged_dataset.csv    # Training data
```

---

## 📸 Screenshots

### Course Catalog
*Search, filter, and browse courses with rich metadata*

### Video Player
*Custom HTML5 player with progress tracking*

### Dashboard
*Track XP, level, badges, and overall progress*

### Instructor Analytics
*View student engagement and learning style distribution*

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
## 👤 Monitored by

Dr. Najem Kamal

## 👤 Developped by

**AsociaLad**

- GitHub: [@AsociaLad](https://github.com/AsociaLad)

---

<p align="center">
  Made with ❤️ for adaptive learning
</p>
