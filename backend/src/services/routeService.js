import { supabase } from "../config/database.js";

class RouteService {
    // Create a new route
    static async createRoute(routeData) {
        const { user_id, title, origin, destination, category, frequency, coordinates } =
            routeData;
        const { data, error } = await supabase
            .from("routes") 
            .insert([
                {
                    user_id,
                    title,
                    origin,
                    destination,
                    category,
                    frequency,
                    coordinates,
                },
            ])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    }   
}
export default RouteService;
