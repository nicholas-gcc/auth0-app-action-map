const axios = require('axios');
require('dotenv').config();

/**
 * Middleware to get the access token for the API
 * @param {Object} req - The incoming request object from authentication middleware
 * @param {Object} res - The outgoing response object
 * @param {Function} next - The next middleware in the stack
 * @returns {void}
 */
module.exports = async function(req, res, next) {
  const data = {
    client_id: process.env.REPORT_SERVICE_CLIENT_ID,
    client_secret: process.env.REPORT_SERVICE_CLIENT_SECRET,
    audience: `${process.env.MANAGEMENT_API_DOMAIN}`,
    grant_type: 'client_credentials'
  };

  try {
    // Request the access token
    const response = await axios.post(`https://${process.env.AUTH0_TENANT_DOMAIN}/oauth/token`, data);
    const access_token = response.data.access_token;

    // Attach the access token to the request object
    req.access_token = access_token;
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error getting access token');
  }

  // Continue to the next middleware
  next();
}
