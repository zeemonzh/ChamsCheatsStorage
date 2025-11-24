// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  console.error('API error ->', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Server error'
  });
};

module.exports = errorHandler;

