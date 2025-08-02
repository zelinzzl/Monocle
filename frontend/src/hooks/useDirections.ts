// hooks/useDirections.ts
import { useState, useCallback } from "react";
import { Route } from "@/services/routeService";

export const useDirections = (isLoaded: boolean) => {
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  const calculateRoute = useCallback(
    (route: Route) => {
      if (!isLoaded) return;

      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: route.coordinates.source,
          destination: route.coordinates.destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    },
    [isLoaded]
  );

  return { directions, calculateRoute };
};
