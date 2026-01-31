import { useState, useEffect } from 'react';
import { MapPin, Navigation, Filter, Search, MessageSquare, Menu, X, FileText } from 'lucide-react';
import { MOCK_HOSPITALS, Hospital, getAvailabilityStatus, getAvailabilityColor, fetchRealHospitals } from '@/app/data/hospitalData';
import { HospitalCard } from '@/app/components/HospitalCard';
import { HospitalDetailModal } from '@/app/components/HospitalDetailModal';
import { FilterDialog } from '@/app/components/FilterDialog';
import { AIChat } from '@/app/components/AIChat';
import { GoogleMapComponent } from '@/app/components/GoogleMap';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { calculateDistance, estimateTravelTime, requestUserLocation } from '@/app/utils/geolocation';
import { geocodeAddress } from '@/app/utils/geocoding';

interface HospitalMapProps {
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital | null) => void;
  onShowPRD: () => void;
}

export function HospitalMap({ selectedHospital, onSelectHospital, onShowPRD }: HospitalMapProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [showFilters, setShowFilters] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationSearchError, setLocationSearchError] = useState<string | null>(null);
  const [customLocationName, setCustomLocationName] = useState<string | null>(null);

  // Load real hospitals from backend
  useEffect(() => {
    fetchRealHospitals().then(realHospitals => {
      if (realHospitals.length > 0) {
        setHospitals(realHospitals);
        setFilteredHospitals(realHospitals);
      }
    });
  }, []);

  // Request user location on mount
  useEffect(() => {
    // Check if location was previously denied
    const locationDenied = localStorage.getItem('locationDenied') === 'true';
    if (!locationDenied) {
      setShowLocationDialog(true);
    }
  }, []);

  const handleRequestLocation = async () => {
    setIsRequestingLocation(true);
    setLocationError(null);
    
    try {
      const location = await requestUserLocation();
      setUserLocation(location);
      setShowLocationDialog(false);
      localStorage.removeItem('locationDenied');
    } catch (error: any) {
      console.error('Error getting location:', error);
      setLocationError(
        error.code === 1
          ? 'Location access was denied. You can still use the map, but hospitals won\'t be sorted by distance.'
          : 'Unable to get your location. Please check your browser settings.'
      );
      if (error.code === 1) {
        localStorage.setItem('locationDenied', 'true');
      }
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleSkipLocation = () => {
    setShowLocationDialog(false);
    localStorage.setItem('locationDenied', 'true');
  };

  const handleLocationSearch = async () => {
    if (!locationSearchQuery.trim()) {
      setLocationSearchError('Please enter an address, city, or zip code');
      return;
    }

    setIsGeocoding(true);
    setLocationSearchError(null);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key is not configured');
      }

      const result = await geocodeAddress(locationSearchQuery, apiKey);
      setUserLocation({ lat: result.lat, lng: result.lng });
      setCustomLocationName(result.formattedAddress);
      setLocationSearchQuery('');
      localStorage.removeItem('locationDenied');
    } catch (error: any) {
      console.error('Geocoding error:', error);
      setLocationSearchError(error.message || 'Failed to find location. Please try a different address.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHospitals(prevHospitals => 
        prevHospitals.map(hospital => ({
          ...hospital,
          beds: {
            ...hospital.beds,
            er: {
              ...hospital.beds.er,
              available: Math.max(0, hospital.beds.er.available + (Math.random() > 0.5 ? 1 : -1))
            }
          },
          lastUpdated: new Date().toISOString()
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate distances and sort hospitals when user location is available
  useEffect(() => {
    let processed = hospitals.map(hospital => {
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          hospital.address.coordinates.lat,
          hospital.address.coordinates.lng
        );
        const travelTime = estimateTravelTime(distance);
        return {
          ...hospital,
          distance,
          travelTime,
        };
      }
      return hospital;
    });

    // Sort by distance if user location is available
    if (userLocation) {
      processed.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    // Apply search filter
    if (searchQuery) {
      processed = processed.filter(h => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredHospitals(processed);
  }, [searchQuery, hospitals, activeFilters, userLocation]);

  return (
    <>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">NEXUS</h1>
                  <p className="text-xs text-gray-600">Real-Time Hospital Bed Finder</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">Live Updates</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onShowPRD}
                className="hidden md:flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View PRD
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
            {/* Search and Filter Bar */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              {/* Location Search - Show when user has skipped location */}
              {!userLocation && (
                <div className="space-y-2">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                    <Input
                      type="text"
                      placeholder="Enter address, city, zip code, or hospital name..."
                      value={locationSearchQuery}
                      onChange={(e) => {
                        setLocationSearchQuery(e.target.value);
                        setLocationSearchError(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleLocationSearch();
                        }
                      }}
                      className="pl-10 pr-20"
                    />
                    <Button
                      size="sm"
                      onClick={handleLocationSearch}
                      disabled={isGeocoding || !locationSearchQuery.trim()}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 text-xs"
                    >
                      {isGeocoding ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </div>
                  {locationSearchError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {locationSearchError}
                    </p>
                  )}
                  {customLocationName && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-2 py-1">
                      <p className="text-xs text-green-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {customLocationName}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setUserLocation(null);
                          setCustomLocationName(null);
                          setLocationSearchQuery('');
                        }}
                        className="h-5 w-5 p-0 text-green-700 hover:text-green-900"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Hospital Name Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={userLocation ? "Search hospitals..." : "Search hospitals by name..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                  className="flex-1"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFilters.length}
                    </span>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowChat(true)}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask AI
                </Button>
              </div>
            </div>

            {/* Hospital List */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-gray-900">
                  {filteredHospitals.length} Hospitals Found
                </h2>
                <div className="text-xs text-gray-500">
                  {userLocation ? 'Sorted by distance' : 'All hospitals'}
                </div>
              </div>

              {filteredHospitals.map(hospital => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  onClick={() => onSelectHospital(hospital)}
                />
              ))}
            </div>
          </div>

          {/* Map Area */}
          <div className="hidden md:flex flex-1 relative">
            <GoogleMapComponent
              hospitals={filteredHospitals}
              selectedHospital={selectedHospital}
              onSelectHospital={onSelectHospital}
              userLocation={userLocation || undefined}
            />
            
            {/* Location Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              {userLocation && (
                <Button
                  size="sm"
                  onClick={() => {
                    setUserLocation(null);
                    setCustomLocationName(null);
                    setLocationSearchQuery('');
                  }}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Location
                </Button>
              )}
              {!userLocation && (
                <Button
                  size="sm"
                  onClick={() => setShowLocationDialog(true)}
                  className="bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-300"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Use My Location
                </Button>
              )}
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-8 left-8 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg z-10">
              <h4 className="text-xs font-semibold mb-2">Availability</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>High (8+ beds)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span>Medium (3-7)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Low (1-2)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          onClose={() => onSelectHospital(null)}
        />
      )}

      {showFilters && (
        <FilterDialog
          onClose={() => setShowFilters(false)}
          onApplyFilters={(filters) => {
            setActiveFilters(filters);
            setShowFilters(false);
          }}
          activeFilters={activeFilters}
        />
      )}

      {showChat && (
        <AIChat
          onClose={() => setShowChat(false)}
          onSelectHospital={(hospital) => {
            onSelectHospital(hospital);
            setShowChat(false);
          }}
          hospitals={hospitals}
        />
      )}

      {/* Location Permission Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              Enable Location Services
            </DialogTitle>
            <DialogDescription>
              We'd like to use your location to show you the nearest hospitals and help you find the best care quickly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Your location will be used to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Sort hospitals by distance from you</li>
              <li>Show your location on the map</li>
              <li>Calculate travel times to each hospital</li>
            </ul>
            {locationError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {locationError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleSkipLocation}>
              Skip
            </Button>
            <Button 
              onClick={handleRequestLocation}
              disabled={isRequestingLocation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRequestingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Getting location...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Allow Location
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
