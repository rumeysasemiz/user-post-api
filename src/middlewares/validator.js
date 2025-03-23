const { body, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');
// hata kontrolü için middleware

const validateRequest = (req, res, next) => {
    const  errors = validationResult(req);
    if (!errors.isEmpty()) {
        
        logger.error(`Validation error: ${JSON.stringify(errors.array())}`);

        return res.status(400).json({errors: errors.array()});
    }
    next();
    
};

// post dogrulaması
const postValidator = [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('content')
        .notEmpty().withMessage('Content is required'),
    body('tags')
        .isArray().withMessage('Tags must be an array')
        .notEmpty().withMessage('At least one tag is required'),
    validateRequest,
];

// User dogrulaması 
const userValidator = [
    body('username')
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be valid'),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest
];
  
module.exports = {
    postValidator,
    userValidator
};
  