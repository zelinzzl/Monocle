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
  console.log("Creating route with data:", data);
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
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results?.[0]?.geometry?.location) {
        resolve({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        });
      } else {
        reject(`Geocode failed: ${status}`);
      }
    });
  });
};
