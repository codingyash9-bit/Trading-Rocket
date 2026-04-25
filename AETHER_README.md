# Project A.E.T.H.E.R. - Setup Instructions

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.local` and update:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=aether_db
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** - update `MONGODB_URI` with your connection string.

### 4. Run Development Server

```bash
npm run dev
```

### 5. Access the Application

Open http://localhost:3000/aether

## Features

- **4 Image Uploads**: Schematic, EM Field Graph, Gravimetric Data, Power Curve
- **Form Inputs**: System name, theoretical framework, target application
- **AI Analysis**: Gemini Vision processes images and returns physics analysis
- **Results Dashboard**: Color-coded plausibility score (0-100), detailed analysis cards
- **MongoDB Persistence**: All experiments saved to `aetherExperiments` collection

## API Endpoint

```
POST /api/aether/evaluate
Content-Type: multipart/form-data

Fields:
- systemName (string)
- theoreticalFramework (string)
- targetApplication (string)
- schematic (file, optional)
- emField (file, optional)
- gravimetric (file, optional)
- powerCurve (file, optional)
```

## MongoDB Schema

Collection: `aetherExperiments`

```json
{
  "systemName": "string",
  "theoreticalFramework": "string",
  "targetApplication": "string",
  "imagesProcessed": "number",
  "analysis": { /* AetherAnalysis object */ },
  "timestamp": "ISO date string"
}
```

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **AI**: Google Gemini 2.0 Flash (Vision)
- **Database**: MongoDB with mongodb driver
- **Image Processing**: Built-in (no heavy processing - images sent directly to AI)
