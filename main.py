from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import math
from agents import get_recommendation

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
    hospitals_raw = json.load(f)

# State center coordinates (fallback)
STATE_CENTERS = {
    "CA": {"lat": 36.7783, "lng": -119.4179},
    "NY": {"lat": 42.1657, "lng": -74.9481},
    "TX": {"lat": 31.9686, "lng": -99.9018},
    "FL": {"lat": 27.9944, "lng": -81.7603},
    "AK": {"lat": 64.2008, "lng": -149.4937},
    "AL": {"lat": 32.3182, "lng": -86.9023},
    "AR": {"lat": 35.2010, "lng": -91.8318},
    "AZ": {"lat": 34.0489, "lng": -111.0937},
    "CO": {"lat": 39.5501, "lng": -105.7821},
    "CT": {"lat": 41.6032, "lng": -73.0877},
    "DC": {"lat": 38.9072, "lng": -77.0369},
    "DE": {"lat": 38.9108, "lng": -75.5277},
    "GA": {"lat": 32.1656, "lng": -82.9001},
    "HI": {"lat": 19.8968, "lng": -155.5828},
    "IA": {"lat": 41.8780, "lng": -93.0977},
    "ID": {"lat": 44.0682, "lng": -114.7420},
    "IL": {"lat": 40.6331, "lng": -89.3985},
    "IN": {"lat": 40.2672, "lng": -86.1349},
    "KS": {"lat": 39.0119, "lng": -98.4842},
    "KY": {"lat": 37.8393, "lng": -84.2700},
    "LA": {"lat": 30.9843, "lng": -91.9623},
    "MA": {"lat": 42.4072, "lng": -71.3824},
    "MD": {"lat": 39.0458, "lng": -76.6413},
    "ME": {"lat": 45.2538, "lng": -69.4455},
    "MI": {"lat": 44.3148, "lng": -85.6024},
    "MN": {"lat": 46.7296, "lng": -94.6859},
    "MO": {"lat": 37.9643, "lng": -91.8318},
    "MS": {"lat": 32.3547, "lng": -89.3985},
    "MT": {"lat": 46.8797, "lng": -110.3626},
    "NC": {"lat": 35.7596, "lng": -79.0193},
    "ND": {"lat": 47.5515, "lng": -101.0020},
    "NE": {"lat": 41.4925, "lng": -99.9018},
    "NH": {"lat": 43.1939, "lng": -71.5724},
    "NJ": {"lat": 40.0583, "lng": -74.4057},
    "NM": {"lat": 34.5199, "lng": -105.8701},
    "NV": {"lat": 38.8026, "lng": -116.4194},
    "OH": {"lat": 40.4173, "lng": -82.9071},
    "OK": {"lat": 35.4676, "lng": -97.5164},
    "OR": {"lat": 43.8041, "lng": -120.5542},
    "PA": {"lat": 41.2033, "lng": -77.1945},
    "RI": {"lat": 41.5801, "lng": -71.4774},
    "SC": {"lat": 33.8361, "lng": -81.1637},
    "SD": {"lat": 43.9695, "lng": -99.9018},
    "TN": {"lat": 35.5175, "lng": -86.5804},
    "UT": {"lat": 39.3210, "lng": -111.0937},
    "VA": {"lat": 37.4316, "lng": -78.6569},
    "WA": {"lat": 47.7511, "lng": -120.7401},
    "WI": {"lat": 43.7844, "lng": -88.7879},
    "WV": {"lat": 38.5976, "lng": -80.4549},
    "WY": {"lat": 43.0760, "lng": -107.2903},
    "AS": {"lat": -14.2710, "lng": -170.1322},
    "GU": {"lat": 13.4443, "lng": 144.7937},
    "MP": {"lat": 15.0979, "lng": 145.6739},
    "PR": {"lat": 18.2208, "lng": -66.5901},
    "VI": {"lat": 18.3358, "lng": -64.8963},
}

# Fix coordinates using geocoding
try:
    from geopy.geocoders import Nominatim
    from geopy.exc import GeocoderTimedOut
    import time
    
    geolocator = Nominatim(user_agent="nexus-hospital-finder")
    
    print("Fixing hospital coordinates...")
    hospitals = []
    
    for idx, h in enumerate(hospitals_raw):
        hospital = h.copy()
        
        # Build address string
        address_str = f"{h['address']}, {h['city']}, {h['state']} {h['zip']}, USA"
        
        try:
            location = geolocator.geocode(address_str, timeout=10)
            
            if location:
                hospital['lat'] = location.latitude
                hospital['lng'] = location.longitude
                print(f"✓ {idx+1}/100: {h['name']} - {h['city']}, {h['state']}")
            else:
                # Use state center as fallback
                state = h['state']
                hospital['lat'] = STATE_CENTERS.get(state, {}).get('lat', 39.8283)
                hospital['lng'] = STATE_CENTERS.get(state, {}).get('lng', -98.5795)
                print(f"⚠ {idx+1}/100: {h['name']} - Using state center")
            
            time.sleep(1)  # Rate limiting
            
        except (GeocoderTimedOut, Exception) as e:
            # Use state center as fallback
            state = h['state']
            hospital['lat'] = STATE_CENTERS.get(state, {}).get('lat', 39.8283)
            hospital['lng'] = STATE_CENTERS.get(state, {}).get('lng', -98.5795)
            print(f"✗ {idx+1}/100: {h['name']} - Error, using state center")
        
        hospitals.append(hospital)
    
    # Save fixed data
    with open('hospitals_data_fixed.json', 'w') as f:
        json.dump(hospitals, f, indent=2)
    
    print("\n✅ Coordinates fixed! Saved to hospitals_data_fixed.json")
    
except ImportError:
    print("⚠ geopy not installed. Using original coordinates.")
    print("Run: pip install geopy")
    hospitals = hospitals_raw

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
    """AI recommendation using multi-agent system"""
    
    user_message = message.get('message', '')
    
    try:
        # Use the multi-agent system!
        result = get_recommendation(user_message)
        return result
    except Exception as e:
        # Fallback to simple logic if agents fail
        return {
            "error": str(e),
            "hospital": {},
            "reasoning": "Agent system unavailable",
            "urgency": "unknown"
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