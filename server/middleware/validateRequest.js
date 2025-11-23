const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    };
};

// Simple validation helper since we aren't using Joi/Zod to keep it lightweight
const validateBody = (requiredFields) => {
    return (req, res, next) => {
        const missing = requiredFields.filter(field => !req.body[field]);
        if (missing.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }
        next();
    };
};

module.exports = { validateBody };
