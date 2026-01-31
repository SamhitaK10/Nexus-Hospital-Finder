import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { Hospital, getAvailabilityStatus } from '@/app/data/hospitalData';
import { Button } from '@/app/components/ui/button';

interface HospitalCardProps {
  hospital: Hospital;
  onClick: () => void;
}

export function HospitalCard({ hospital, onClick }: HospitalCardProps) {
  const status = getAvailabilityStatus(hospital);
  
  const statusConfig = {
    high: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', badge: 'bg-green-100' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700', badge: 'bg-yellow-100' },
    low: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', badge: 'bg-red-100' }
  };

  const config = statusConfig[status];

  return (
    <div 
      className={`${config.bg} border-2 ${config.border} rounded-lg p-4 cursor-pointer hover:shadow-md transition-all`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-base leading-tight pr-2">{hospital.name}</h3>
        <div className={`${config.badge} ${config.text} text-xs px-2 py-1 rounded font-medium whitespace-nowrap`}>
          {status.toUpperCase()}
        </div>
      </div>

      <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
        <MapPin className="w-4 h-4 flex-shrink-0" />
        <span>
          {hospital.distance !== undefined && hospital.travelTime !== undefined
            ? `${hospital.distance} mi • ${hospital.travelTime} min drive`
            : `${hospital.address.city}, ${hospital.address.state}`
          }
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">ER:</span>
          <span className={`font-medium ${hospital.beds.er.available > 5 ? 'text-green-600' : hospital.beds.er.available > 2 ? 'text-yellow-600' : 'text-red-600'}`}>
            {hospital.beds.er.available} available
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">ICU:</span>
          <span className={`font-medium ${hospital.beds.icu.available > 3 ? 'text-green-600' : hospital.beds.icu.available > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
            {hospital.beds.icu.available} available
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pediatric:</span>
          <span className={`font-medium ${hospital.beds.pediatric.available > 3 ? 'text-green-600' : hospital.beds.pediatric.available > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
            {hospital.beds.pediatric.available}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Wait:</span>
          <span className="font-medium">{hospital.waitTimes.er} min</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Details
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="px-2"
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `tel:${hospital.contact.emergency}`;
          }}
        >
          <Phone className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Updated {new Date(hospital.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
