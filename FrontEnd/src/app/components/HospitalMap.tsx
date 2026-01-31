import { useState, useEffect } from 'react';
import { MapPin, Navigation, Filter, Search, MessageSquare, Menu, X, FileText } from 'lucide-react';
import { MOCK_HOSPITALS, Hospital, getAvailabilityStatus, getAvailabilityColor, fetchRealHospitals } from '@/app/data/hospitalData';
import { HospitalCard } from '@/app/components/HospitalCard';
import { HospitalDetailModal } from '@/app/components/HospitalDetailModal';
import { FilterDialog } from '@/app/components/FilterDialog';
import { AIChat } from '@/app/components/AIChat';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface HospitalMapProps {
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital | null) => void;
  onShowPRD: () => void;
}

export function HospitalMap({ selectedHospital, onSelectHospital, onShowPRD }: HospitalMapProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
// Load real hospitals from backend
useEffect(() => {
  fetchRealHospitals().then(realHospitals => {
    if (realHospitals.length > 0) {
      setHospitals(realHospitals);
      setFilteredHospitals(realHospitals);
    }
  });
}, []);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [showFilters, setShowFilters] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [userLocation] = useState({ lat: 37.7749, lng: -122.4194 }); // San Francisco

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

  // Apply search and filters
  useEffect(() => {
    let filtered = hospitals;

    if (searchQuery) {
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredHospitals(filtered);
  }, [searchQuery, hospitals, activeFilters]);

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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search hospitals or location..."
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
                  Sorted by distance
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
          <div className="hidden md:flex flex-1 bg-gradient-to-br from-gray-100 to-gray-200 relative">
            {/* Map Grid Background */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>

            {/* Hospital Markers */}
            {filteredHospitals.map((hospital, index) => {
              const status = getAvailabilityStatus(hospital);
              const color = getAvailabilityColor(status);
              
              // Position markers based on coordinates (simplified)
              const top = 20 + (index * 15) % 60;
              const left = 20 + (index * 25) % 70;

              return (
                <div
                  key={hospital.id}
                  className="absolute cursor-pointer transition-transform hover:scale-110"
                  style={{ top: `${top}%`, left: `${left}%` }}
                  onClick={() => onSelectHospital(hospital)}
                >
                  <div className={`w-12 h-12 bg-${color}-500 border-4 border-white rounded-full shadow-lg flex items-center justify-center ${
                    selectedHospital?.id === hospital.id ? 'ring-4 ring-blue-500' : ''
                  }`}>
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-300 rounded px-2 py-1 whitespace-nowrap text-xs shadow-lg">
                    {hospital.name.split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>
              );
            })}

            {/* User Location */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-blue-600 border-4 border-white rounded-full shadow-lg animate-pulse"></div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded px-2 py-1 text-xs whitespace-nowrap">
                Your Location
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-8 right-8 space-y-2">
              <Button size="icon" variant="secondary" className="w-12 h-12 shadow-lg">
                <span className="text-xl">+</span>
              </Button>
              <Button size="icon" variant="secondary" className="w-12 h-12 shadow-lg">
                <span className="text-xl">−</span>
              </Button>
              <Button size="icon" variant="secondary" className="w-12 h-12 shadow-lg">
                <Navigation className="w-5 h-5" />
              </Button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-8 left-8 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg">
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
    </>
  );
}
