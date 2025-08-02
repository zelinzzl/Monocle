// controllers/RouteRiskController.js
import RouteRiskService from '../services/routeRiskService.js';

class RouteRiskController {

  static async calculateRouteRisk(req, res) {
    try {
      const { departure_time, routeId } = req.body;

      // Validate route ID
      if (!routeId) {
        return res.status(400).json({
          success: false,
          error: 'Route ID is required'
        });
      }

      const departureTime = departure_time ? new Date(departure_time) : new Date();
      
      // Validate departure time
      if (departure_time && isNaN(departureTime.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid departure_time format. Use ISO 8601 format.'
        });
      }

      const riskData = await RouteRiskService.calculateRouteRisk(routeId, departureTime);
      
      res.json({
        success: true,
        data: riskData,
        message: 'Route risk calculated successfully'
      });

    } catch (error) {
      console.error('Route risk calculation error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Route not found',
          message: error.message
        });
      }

      if (error.message.includes('Weather API')) {
        return res.status(503).json({
          success: false,
          error: 'Weather service temporarily unavailable',
          message: 'Risk calculation completed with limited weather data'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to calculate route risk',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  static async compareRouteRisks(req, res) {
    try {
      const { route_ids, departure_time } = req.body;
      
      // Validate input
      if (!Array.isArray(route_ids) || route_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'route_ids array is required and must not be empty'
        });
      }

      if (route_ids.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 10 routes can be compared at once'
        });
      }

      const departureTime = departure_time ? new Date(departure_time) : new Date();
      
      // Validate departure time
      if (departure_time && isNaN(departureTime.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid departure_time format. Use ISO 8601 format.'
        });
      }

      const comparisonResult = await this.routeRiskService.compareRouteRisks(route_ids, departureTime);
      
      res.json({
        success: true,
        data: comparisonResult,
        message: 'Route risks compared successfully'
      });

    } catch (error) {
      console.error('Route comparison error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to compare route risks',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  static async getRouteRiskHistory(req, res) {
    try {
      const { routeId } = req.params;
      const { limit = 10 } = req.query;

      if (!routeId) {
        return res.status(400).json({
          success: false,
          error: 'Route ID is required'
        });
      }

      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          error: 'Limit must be a number between 1 and 100'
        });
      }

      const history = await this.routeRiskService.getRiskHistory(routeId, limitNum);
      
      res.json({
        success: true,
        data: {
          route_id: routeId,
          history: history,
          total_records: history.length
        },
        message: 'Risk history retrieved successfully'
      });

    } catch (error) {
      console.error('Risk history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve risk history',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  static async clearExpiredCache(req, res) {
    try {
      await this.routeRiskService.cleanupExpiredCache();
      
      res.json({
        success: true,
        message: 'Expired cache cleared successfully',
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Cache cleanup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear expired cache',
        message: error.message
      });
    }
  }

  static async getHealthCheck(req, res) {
    try {
      // Basic health check - you could add more comprehensive checks
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      };

      res.json({
        success: true,
        data: healthStatus
      });

    } catch (error) {
      console.error('Health check error:', error);
      res.status(503).json({
        success: false,
        error: 'Service unhealthy',
        message: error.message
      });
    }
  }
}

export default RouteRiskController;