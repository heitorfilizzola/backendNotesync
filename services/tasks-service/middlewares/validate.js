const validate = (schema) => (req, res, next) => {
  try {
    const validData = schema.parse(req.body);
    req.body = validData;
    next();
  } catch (error) {
    return res.status(400).json({ error: error.errors[0].message });
  }
};

module.exports = validate;
