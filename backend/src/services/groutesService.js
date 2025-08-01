import polyline from '@mapbox/polyline';
import { supabase } from '../config/database.js';

class GoogleRoutesService {
    static async fetchRoute(origin, destination) {
        const response = await fetch(process.env.GOOGLE_ROUTE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': process.env.ROUTES_Google_API_KEY,
                'X-Goog-FieldMask': `
                    routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.polyline.encodedPolyline
                `
            },
            body: JSON.stringify({
                origin: origin,
                destination: destination,
            })
        });

        const data = await response.json();
        if (!data.routes || data.routes.length === 0) {
            throw new Error('No routes found');
        }

        const route = data.routes[0];
        const encodedPolyline = route.polyline.encodedPolyline;

        // Decode polyline
        const decodedCoordinates = polyline.decode(encodedPolyline).map(([lat, lng]) => ({ lat: lat.toFixed(6), lng: lng.toFixed(6) }));

        // ✅ Pick every 4th coordinate
        const sampledCoordinates = decodedCoordinates.filter((_, index) => index % 11 === 0);

        return {
            distance: route.distanceMeters,
            duration: route.duration,
            encodedPolyline,
            decodedCoordinates: sampledCoordinates
        };
    }
}

export default GoogleRoutesService;
