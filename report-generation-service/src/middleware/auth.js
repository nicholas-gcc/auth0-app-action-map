/**
 * Note: This authentication middleware is similar to the middleware on the API gateway
 * You can customise this middleware to include more granular permissions or apply
 * additional bsuiness logic.
 */

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

require('dotenv').config();

// JWKS is a set of keys containing the cryptographic keys used to verify any JSON Web Token (JWT) issued by the authorization server.
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_TENANT_DOMAIN}/.well-known/jwks.json`,
});

/**
 * getKey retrieves the signing key from the Auth0 JWKS endpoint
 * @param {object} header - The header from the JWT
 * @param {function} callback - A callback function to be executed after the signing key is retrieved
 */
function getKey(header, callback){
  client.getSigningKey(header.kid, function(err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Middleware to authenticate the user using JWT
 * @param {object} req - The incoming request object from the frontend
 * @param {object} res - The outgoing response object
 * @param {function} next - The next middleware in the stack, transfer control to token retrieval from Management API
 */
module.exports = function(req, res, next) {
  // Get the authorization header
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, getKey, {
      audience: process.env.REPORT_API_DOMAIN, // Report API verifies the token 
      issuer: `https://${process.env.AUTH0_TENANT_DOMAIN}/`, // Token issued by Auth0 tenant
      algorithms: ['RS256']
    }, function(err, decoded) {
      if (err) {
        // If the token is invalid, send a 403 status
        return res.sendStatus(403);
      }
      // Continue to the next middleware
      next();
    });
  } else {
    // If there's no authorization header, send a 401 status
    return res.sendStatus(401);
  }
};