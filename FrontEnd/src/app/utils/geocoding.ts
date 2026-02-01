/**
 * Geocode an address/place name to coordinates using Google Maps Geocoding API
 */
export async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<{ lat: number; lng: number; formattedAddress: string }> {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    } else if (data.status === 'ZERO_RESULTS') {
      throw new Error('No results found for this location. Please try a different address or city name.');
    } else if (data.status === 'REQUEST_DENIED') {
      throw new Error('Geocoding request denied. Please check your API key.');
    } else {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to geocode address. Please check your internet connection.');
  }
}

/**
 * Use Google Maps Places Autocomplete (requires Places library to be loaded)
 */
export function createAutocomplete(
  input: HTMLInputElement,
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void
): google.maps.places.Autocomplete | null {
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    return null;
  }

  const autocomplete = new window.google.maps.places.Autocomplete(input, {
    types: ['geocode', 'establishment'],
    fields: ['geometry', 'formatted_address', 'name'],
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      onPlaceSelect(place);
    }
  });

  return autocomplete;
}
