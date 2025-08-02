// hooks/useDirections.ts
import { useState, useCallback } from "react";
import { Route } from "@/services/routeService";

// In your useDirections hook (likely in src/hooks/useDirections.ts)
export const useDirections = (isLoaded: boolean) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string | null>(null); // Add this line

  const calculateRoute = useCallback(async (route: Route) => {
    if (!isLoaded) return;

    const directionsService = new google.maps.DirectionsService();
    
    try {
      const results = await directionsService.route({
        origin: route.coordinates.source,
        destination: route.coordinates.destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      
      setDirections(results);
      
      // Extract distance information
      if (results.routes[0]?.legs[0]?.distance) {
        setDistance(results.routes[0].legs[0].distance.text);
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      setDirections(null);
      setDistance(null);
    }
  }, [isLoaded]);

  return { directions, distance, calculateRoute }; // Add distance to the return
};
