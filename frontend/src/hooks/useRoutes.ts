import { useState, useEffect, useCallback } from "react";
import {
  Route,
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} from "@/services/routeService";

export const useRoutes = (user_id: string) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    if (!user_id) return;
    setLoading(true);
    try {
      const data = await getRoutes(user_id);
      console.log("Fetched Routes:", data);
      setRoutes(data);
    } catch (err) {
      setError("Failed to fetch routes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user_id]); 

  // Auto-fetch on mount and when user changes
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const addRoute = async (route: Omit<Route, "id">) => {
    try {
      const newRoute = await createRoute(route);
      setRoutes((prev) => [...prev, newRoute]);
      return newRoute;
    } catch (err) {
      setError("Failed to create route");
      console.error(err);
    }
  };

  const editRoute = async (id: string, updates: Partial<Route>) => {
    try {
      const updated = await updateRoute(id, updates);
      setRoutes((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return updated;
    } catch (err) {
      setError("Failed to update route");
      console.error(err);
    }
  };

  const removeRoute = async (id: string) => {
    try {
      await deleteRoute(id);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError("Failed to delete route");
      console.error(err);
    }
  };

  return {
    routes,
    loading,
    error,
    fetchRoutes,
    addRoute,
    editRoute,
    removeRoute,
  };
};
