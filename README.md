# 🏥 NEXUS - AI Hospital Bed Finder

A multi-agent AI system that provides real-time hospital bed availability across all 50 US states. The system analyzes patient symptoms, searches 100+ hospitals, and recommends the optimal facility based on bed availability, distance, wait times, and specialty match. This platform focuses on emergency routing efficiency, not medical diagnosis. When multiple hospitals match criteria, it explains recommendations using a multi-agent pipeline with triage, search, and recommendation layers.

## 🌐 Live Demo
[YOUR_DEPLOYMENT_URL]

## 🖼 Demo Preview
<p align="center">
  <img src="https://github.com/user-attachments/assets/63ee4a01-958f-4417-bcb5-22f14389570c" width="520" alt="Interactive map preview"/>
  <img src="https://github.com/user-attachments/assets/834e09bb-d023-4c58-bab3-e9fad6f9384f" width="260" alt="AI recommendation preview"/>
</p>

<p align="center">
  <em>Left: Interactive map with color-coded bed availability across all 50 states. Right: AI assistant recommending a hospital with reasoning and ER bed count.</em>
</p>


## 🖼 Demo Overview

Type your symptoms to receive instant recommendations including hospital name with availability status (HIGH/MEDIUM/LOW), real-time bed counts (ER, ICU, Pediatric, Maternity), estimated wait time in minutes, driving distance and time, detailed reasoning for recommendation, alternative hospital options. Example interaction shown: User inputs "chest pain" and receives recommendation for Russell County Hospital marked as "BEST MATCH" with medium availability, 3 ER beds available, plus two backup options (Providence St Joseph Hospital with 2 ER beds, Northern Light Mercy Hospital with 4 ER beds). System provides critical safety note: "Given the urgent nature, please call 911 if symptoms worsen during travel."

## ⚡ Features

Web-based symptom input with natural language understanding, Multi-agent AI recommendation system with 3 specialized agents, Real-time bed availability tracking across 100 hospitals nationwide, Interactive map visualization with color-coded markers showing availability levels, Smart filtering by bed type (ER, ICU, Maternity, Pediatric), distance radius, and wait time, Hospital cards displaying comprehensive information: availability status, bed counts by type, wait times, location details, Urgency-aware recommendations with safety warnings for critical cases, Alternative hospital suggestions ranked by suitability, One-click "View Details & Get Directions" for instant navigation, Mobile-responsive design for use during emergencies, Location services integration with "Use My Location" feature, Live updates indicator showing real-time data refresh, Search functionality by hospital name, address, city, or zip code.

## 🧠 Model Details

Multi-Agent AI Architecture consisting of three specialized agents: Triage Agent analyzes user-provided symptoms and determines urgency level categorized as Critical (immediate life-threatening), Urgent (serious but stable), or Routine (non-emergency), classifies medical condition type such as cardiac, pediatric, trauma, maternity, or general care, extracts key symptom indicators from natural language input. Finder Agent searches 100 hospitals across database and filters results by bed type availability matching patient needs, medical specialty requirements, emergency service capabilities, geographic proximity to patient location, current capacity levels, performs ranking based on weighted scoring of distance, wait time, bed availability, specialty match quality, and hospital rating. Recommender Agent evaluates all matching options from Finder Agent, selects optimal hospital using multi-criteria decision algorithm, generates detailed reasoning explaining why this hospital is recommended, provides alternative options ranked by suitability score, adds safety warnings for urgent or critical cases, formats output with actionable information including bed counts, wait times, and navigation prompts.

## 📊 Performance Summary

Coverage: 100 hospitals across all 50 US states plus territories. System Performance: Average API response time under 500 milliseconds, real-time bed availability simulation with updates every 30 seconds, 6 REST API endpoints, map rendering optimized for 100+ markers. Bed Type Tracking: ER, ICU, Maternity, Pediatric beds (0-20+ per type). Availability Status: HIGH (8+ beds, green), MEDIUM (3-7 beds, yellow), LOW (1-2 beds, red). Data Quality: Real hospital names from CMS database, verified addresses and coordinates, authentic ratings, simulated bed counts.

## 🛠 Tech Stack

Frontend: React, TypeScript, Vite, Tailwind CSS, Leaflet.js, Axios. Backend: Python 3.11, FastAPI, Uvicorn, Pydantic, CORS middleware. AI/ML: LangGraph 0.2.59, LangChain 0.3.18, LangChain-Google-Genai 4.2.0, Custom agents, StateGraph, TypedDict. Data: CMS Hospital Database, 100 real hospitals, JSON storage. Deployment: Railway, GitHub, NPM, Environment variables.

## 🚀 Quick Start

Prerequisites: Python 3.11+, Node.js 18+. Backend: pip install -r requirements.txt, python main.py (runs at localhost:8000, docs at /docs). Frontend: cd FrontEnd, npm install, npm run dev (runs at localhost:5173). Testing: Open localhost:5173, use location services or search, view color-coded map, click "Ask AI", type symptoms, receive recommendations, explore alternatives, test filters.

## 📡 API Endpoints

GET /api/hospitals - All 100 hospitals with id, name, address, beds, specialties, ratings. GET /api/hospitals/nearby?lat=X&lng=Y&radius=Z - Nearby hospitals sorted by distance. GET /api/hospitals/{id} - Single hospital details. GET /api/hospitals/filter?bedType=er&available=true&emergency=true - Filtered results. POST /api/chat body: {"message": "symptom"} - AI recommendation with hospital, reasoning, urgency. GET /api/stats - Total hospitals, available beds, average wait, emergency count. Docs: /docs for Swagger UI.

## 📊 Data Sources

100 real hospitals from CMS (Centers for Medicare & Medicaid Services) with official US government data, All 50 states plus territories coverage, Real hospital names, addresses, phone numbers from verified CMS records, Authentic quality ratings and emergency service indicators, Geographic coordinates for accurate mapping, Simulated real-time bed availability for demonstration (ER, ICU, Maternity, Pediatric counts), Hospital specialties including cardiac care, trauma centers, pediatric services, maternity wards, Emergency services verification status, Hospital type classifications (Acute Care, Specialty, Critical Access), 24-hour operation status, Updated capacity information.

## 🎯 Impact

Problem: Patients waste over 2 hours driving to hospitals only to find ERs full, Ambulances visit 3-4 different emergency rooms before locating available beds, Hospitals lose more than $100,000 daily due to operational inefficiency and poor bed management, No centralized system for real-time bed availability across healthcare networks, Critical delays in emergency care lead to preventable patient complications and deaths, Families make dozens of phone calls with no clear answers during medical emergencies, Rural areas especially affected with limited hospital options and no visibility into capacity. 

Solution: Instant nationwide bed visibility across 100 hospitals in all 50 states, AI-powered optimal hospital routing based on symptoms, distance, and capacity, Real-time capacity tracking updated every 30 seconds, Multi-agent system providing intelligent recommendations with transparent reasoning, Geographic search and filtering for immediate area hospitals, Alternative hospital suggestions when first choice unavailable, Safety warnings and 911 recommendations for life-threatening situations. Result: Faster emergency care delivery reducing time to treatment, Reduced operational costs through better resource allocation, Improved patient outcomes with appropriate facility routing, Lives saved through better coordination between patients and hospitals, Decreased ER overcrowding by distributing patients across network, Better utilization of available beds across healthcare system, Reduced ambulance drive time and fuel costs, Empowered patients making informed decisions during emergencies.


## 📄 License

MIT License.
