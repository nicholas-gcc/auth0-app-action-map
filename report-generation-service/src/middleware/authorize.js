const jwt = require('jsonwebtoken');
const axios = require('axios');

/**
 * Middleware to check if the user has the Manager role
 * @param {Object} req - The incoming request object containing User token and Management API token
 * @param {Object} res - The outgoing response object
 * @param {Function} next - The next middleware in the stack
 * @returns {void}
 */
async function checkRole(req, res, next) {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    // If there's no authorization header, send a 401 status
    if (!authHeader) {
        return res.sendStatus(401);
    }

    // Extract the JWT token from the authorization header
    const token = authHeader.split(' ')[1];

    // Decode the token to get the user id
    const decoded = jwt.decode(token);
    const userId = decoded.sub;

    try {
        // Get the user's roles from the API
        const response = await axios.get(`${process.env.MANAGEMENT_API_DOMAIN}users/${userId}/roles`, {
        headers: {
            Authorization: `Bearer ${req.access_token}`
            }
        });

        // Check if the user has the Manager role
        const roles = response.data;
        const hasManagerRole = roles.some(role => role.id === process.env.AUTH0_MANAGER_ROLE_ID);

        // If the user doesn't have the Manager role, set req.hideTriggers to true
        if (!hasManagerRole) {
            req.hideTriggers = true;
        }

        // Continue to the next middleware
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error checking user roles');
    }
}

module.exports = {
  checkRole,
};
