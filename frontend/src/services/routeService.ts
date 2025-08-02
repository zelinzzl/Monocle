import { apiFetch } from "./api";

export interface Route {
  id: string;
  user_id: string;
  title: string;
  origin: string;
  destination: string;
  category: string;
  frequency: string;
  distance?: number;
  duration?: number;
  coordinates: {
    source: { lat: number; lng: number };
    destination: { lat: number; lng: number };
  };
}

// Fetch all routes
export async function getRoutes(userId: string): Promise<Route[]> {
  return apiFetch(`/api/routes/user-routes/${userId}`, { method: "GET" });
}

// Fetch a single route
export async function getRouteById(id: string): Promise<Route> {
  return apiFetch(`/api/routes/${id}`, { method: "GET" });
}

// Create a new route
export async function createRoute(data: Omit<Route, "id">): Promise<Route> {
  return apiFetch("/api/routes/create-route", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Update a route
export async function updateRoute(
  id: string,
  updates: Partial<Route>
): Promise<Route> {
  return apiFetch(`/api/routes/update-route/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// Delete a route
export async function deleteRoute(id: string): Promise<void> {
  return apiFetch(`/api/routes/delete-route/${id}`, { method: "DELETE" });
}

// Geocode address → LatLng
export const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject("Google Maps API not loaded");
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results?.[0]?.geometry?.location) {
        resolve({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        });
      } else {
        reject(new Error(`Geocode failed: ${status}`));
      }
    });
  });
};

// Reverse geocode LatLng → Address
export const reverseGeocode = async (
  location: google.maps.LatLngLiteral
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject("Google Maps API not loaded");
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results?.[0]?.formatted_address) {
        resolve(results[0].formatted_address);
      } else if (results?.[0]?.formatted_address) {
        // Fallback to less precise address if available
        resolve(results[0].formatted_address);
      } else {
        // Fallback to coordinates if no address found
        resolve(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
      }
    });
  });
};

// Calculate route distance and duration
export const calculateRouteDetails = async (
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
): Promise<{ distance: number; duration: number }> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject("Google Maps API not loaded");
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode,
      },
      (response, status) => {
        if (status === "OK" && response?.routes?.[0]?.legs?.[0]) {
          const leg = response.routes[0].legs[0];
          resolve({
            distance: leg.distance?.value || 0, // in meters
            duration: leg.duration?.value || 0, // in seconds
          });
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      }
    );
  });
};