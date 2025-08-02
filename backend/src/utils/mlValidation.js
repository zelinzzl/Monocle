// backend/utils/mlValidation.js
import Joi from "joi";

const mlSchemas = {
  analyzeRoute: Joi.object({
    start: Joi.object({
      lat: Joi.number().min(-90).max(90).required().messages({
        "number.min": "Start latitude must be between -90 and 90",
        "number.max": "Start latitude must be between -90 and 90",
        "any.required": "Start latitude is required",
      }),
      lng: Joi.number().min(-180).max(180).required().messages({
        "number.min": "Start longitude must be between -180 and 180",
        "number.max": "Start longitude must be between -180 and 180",
        "any.required": "Start longitude is required",
      }),
      name: Joi.string().max(100).optional().messages({
        "string.max": "Start location name cannot exceed 100 characters",
      }),
    }).required(),
    
    end: Joi.object({
      lat: Joi.number().min(-90).max(90).required().messages({
        "number.min": "End latitude must be between -90 and 90",
        "number.max": "End latitude must be between -90 and 90",
        "any.required": "End latitude is required",
      }),
      lng: Joi.number().min(-180).max(180).required().messages({
        "number.min": "End longitude must be between -180 and 180",
        "number.max": "End longitude must be between -180 and 180",
        "any.required": "End longitude is required",
      }),
      name: Joi.string().max(100).optional().messages({
        "string.max": "End location name cannot exceed 100 characters",
      }),
    }).required(),
    
    waypoints: Joi.array().items(
      Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
      })
    ).max(10).optional().messages({
      "array.max": "Maximum 10 waypoints allowed",
    }),
    
    vehicleId: Joi.string().min(1).max(50).required().messages({
      "string.min": "Vehicle ID is required",
      "string.max": "Vehicle ID cannot exceed 50 characters",
      "any.required": "Vehicle ID is required",
    }),
    
    routeName: Joi.string().min(1).max(100).optional().messages({
      "string.min": "Route name must be at least 1 character long",
      "string.max": "Route name cannot exceed 100 characters",
    }),
  }),

  riskAssessment: Joi.object({
    vehicleId: Joi.string().min(1).max(50).required().messages({
      "string.min": "Vehicle ID is required",
      "string.max": "Vehicle ID cannot exceed 50 characters",
      "any.required": "Vehicle ID is required",
    }),
    
    currentLocation: Joi.object({
      lat: Joi.number().min(-90).max(90).required().messages({
        "number.min": "Current latitude must be between -90 and 90",
        "number.max": "Current latitude must be between -90 and 90",
        "any.required": "Current latitude is required",
      }),
      lng: Joi.number().min(-180).max(180).required().messages({
        "number.min": "Current longitude must be between -180 and 180",
        "number.max": "Current longitude must be between -180 and 180",
        "any.required": "Current longitude is required",
      }),
    }).required(),
    
    routeData: Joi.object({
      coordinates: Joi.array().items(
        Joi.object({
          lat: Joi.number().min(-90).max(90).required(),
          lng: Joi.number().min(-180).max(180).required(),
        })
      ).min(1).max(100).optional().messages({
        "array.min": "At least 1 coordinate required",
        "array.max": "Maximum 100 coordinates allowed",
      }),
      distance: Joi.number().min(0).max(10000).optional().messages({
        "number.min": "Distance must be positive",
        "number.max": "Distance cannot exceed 10,000 km",
      }),
      duration: Joi.number().min(0).max(1440).optional().messages({
        "number.min": "Duration must be positive",
        "number.max": "Duration cannot exceed 1440 minutes (24 hours)",
      }),
    }).optional(),
  }),

  weatherCoordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).required().messages({
      "number.min": "Latitude must be between -90 and 90",
      "number.max": "Latitude must be between -90 and 90",
      "any.required": "Latitude is required",
    }),
    lng: Joi.number().min(-180).max(180).required().messages({
      "number.min": "Longitude must be between -180 and 180",
      "number.max": "Longitude must be between -180 and 180",
      "any.required": "Longitude is required",
    }),
    days: Joi.number().integer().min(1).max(14).optional().default(7).messages({
      "number.min": "Days must be at least 1",
      "number.max": "Days cannot exceed 14",
      "number.integer": "Days must be a whole number",
    }),
  }),

  // South African coordinate validation for better accuracy
  southAfricanCoordinates: Joi.object({
    lat: Joi.number().min(-35).max(-22).required().messages({
      "number.min": "Latitude must be within South African bounds (-35 to -22)",
      "number.max": "Latitude must be within South African bounds (-35 to -22)",
      "any.required": "Latitude is required",
    }),
    lng: Joi.number().min(16).max(33).required().messages({
      "number.min": "Longitude must be within South African bounds (16 to 33)",
      "number.max": "Longitude must be within South African bounds (16 to 33)",
      "any.required": "Longitude is required",
    }),
  }),
};

// Calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRadians = (degrees) => {
  return degrees * (Math.PI/180);
};

// ML-specific helper functions
const mlValidationHelpers = {
  // Validate if coordinates are within South Africa
  validateSouthAfricanBounds: (lat, lng) => {
    return lat >= -35 && lat <= -22 && lng >= 16 && lng <= 33;
  },

  // Validate vehicle ID exists in system
  validateVehicleId: (vehicleId) => {
    const validVehicleIds = ['vehicle_1', 'vehicle_2']; // From your mock data
    return validVehicleIds.includes(vehicleId);
  },

  // Validate route distance is reasonable
  validateRouteDistance: (coordinates) => {
    if (!coordinates || coordinates.length < 2) return true;
    
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const dist = calculateDistance(
        coordinates[i-1].lat, coordinates[i-1].lng,
        coordinates[i].lat, coordinates[i].lng
      );
      totalDistance += dist;
    }
    
    return totalDistance <= 2000; // Max 2000km route
  },

  calculateDistance,
  toRadians
};

// Enhanced validation function for ML endpoints
const validateMLInput = (schema, data, options = {}) => {
  const { error, value } = schema.validate(data, { 
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
      code: detail.type
    }));
    return { isValid: false, errors };
  }

  // Additional ML-specific validations
  const additionalErrors = [];

  // Check South African bounds if specified
  if (options.requireSouthAfricanBounds) {
    if (value.start && !mlValidationHelpers.validateSouthAfricanBounds(value.start.lat, value.start.lng)) {
      additionalErrors.push({
        field: 'start',
        message: 'Start location must be within South African bounds',
        code: 'bounds.invalid'
      });
    }
    if (value.end && !mlValidationHelpers.validateSouthAfricanBounds(value.end.lat, value.end.lng)) {
      additionalErrors.push({
        field: 'end',
        message: 'End location must be within South African bounds',
        code: 'bounds.invalid'
      });
    }
    if (value.currentLocation && !mlValidationHelpers.validateSouthAfricanBounds(value.currentLocation.lat, value.currentLocation.lng)) {
      additionalErrors.push({
        field: 'currentLocation',
        message: 'Current location must be within South African bounds',
        code: 'bounds.invalid'
      });
    }
  }

  // Validate vehicle ID exists
  if (value.vehicleId && !mlValidationHelpers.validateVehicleId(value.vehicleId)) {
    additionalErrors.push({
      field: 'vehicleId',
      message: 'Vehicle ID not found. Available vehicles: vehicle_1, vehicle_2',
      code: 'vehicle.notfound'
    });
  }

  // Validate route distance
  if (value.routeData && value.routeData.coordinates) {
    if (!mlValidationHelpers.validateRouteDistance(value.routeData.coordinates)) {
      additionalErrors.push({
        field: 'routeData.coordinates',
        message: 'Route distance exceeds maximum allowed distance (2000km)',
        code: 'route.distance.exceeded'
      });
    }
  }

  if (additionalErrors.length > 0) {
    return { isValid: false, errors: additionalErrors };
  }

  return { isValid: true, data: value };
};

// Export ML schemas and helpers
export { 
  mlSchemas,
  mlValidationHelpers,
  validateMLInput
};