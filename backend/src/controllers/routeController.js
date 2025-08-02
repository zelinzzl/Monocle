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
}
export default RouteController;

