export interface Hospital {
  id: string;
  name: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    emergency: string;
    website: string;
  };
  beds: {
    er: { available: number; total: number };
    icu: { available: number; total: number };
    pediatric: { available: number; total: number };
    maternity: { available: number; total: number };
  };
  waitTimes: {
    er: number;
    pediatric: number;
  };
  features: {
    traumaLevel: string;
    teachingHospital: boolean;
    has24EmergencyServices: boolean;
    hasHelicopterPad: boolean;
    hasPharmacy: boolean;
    hasSurgicalSuites: boolean;
    hasLaboratory: boolean;
    hasImaging: boolean;
    hasFreeParking: boolean;
  };
  specialties: string[];
  insurance: string[];
  lastUpdated: string;
  distance?: number; // in miles
  travelTime?: number; // in minutes
}

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "1",
    name: "St. Mary's Medical Center",
    type: "General Acute Care Hospital",
    address: {
      street: "1234 Healthcare Drive",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
      coordinates: { lat: 37.7849, lng: -122.4094 },
    },
    contact: {
      phone: "(415) 555-1234",
      emergency: "(415) 555-9999",
      website: "https://stmarys.org",
    },
    beds: {
      er: { available: 12, total: 20 },
      icu: { available: 5, total: 15 },
      pediatric: { available: 8, total: 12 },
      maternity: { available: 7, total: 10 },
    },
    waitTimes: {
      er: 15,
      pediatric: 10,
    },
    features: {
      traumaLevel: "Level II Trauma Center",
      teachingHospital: false,
      has24EmergencyServices: true,
      hasHelicopterPad: false,
      hasPharmacy: true,
      hasSurgicalSuites: true,
      hasLaboratory: true,
      hasImaging: true,
      hasFreeParking: true,
    },
    specialties: [
      "Cardiology",
      "Emergency Medicine",
      "Pediatrics",
      "Maternity",
      "Orthopedics",
    ],
    insurance: [
      "Medicare",
      "Medicaid",
      "Blue Cross Blue Shield",
      "Aetna",
      "Cigna",
      "United Healthcare",
    ],
    lastUpdated: new Date().toISOString(),
    distance: 2.3,
    travelTime: 8,
  },
  {
    id: "2",
    name: "Central City Hospital",
    type: "General Acute Care Hospital",
    address: {
      street: "5678 Medical Plaza",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      coordinates: { lat: 37.7749, lng: -122.4194 },
    },
    contact: {
      phone: "(415) 555-2345",
      emergency: "(415) 555-8888",
      website: "https://centralcity.org",
    },
    beds: {
      er: { available: 4, total: 18 },
      icu: { available: 1, total: 12 },
      pediatric: { available: 2, total: 8 },
      maternity: { available: 3, total: 8 },
    },
    waitTimes: {
      er: 35,
      pediatric: 25,
    },
    features: {
      traumaLevel: "Level III Trauma Center",
      teachingHospital: true,
      has24EmergencyServices: true,
      hasHelicopterPad: true,
      hasPharmacy: true,
      hasSurgicalSuites: true,
      hasLaboratory: true,
      hasImaging: true,
      hasFreeParking: false,
    },
    specialties: [
      "Emergency Medicine",
      "General Surgery",
      "Internal Medicine",
      "Neurology",
    ],
    insurance: [
      "Medicare",
      "Medicaid",
      "Kaiser Permanente",
      "Blue Cross Blue Shield",
    ],
    lastUpdated: new Date().toISOString(),
    distance: 3.7,
    travelTime: 12,
  },
  {
    id: "3",
    name: "Riverside General Hospital",
    type: "General Acute Care Hospital",
    address: {
      street: "910 Riverside Boulevard",
      city: "San Francisco",
      state: "CA",
      zip: "94104",
      coordinates: { lat: 37.7649, lng: -122.3994 },
    },
    contact: {
      phone: "(415) 555-3456",
      emergency: "(415) 555-7777",
      website: "https://riversidegeneral.org",
    },
    beds: {
      er: { available: 1, total: 15 },
      icu: { available: 0, total: 10 },
      pediatric: { available: 1, total: 6 },
      maternity: { available: 0, total: 5 },
    },
    waitTimes: {
      er: 90,
      pediatric: 75,
    },
    features: {
      traumaLevel: "Not a Trauma Center",
      teachingHospital: false,
      has24EmergencyServices: true,
      hasHelicopterPad: false,
      hasPharmacy: true,
      hasSurgicalSuites: false,
      hasLaboratory: true,
      hasImaging: false,
      hasFreeParking: true,
    },
    specialties: [
      "Emergency Medicine",
      "Family Medicine",
      "Internal Medicine",
    ],
    insurance: ["Medicare", "Medicaid"],
    lastUpdated: new Date().toISOString(),
    distance: 1.8,
    travelTime: 6,
  },
  {
    id: "4",
    name: "UCSF Benioff Children's Hospital",
    type: "Pediatric Specialty Hospital",
    address: {
      street: "1825 Fourth Street",
      city: "San Francisco",
      state: "CA",
      zip: "94158",
      coordinates: { lat: 37.7649, lng: -122.3894 },
    },
    contact: {
      phone: "(415) 555-4567",
      emergency: "(415) 555-6666",
      website: "https://ucsf.edu/benioff",
    },
    beds: {
      er: { available: 6, total: 25 },
      icu: { available: 8, total: 20 },
      pediatric: { available: 15, total: 50 },
      maternity: { available: 0, total: 0 },
    },
    waitTimes: {
      er: 20,
      pediatric: 15,
    },
    features: {
      traumaLevel: "Level I Pediatric Trauma Center",
      teachingHospital: true,
      has24EmergencyServices: true,
      hasHelicopterPad: true,
      hasPharmacy: true,
      hasSurgicalSuites: true,
      hasLaboratory: true,
      hasImaging: true,
      hasFreeParking: false,
    },
    specialties: [
      "Pediatric Emergency",
      "Pediatric Surgery",
      "Neonatology",
      "Pediatric Cardiology",
      "Pediatric Oncology",
    ],
    insurance: [
      "Medicare",
      "Medicaid",
      "All major insurance accepted",
    ],
    lastUpdated: new Date().toISOString(),
    distance: 4.1,
    travelTime: 14,
  },
  {
    id: "5",
    name: "California Pacific Medical Center",
    type: "General Acute Care Hospital",
    address: {
      street: "2333 Buchanan Street",
      city: "San Francisco",
      state: "CA",
      zip: "94115",
      coordinates: { lat: 37.7899, lng: -122.4344 },
    },
    contact: {
      phone: "(415) 555-5678",
      emergency: "(415) 555-5555",
      website: "https://cpmc.org",
    },
    beds: {
      er: { available: 3, total: 22 },
      icu: { available: 2, total: 18 },
      pediatric: { available: 1, total: 10 },
      maternity: { available: 5, total: 12 },
    },
    waitTimes: {
      er: 45,
      pediatric: 50,
    },
    features: {
      traumaLevel: "Level II Trauma Center",
      teachingHospital: false,
      has24EmergencyServices: true,
      hasHelicopterPad: false,
      hasPharmacy: true,
      hasSurgicalSuites: true,
      hasLaboratory: true,
      hasImaging: true,
      hasFreeParking: true,
    },
    specialties: [
      "Cardiology",
      "Maternity",
      "Orthopedics",
      "Emergency Medicine",
      "Women's Health",
    ],
    insurance: [
      "Medicare",
      "Blue Cross Blue Shield",
      "Aetna",
      "United Healthcare",
    ],
    lastUpdated: new Date().toISOString(),
    distance: 3.2,
    travelTime: 11,
  },
  {
    id: "6",
    name: "San Francisco General Hospital",
    type: "Public Hospital - Level I Trauma Center",
    address: {
      street: "1001 Potrero Avenue",
      city: "San Francisco",
      state: "CA",
      zip: "94110",
      coordinates: { lat: 37.7557, lng: -122.4044 },
    },
    contact: {
      phone: "(415) 555-6789",
      emergency: "(415) 555-4444",
      website: "https://sfgh.org",
    },
    beds: {
      er: { available: 18, total: 40 },
      icu: { available: 12, total: 30 },
      pediatric: { available: 6, total: 15 },
      maternity: { available: 4, total: 10 },
    },
    waitTimes: {
      er: 25,
      pediatric: 30,
    },
    features: {
      traumaLevel: "Level I Trauma Center",
      teachingHospital: true,
      has24EmergencyServices: true,
      hasHelicopterPad: true,
      hasPharmacy: true,
      hasSurgicalSuites: true,
      hasLaboratory: true,
      hasImaging: true,
      hasFreeParking: true,
    },
    specialties: [
      "Trauma",
      "Emergency Medicine",
      "Burn Center",
      "Neurosurgery",
      "Cardiology",
      "All Specialties",
    ],
    insurance: [
      "All insurance accepted",
      "Uninsured accepted",
      "Medicare",
      "Medicaid",
    ],
    lastUpdated: new Date().toISOString(),
    distance: 2.8,
    travelTime: 10,
  },
];

export function getAvailabilityStatus(
  hospital: Hospital,
): "high" | "medium" | "low" {
  const totalAvailable =
    hospital.beds.er.available + hospital.beds.icu.available;
  if (totalAvailable >= 8) return "high";
  if (totalAvailable >= 3) return "medium";
  return "low";
}

export function getAvailabilityColor(
  status: "high" | "medium" | "low",
): string {
  switch (status) {
    case "high":
      return "green";
    case "medium":
      return "yellow";
    case "low":
      return "red";
  }
}

// Function to get real hospitals from backend
export async function getRealHospitals() {
  const realHospitals = await fetchRealHospitals();
  return realHospitals.length > 0 ? realHospitals : MOCK_HOSPITALS;
}

// Export function to fetch from backend
export async function fetchRealHospitals(): Promise<Hospital[]> {
  try {
    const response = await fetch('http://localhost:8000/api/hospitals');
    const data = await response.json();
    
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
        traumaLevel: h.specialties.some((s: string) => s.toLowerCase().includes('trauma')) 
          ? "Level I Trauma Center" 
          : "Not a Trauma Center",
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
    console.error("Failed to fetch from backend:", error);
    return MOCK_HOSPITALS; // Fallback to mock data
  }
}