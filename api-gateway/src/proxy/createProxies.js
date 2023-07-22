const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

/**
 * Creates proxy middleware for the auth service and the report service.
 * 
 * @returns {object} - Object containing the auth service proxy middleware and the report service proxy middleware
 */
function createProxies() {
  // Use environment variables for Docker hostnames, fallback to localhost if not set
  const reportServiceHostname = process.env.REPORT_SERVICE_HOSTNAME ? `http://${process.env.REPORT_SERVICE_HOSTNAME}` : 'http://localhost';
  const reportServicePort = process.env.REPORT_SERVICE_PORT || 3001;

  const reportServiceProxy = createProxyMiddleware({
    target: `${reportServiceHostname}:${reportServicePort}`,
    changeOrigin: true,
    pathRewrite: {
      '^/report': '/'
    },
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers['access-control-allow-origin'] = '*';
    }
  });

  return { reportServiceProxy };
}

module.exports = createProxies;



