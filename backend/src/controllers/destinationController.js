import DestinationService from '../services/destinationService.js';
import { validateInput, destinationSchemas } from '../utils/validation.js';

// UUID validation helper
const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

class DestinationController {
  /**
   * Get all destinations for logged-in user
   */
  static async getDestinations(req, res) {
    try {
      const userId = req.user.id;
      const destinations = await DestinationService.getUserDestinations(userId);

      res.json({
        success: true,
        data: {
          destinations,
          count: destinations.length
        }
      });
    } catch (error) {
      console.error('Get destinations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch destinations',
        message: error.message
      });
    }
  }

  /**
   * Get single destination by ID
   */
  static async getDestination(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate UUID format
      if (!isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid destination ID format'
        });
      }

      console.log(`Getting destination - ID: ${id}, User: ${userId}`);

      const destination = await DestinationService.getDestinationById(id, userId);

      if (!destination) {
        return res.status(404).json({
          success: false,
          error: 'Destination not found'
        });
      }

      res.json({
        success: true,
        data: { destination }
      });
    } catch (error) {
      console.error('Get destination error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch destination',
        message: error.message
      });
    }
  }

  /**
   * Create new destination
   */
  static async createDestination(req, res) {
    try {
      // Validate input
      const validation = validateInput(destinationSchemas.createDestination, req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const userId = req.user.id;
      const destination = await DestinationService.createDestination(userId, validation.data);

      res.status(201).json({
        success: true,
        message: 'Destination created successfully',
        data: { destination }
      });
    } catch (error) {
      console.error('Create destination error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create destination',
        message: error.message
      });
    }
  }

  /**
   * Update destination
   */
  static async updateDestination(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate UUID format
      if (!isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid destination ID format'
        });
      }

      console.log(`Update request - ID: ${id}, User: ${userId}, Body:`, req.body);

      // Validate input
      const validation = validateInput(destinationSchemas.updateDestination, req.body);
      console.log('Validation result:', validation);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Check if destination exists and belongs to user
      const existingDestination = await DestinationService.getDestinationById(id, userId);
      console.log('Existing destination:', existingDestination);
      
      if (!existingDestination) {
        return res.status(404).json({
          success: false,
          error: 'Destination not found'
        });
      }

      const updatedDestination = await DestinationService.updateDestination(id, userId, validation.data);

      res.json({
        success: true,
        message: 'Destination updated successfully',
        data: { destination: updatedDestination }
      });
    } catch (error) {
      console.error('Update destination error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update destination',
        message: error.message
      });
    }
  }

  /**
   * Delete destination
   */
  static async deleteDestination(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate UUID format
      if (!isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid destination ID format'
        });
      }

      console.log(`Delete request - ID: ${id}, User: ${userId}`);

      // Check if destination exists and belongs to user
      const existingDestination = await DestinationService.getDestinationById(id, userId);
      console.log('Existing destination:', existingDestination);
      
      if (!existingDestination) {
        return res.status(404).json({
          success: false,
          error: 'Destination not found'
        });
      }

      await DestinationService.deleteDestination(id, userId);

      res.json({
        success: true,
        message: 'Destination deleted successfully'
      });
    } catch (error) {
      console.error('Delete destination error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete destination',
        message: error.message
      });
    }
  }

  /**
   * Update last checked timestamp
   */
  static async updateLastChecked(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Validate UUID format
      if (!isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid destination ID format'
        });
      }

      const destination = await DestinationService.updateLastChecked(id, userId);

      if (!destination) {
        return res.status(404).json({
          success: false,
          error: 'Destination not found'
        });
      }

      res.json({
        success: true,
        message: 'Last checked updated successfully',
        data: { destination }
      });
    } catch (error) {
      console.error('Update last checked error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update last checked',
        message: error.message
      });
    }
  }
}

export default DestinationController;