// src/controllers/routesController.js
import groutesService from '../services/groutesService.js';

class GoogleRoutesController {
  /**
   * Fetch a route between two locations
   */
  static async fetchRoute(req, res) {
    try {
      const { origin, destination } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination are required' });
      }

      const route = await groutesService.fetchRoute(origin, destination);
      return res.status(200).json({
        success: true,
        data: route
      });
    } catch (error) {
      console.error('Error fetching route:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch route',
        message: error.message
      });
    }
  }
}

export default GoogleRoutesController;