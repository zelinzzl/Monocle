// src/controllers/routesController.js
import groutesService from '../services/groutesService.js';
import WeatherService from '../services/weatherService.js'; // Assuming you have a weather service to fetch weather data

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

  static async getRouteWithWeather(req, res) {
        try {
            const { origin, destination } = req.body;

            // Fetch route
            const routeData = await groutesService.fetchRoute(origin, destination);

            // Fetch weather for each coordinate
            const weatherData = await WeatherService.getWeatherForCoordinates(routeData.decodedCoordinates);

            return res.json({
                ...routeData,
                weatherAlongRoute: weatherData
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }
}

export default GoogleRoutesController;