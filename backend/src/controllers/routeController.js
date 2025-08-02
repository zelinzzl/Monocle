import RouteService from "../services/routeService.js";

class RouteController {
  // Create a new route
  static async createRoute(req, res) {
    try {
      const newRoute = await RouteService.createRoute(req.body);
      return res.status(201).json(newRoute);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Fetch all routes for a user
  static async getUserRoutes(req, res) {
    const { userId } = req.params;
    const { limit, offset } = req.query;

    try {
      const routes = await RouteService.getUserRoutes(userId, limit, offset);
      return res.status(200).json(routes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Update a route
  static async updateRoute(req, res) {
    const { routeId } = req.params;
    try {
      const updatedRoute = await RouteService.updateRoute(routeId, req.body);
      return res.status(200).json(updatedRoute);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteRoute(req, res) {
    const { routeId } = req.params;
    try {
      const deletedRoute = await RouteService.deleteRoute(routeId);
      return res.status(200).json(deletedRoute);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
export default RouteController;

