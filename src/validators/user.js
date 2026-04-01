import Joi from 'joi';

const createSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('viewer', 'analyst', 'admin').required()
});

const updateSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  role: Joi.string().valid('viewer', 'analyst', 'admin').optional(),
  status: Joi.string().valid('active', 'inactive').optional()
}).or('name', 'role', 'status');

const validate = (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    return error.details.map(d => d.message).join(', ');
  }
  return null;
};

export function validateCreateUser(req, res, next) {
  const err = validate(createSchema, req.body);
  if (err) return res.status(400).json({ error: err });
  next();
}

export function validateUpdateUser(req, res, next) {
  const err = validate(updateSchema, req.body);
  if (err) return res.status(400).json({ error: err });
  next();
}
