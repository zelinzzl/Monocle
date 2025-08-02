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
    
    // Fetch all routes for a user
    static async getUserRoutes(userId, limit = 10, offset = 0) {
        const { data, error } = await supabase
            .from("routes")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);
        return data;
    }

    //Update a route
    static async updateRoute(routeId, routeData) {
        const { data, error } = await supabase
            .from("routes")
            .update(routeData)
            .eq("id", routeId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // Delete a route
    static async deleteRoute(routeId) {
        const { data, error } = await supabase
            .from("routes")
            .delete()
            .eq("id", routeId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }
}
export default RouteService;
