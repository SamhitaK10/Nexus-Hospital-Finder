import { useMemo, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Hospital, getAvailabilityStatus, getAvailabilityColor } from '@/app/data/hospitalData';

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];

interface GoogleMapComponentProps {
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital | null) => void;
  userLocation?: { lat: number; lng: number };
  center?: { lat: number; lng: number };
  zoom?: number;
}

// Default center (San Francisco)
const defaultCenter = { lat: 37.7749, lng: -122.4194 };
const defaultZoom = 11;

export function GoogleMapComponent({
  hospitals,
  selectedHospital,
  onSelectHospital,
  userLocation,
  center = defaultCenter,
  zoom = defaultZoom,
}: GoogleMapComponentProps) {
  // Load Google Maps API
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Debug: Log API key status (first 10 chars only for security)
  useEffect(() => {
    if (apiKey) {
      console.log('Google Maps API Key loaded:', apiKey.substring(0, 10) + '...');
    } else {
      console.error('Google Maps API key is missing! Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
    }
  }, [apiKey]);
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  const mapCenter = useMemo(() => {
    if (selectedHospital) {
      return {
        lat: selectedHospital.address.coordinates.lat,
        lng: selectedHospital.address.coordinates.lng,
      };
    }
    if (userLocation) {
      return userLocation;
    }
    return center;
  }, [selectedHospital, userLocation, center]);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    }),
    []
  );

  const getMarkerIcon = useCallback((hospital: Hospital) => {
    if (!isLoaded || !window.google) return undefined;
    
    const status = getAvailabilityStatus(hospital);
    const color = getAvailabilityColor(status);
    
    // Create custom marker icon based on availability
    const iconColor = color === 'green' ? '#00FF00' : color === 'yellow' ? '#FFFF00' : '#FF0000';
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: iconColor,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
    };
  }, [isLoaded]);

  if (loadError) {
    console.error('Google Maps load error:', loadError);
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-4 max-w-md">
          <p className="text-red-600 font-semibold text-lg mb-2">Error loading Google Maps</p>
          <p className="text-sm text-gray-600 mt-2 mb-4">
            {loadError.message || 'Failed to load Google Maps JavaScript API'}
          </p>
          <div className="text-left text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
            <p className="font-semibold">Troubleshooting steps:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Verify your API key is correct in the .env file</li>
              <li>Ensure "Maps JavaScript API" is enabled in Google Cloud Console</li>
              <li>Check API key restrictions (if any) allow your domain</li>
              <li>Verify billing is enabled for your Google Cloud project</li>
              <li>Check browser console for detailed error messages</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold">Google Maps API Key Missing</p>
          <p className="text-sm text-gray-600 mt-2">
            Please set VITE_GOOGLE_MAPS_API_KEY in your .env file and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={mapCenter}
      zoom={zoom}
      options={mapOptions}
      onLoad={(map) => {
        // Fit bounds to show all hospitals if there are any
        if (hospitals.length > 0 && window.google) {
          const bounds = new window.google.maps.LatLngBounds();
          hospitals.forEach((hospital) => {
            bounds.extend({
              lat: hospital.address.coordinates.lat,
              lng: hospital.address.coordinates.lng,
            });
          });
          if (userLocation) {
            bounds.extend(userLocation);
          }
          map.fitBounds(bounds);
        }
      }}
    >
      {/* User Location Marker */}
      {userLocation && isLoaded && window.google && (
        <Marker
          position={userLocation}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          }}
          title="Your Location"
        />
      )}

      {/* Hospital Markers */}
      {hospitals.map((hospital) => {
        const isSelected = selectedHospital?.id === hospital.id;
        const status = getAvailabilityStatus(hospital);
        
        return (
          <Marker
            key={hospital.id}
            position={{
              lat: hospital.address.coordinates.lat,
              lng: hospital.address.coordinates.lng,
            }}
            icon={getMarkerIcon(hospital)}
            title={hospital.name}
            onClick={() => onSelectHospital(hospital)}
            animation={isSelected && window.google ? window.google.maps.Animation.BOUNCE : undefined}
          >
            {isSelected && (
              <InfoWindow
                onCloseClick={() => onSelectHospital(null)}
                position={{
                  lat: hospital.address.coordinates.lat,
                  lng: hospital.address.coordinates.lng,
                }}
              >
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-lg mb-1">{hospital.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{hospital.address.street}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">ER Beds:</span>
                      <span className={`font-semibold ${
                        hospital.beds.er.available > 5 ? 'text-green-600' :
                        hospital.beds.er.available > 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {hospital.beds.er.available} / {hospital.beds.er.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">ICU Beds:</span>
                      <span className={`font-semibold ${
                        hospital.beds.icu.available > 3 ? 'text-green-600' :
                        hospital.beds.icu.available > 1 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {hospital.beds.icu.available} / {hospital.beds.icu.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Wait Time:</span>
                      <span>{hospital.waitTimes.er} min</span>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        status === 'high' ? 'bg-green-100 text-green-700' :
                        status === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {status.toUpperCase()} AVAILABILITY
                      </span>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        );
      })}
    </GoogleMap>
  );
}
