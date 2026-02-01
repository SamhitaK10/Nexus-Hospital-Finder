const API_URL = "http://localhost:8000";

export async function fetchHospitals() {
  try {
    const response = await fetch(`${API_URL}/api/hospitals`);
    const data = await response.json();
    
    // Transform your backend data to match frontend format
    return data.hospitals.map((h: any) => ({
      id: h.id.toString(),
      name: h.name,
      type: h.hospital_type || "General Acute Care Hospital",
      address: {
        street: h.address,
        city: h.city,
        state: h.state,
        zip: h.zip,
        coordinates: {
          lat: h.lat,
          lng: h.lng,
        },
      },
      contact: {
        phone: h.phone,
        emergency: h.phone,
        website: "",
      },
      beds: {
        er: { available: h.beds.er, total: h.beds.er + 10 },
        icu: { available: h.beds.icu, total: h.beds.icu + 5 },
        pediatric: { available: h.beds.pediatric, total: h.beds.pediatric + 5 },
        maternity: { available: h.beds.maternity, total: h.beds.maternity + 5 },
      },
      waitTimes: {
        er: h.waitTime,
        pediatric: h.waitTime + 5,
      },
      features: {
        traumaLevel: h.specialties.includes("Trauma") ? "Level I Trauma Center" : "Not a Trauma Center",
        teachingHospital: false,
        has24EmergencyServices: h.emergency_services,
        hasHelicopterPad: false,
        hasPharmacy: true,
        hasSurgicalSuites: true,
        hasLaboratory: true,
        hasImaging: true,
        hasFreeParking: true,
      },
      specialties: h.specialties,
      insurance: ["Medicare", "Medicaid"],
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch hospitals:", error);
    return [];
  }
}