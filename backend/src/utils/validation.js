import Joi from "joi";

const validationSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"))
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        "any.required": "Password is required",
      }),
    name: Joi.string().min(2).max(50).required().messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name cannot exceed 50 characters",
      "any.required": "Name is required",
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      "any.required": "Refresh token is required",
    }),
  }),

  updateProfile: Joi.object({
    email: Joi.string().email().optional().messages({
      "string.email": "Please provide a valid email address",
    }),
    firstName: Joi.string().min(1).max(50).optional().messages({
      "string.min": "First name must be at least 1 character long",
      "string.max": "First name cannot exceed 50 characters",
    }),
    lastName: Joi.string().min(1).max(50).optional().messages({
      "string.min": "Last name must be at least 1 character long",
      "string.max": "Last name cannot exceed 50 characters",
    }),
    profilePhoto: Joi.string().uri().optional().allow('').messages({
      "string.uri": "Profile photo must be a valid URL",
    }),
    profilePictureUrl: Joi.string().uri().optional().allow('').messages({
      "string.uri": "Profile picture URL must be a valid URL",
    }),
    bio: Joi.string().max(500).optional().allow('').messages({
      "string.max": "Bio cannot exceed 500 characters",
    }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  updateSettings: Joi.object({
    theme: Joi.string().valid('light', 'dark').optional().messages({
      "any.only": "Theme must be either 'light' or 'dark'",
    }),
    emailNotifications: Joi.boolean().optional(),
    twoFactorEnabled: Joi.boolean().optional(),
  }).min(1).messages({
    'object.min': 'At least one setting must be provided for update'
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      "any.required": "Current password is required",
    }),
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"))
      .required()
      .messages({
        "string.min": "New password must be at least 8 characters long",
        "string.pattern.base":
          "New password must contain at least one uppercase letter, one lowercase letter, and one number",
        "any.required": "New password is required",
      }),
  }),
};

const destinationSchemas = {
  createDestination: Joi.object({
    location: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Location must be at least 2 characters',
        'string.max': 'Location cannot exceed 100 characters',
        'any.required': 'Location is required'
      }),
    riskLevel: Joi.string()
      .valid('low', 'medium', 'high', 'critical')
      .required()
      .messages({
        'any.only': 'Risk level must be one of: low, medium, high, critical',
        'any.required': 'Risk level is required'
      })
  }),

  updateDestination: Joi.object({
    location: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    riskLevel: Joi.string()
      .valid('low', 'medium', 'high', 'critical')
      .optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  })
};

const validateInput = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path[0],
      message: detail.message,
    }));
    return { isValid: false, errors };
  }

  return { isValid: true, data: value };
};

export { validationSchemas, destinationSchemas, validateInput };