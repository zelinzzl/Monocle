import DestinationService from '../services/destinationService.js';
import { validateInput, destinationSchemas } from '../utils/validation.js';

// Enhanced UUID validation helper
const isValidUUID = (str) => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  // More flexible UUID regex that handles different UUID versions
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str.trim());
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

      console.log(`Getting destination - Raw ID: "${id}", User: ${userId}`);

      // Validate UUID format with better error message
      if (!isValidUUID(id)) {
        console.log(`Invalid UUID format: "${id}"`);
        return res.status(400).json({
          success: false,
          error: 'Invalid destination ID format',
          details: `The ID "${id}" is not a valid UUID format. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
        });
      }

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

      console.log(`Update request - Raw ID: "${id}", User: ${userId}, Body:`, req.body);

      // Validate UUID format with better error message
      if (!isValidUUID(id)) {
        console.log(`Invalid UUID format for update: "${id}"`);
        return res.status(400).json({
          success: false,
          error: 'Invalid destination ID format',
          details: `The ID "${id}" is not a valid UUID format. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
        });
      }

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
          error: 'Destination not found or does not belong to user'
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

      console.log(`Delete request - Raw ID: "${id}", User: ${userId}`);

      // Validate UUID format with better error message
      if (!isValidUUID(id)) {
        console.log(`Invalid UUID format for delete: "${id}"`);
        return res.status(400).json({
          success: false,
          error: 'Invalid destination ID format',
          details: `The ID "${id}" is not a valid UUID format. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
        });
      }

      // Check if destination exists and belongs to user
      const existingDestination = await DestinationService.getDestinationById(id, userId);
      console.log('Existing destination for delete:', existingDestination);
      
      if (!existingDestination) {
        return res.status(404).json({
          success: false,
          error: 'Destination not found or does not belong to user'
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

      console.log(`Update last checked - Raw ID: "${id}", User: ${userId}`);

      // Validate UUID format
      if (!isValidUUID(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid destination ID format',
          details: `The ID "${id}" is not a valid UUID format. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
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

  /**
   * Debug endpoint to help troubleshoot issues
   */
  static async debugDestination(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      res.json({
        success: true,
        debug: {
          receivedId: id,
          idType: typeof id,
          idLength: id ? id.length : 0,
          isValidUUID: isValidUUID(id),
          userId: userId,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default DestinationController;