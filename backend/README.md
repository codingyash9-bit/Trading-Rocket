# Trading Rocket Backend

FastAPI-powered backend for AI trading dashboard.

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Edit `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Server
```bash
uvicorn main:app --reload --port 8000
```

### 4. Access API
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

---

## API Endpoints

### Market Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market/{symbol}` | Get stock data |
| GET | `/api/market/{symbol}/intraday` | Get intraday data |
| POST | `/api/market/summary` | Multiple stocks |
| GET | `/api/market/indian/stocks` | Available stocks |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Analyze stock |
| POST | `/api/analyze/batch` | Multiple stocks |
| GET | `/api/analyze/technical/{symbol}` | Technical indicators |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | AI chat |

### Simulation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/simulate` | Investment simulation |
| POST | `/api/simulate/monte-carlo` | Monte Carlo |
| POST | `/api/simulate/stock-price` | Price simulation |
| POST | `/api/simulate/portfolio` | Portfolio allocation |

---

## Example Usage

### Market Data
```bash
curl http://localhost:8000/api/market/RELIANCE
```

### Analysis
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol": "RELIANCE", "risk_tolerance": "medium"}'
```

### Chat
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Is RELIANCE a good buy?"}'
```

### Simulation
```bash
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"initial_amount": 100000, "years": 5, "expected_return": 15}'
```

---

## Response Format

```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "error": "Error message"
}
```