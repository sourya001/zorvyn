import Joi from 'joi';

const createSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  amount: Joi.number().precision(2).required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().min(2).required(),
  date: Joi.date().iso().required(),
  notes: Joi.string().optional()
}).unknown(false);

const updateSchema = Joi.object({
  amount: Joi.number().precision(2).optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  category: Joi.string().min(2).optional(),
  date: Joi.date().iso().optional()
}).or('amount', 'type', 'category', 'date');

const validate = (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    return error.details.map(d => d.message).join(', ');
  }
  return null;
};

export function validateCreateRecord(req, res, next) {
  const err = validate(createSchema, req.body);
  if (err) return res.status(400).json({ error: err });
  next();
}

export function validateUpdateRecord(req, res, next) {
  const err = validate(updateSchema, req.body);
  if (err) return res.status(400).json({ error: err });
  next();
}
