# DataPilot AI 🚀
### Premium Emerald Glassmorphism Analytics SaaS Platform

DataPilot AI is an intelligent data analytics platform designed for students, researchers, small businesses, and data analysts. It enables users to upload CSV or Excel datasets, perform automated schema and data profiling, ask natural-language analytical questions, generate interactive visualizations, detect statistical anomalies, and perform time-series forecasting.

Built with a **deterministic analytical engine** (Pandas, NumPy, Scikit-Learn, and Statsmodels), DataPilot AI guarantees mathematical correctness with **zero generative hallucinations** and requires **no external paid AI API keys**.

---

## 🌟 Visual Design Reference & Aesthetics

DataPilot AI incorporates the high-end **Emerald Glassmorphism** design language inspired by futuristic SaaS monitoring interfaces:
- **Palette**: Dark charcoal sidebar (`#181C1A`), black-emerald backdrop (`#07130F`), bright mint-green accents (`#69E7B8`, `#45DDA8`), and deep forest emeralds (`#087A5C`).
- **Surfaces**: Frosted glass panels (`backdrop-filter: blur(16px)`), subtle neon glow rims, and rounded card radii (16–24px).
- **Theme Switcher**: Supports seamless 1-click toggling between **Dark Emerald Glass** and **Clean Light Emerald**.
- **Charts & Sparklines**: Interactive Recharts Area, Line, Bar, Donut, and Scatter visualizations with custom glowing tooltips.

---

## 📐 Architecture & Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom glassmorphism and emerald glow tokens
- **Icons**: Lucide React
- **Charting**: Recharts
- **Routing**: React Router v7
- **Architecture**: Modular component architecture (`context/`, `components/`, `layouts/`, `pages/`, `api/`)

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Data Processing**: Pandas & NumPy for vectorized aggregations, rankings, and filters
- **Anomaly Detection**: Scikit-Learn `IsolationForest`, Z-score thresholds, and Tukey's IQR fences
- **Forecasting**: Statsmodels `ExponentialSmoothing` (Holt-Winters double exponential smoothing) and OLS Linear Trend regression with 95% empirical confidence intervals
- **Database**: PostgreSQL (Production) / SQLite with SQLAlchemy 2.0 (Zero-config local development)
- **Authentication**: JWT Bearer tokens with bcrypt password hashing

---

## 🧭 Application Modules & Pages

| Route | Page | Description |
|---|---|---|
| `/` | **Landing Page** | High-conversion hero, live feature preview, transparent architecture disclosure, and 1-click "Explore Demo" CTA. |
| `/dashboard` | **Dashboard Overview** | Executive summary featuring 4 KPI metric cards with sparklines, glowing Area trajectory chart, weekly distribution bars, channels donut chart, and alert center. |
| `/analyze` | **Analyze Data Studio** | Natural-language query interface with supported question chips, deterministic execution duration, and instant visualization toggles. |
| `/datasets` | **My Datasets & Profiler** | Drag-and-drop file uploader, schema type introspector, missing cell auditor, numeric statistics table, paginated raw data preview, and CSV export. |
| `/visualizations` | **Visualizations Studio** | Multi-axis chart builder supporting Bar, Line, Area, Pie/Donut, Scatter, and Data Table exports. |
| `/forecasts` | **Statistical Forecasting** | Time-series projection across 3–12 horizon periods with Holt-Winters linear trend and empirical confidence intervals. |
| `/anomalies` | **Anomaly Detection** | Multivariate Isolation Forest and Z-Score outlier detection with individual deviation explanations. |
| `/reports` | **Executive Reports** | Automated analytical briefing generator synthesizing data integrity, volume drivers, leading concentrations, and outlier flags. |
| `/history` | **Analysis History** | Chronological audit trail of executed queries with duration telemetry and 1-click studio re-runs. |
| `/settings` | **Settings & Telemetry** | Profile preferences, Dark/Light theme toggle, and resource quota usage meters. |
| Drawer | **DataPilot Assistant** | Docked slide-out assistant accessible across any page with instant analytical query calculation. |

---

## 🤖 Supported Natural-Language Query Grammar

DataPilot AI uses a deterministic NLP question interpreter. Supported question patterns include:

1. **Dataset Overview / Summary**:
   - *"Give me a summary of this dataset."*
   - *"Describe this data."*
2. **Top / Bottom Rankings**:
   - *"Show the top five products by revenue."*
   - *"Show the highest 3 regions by sales."*
   - *"Find bottom products by quantity."*
3. **Categorical Comparisons & Aggregations**:
   - *"Compare average sales by region."*
   - *"Breakdown revenue by category."*
4. **Data Completeness & Quality**:
   - *"Which columns contain missing values?"*
   - *"Audit dataset quality and empty cells."*
5. **Time-Series Trends**:
   - *"Show monthly sales trends."*
   - *"Display revenue over time."*
6. **Outliers & Anomalies**:
   - *"Find unusually large transactions."*
   - *"Identify revenue outliers."*
7. **Predictive Forecasting**:
   - *"Forecast the next three periods."*
   - *"Predict future revenue trajectory."*

If a query is outside the documented grammar, DataPilot AI transparently reports the unsupported pattern and suggests working queries tailored to the dataset's actual columns.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node v24.13.0)
- Python 3.12+

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated backend test suite (12 tests)
python -m pytest tests -v

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is live at `http://127.0.0.1:8000` (interactive Swagger docs at `http://127.0.0.1:8000/docs`).

### 2. Frontend Setup
```bash
# Navigate to frontend directory in another terminal
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
The frontend application will be live at `http://127.0.0.1:5173/`.

---

## 🧪 Testing & Verification

The backend includes a comprehensive automated test suite verifying:
- Health check endpoints
- Demo dataset synthesis
- DataFrame schema profiling & numerical statistics
- Natural-language query interpreter (Summary, Top N, Comparisons, Missing Values, Time Trends, Anomalies, Unsupported suggestions)
- Isolation Forest and Z-Score anomaly detectors
- Holt-Winters and linear trend forecasting models

Run tests at any time with:
```bash
cd backend
.\venv\Scripts\python.exe -m pytest tests -v
```

---

## 🌐 Production Deployment Guide

### Free-Tier Deployment Blueprint
- **Frontend**: Deploy on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) using `npm run build` with root directory set to `frontend` and output set to `dist`.
- **Backend**: Deploy on [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io) using `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Database**: Connect to [Neon](https://neon.tech) or [Supabase](https://supabase.com) by setting `DATABASE_URL=postgresql://user:pass@host/dbname`.

### Environment Variables (.env)
```env
PROJECT_NAME="DataPilot AI"
SECRET_KEY="your-production-jwt-secret-key"
DATABASE_URL="sqlite:///./datapilot.db" # Or postgresql://user:pass@host:5432/datapilot
MAX_UPLOAD_SIZE_BYTES=52428800 # 50 MB
```

---

## 📄 License
MIT License. Built for Computer Science graduation capstone and production SaaS demonstration.
