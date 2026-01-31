from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import math

app = FastAPI(title="NEXUS Hospital API")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load hospital data
import os

# Try to load from same directory
json_path = 'hospitals_data.json' if os.path.exists('hospitals_data.json') else '../hospitals_data.json'

with open(json_path, 'r') as f:

@app.get("/")
def root():
    return {"message": "NEXUS Hospital API", "status": "running", "total_hospitals": len(hospitals)}

@app.get("/api/hospitals")
def get_all_hospitals():
    """Get all hospitals"""
    return {"hospitals": hospitals, "count": len(hospitals)}

@app.get("/api/hospitals/{hospital_id}")
def get_hospital(hospital_id: int):
    """Get one hospital by ID"""
    hospital = next((h for h in hospitals if h['id'] == hospital_id), None)
    if hospital:
        return hospital
    return {"error": "Hospital not found"}

@app.get("/api/hospitals/nearby")
def get_nearby_hospitals(lat: float, lng: float, radius: int = 25):
    """Find hospitals near a location"""
    
    def distance(lat1, lng1, lat2, lng2):
        # Simple distance calculation
        return math.sqrt((lat2 - lat1)**2 + (lng2 - lng1)**2) * 69  # rough miles
    
    nearby = []
    for h in hospitals:
        dist = distance(lat, lng, h['lat'], h['lng'])
        if dist <= radius:
            h_copy = h.copy()
            h_copy['distance'] = round(dist, 1)
            nearby.append(h_copy)
    
    # Sort by distance
    nearby.sort(key=lambda x: x['distance'])
    
    return {"hospitals": nearby, "count": len(nearby)}

@app.get("/api/hospitals/filter")
def filter_hospitals(bedType: str = None, available: bool = None, emergency: bool = None):
    """Filter hospitals by criteria"""
    
    filtered = hospitals
    
    # Filter by bed type
    if bedType and bedType != "all":
        filtered = [h for h in filtered if h['beds'].get(bedType, 0) > 0]
    
    # Filter by availability
    if available:
        filtered = [h for h in filtered if h['availableBeds'] > 0]
    
    # Filter by emergency services
    if emergency:
        filtered = [h for h in filtered if h.get('emergency_services', False)]
    
    return {"hospitals": filtered, "count": len(filtered)}

@app.post("/api/chat")
def chat_recommendation(message: dict):
    """AI recommendation endpoint (to be called by Toolhouse/Gemini)"""
    
    user_message = message.get('message', '').lower()
    
    # Simple keyword matching (Gemini will make this smarter)
    if 'chest' in user_message or 'heart' in user_message:
        # Find cardiac hospitals
        cardiac = [h for h in hospitals if any('cardiac' in s.lower() for s in h.get('specialties', [])) and h['beds']['er'] > 0]
        if cardiac:
            best = max(cardiac, key=lambda x: x['availableBeds'])
            return {
                "recommendation": best,
                "reason": f"Recommended for cardiac symptoms. {best['beds']['er']} ER beds available."
            }
    
    elif 'child' in user_message or 'kid' in user_message or 'baby' in user_message:
        # Find pediatric hospitals
        pediatric = [h for h in hospitals if h['beds']['pediatric'] > 0]
        if pediatric:
            best = max(pediatric, key=lambda x: x['beds']['pediatric'])
            return {
                "recommendation": best,
                "reason": f"Recommended for pediatric care. {best['beds']['pediatric']} pediatric beds available."
            }
    
    # Default: hospital with most beds
    best = max(hospitals, key=lambda x: x['availableBeds'])
    return {
        "recommendation": best,
        "reason": f"Hospital with most availability: {best['availableBeds']} beds."
    }

@app.get("/api/stats")
def get_stats():
    """Get overall statistics"""
    total_beds = sum(h['availableBeds'] for h in hospitals)
    avg_wait = sum(h['waitTime'] for h in hospitals) / len(hospitals)
    emergency_count = sum(1 for h in hospitals if h.get('emergency_services'))
    
    return {
        "total_hospitals": len(hospitals),
        "total_available_beds": total_beds,
        "average_wait_time": round(avg_wait, 1),
        "emergency_services": emergency_count
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)