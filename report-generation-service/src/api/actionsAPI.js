const axios = require('axios');
require('dotenv').config();

/**
 * Handler to get all actions from the API
 * @param {Object} req - The incoming request object
 * @param {Object} res - The outgoing response object
 * @returns {void}
 */
exports.getAllActions = async function(req, res) {
  try {
    // Get all actions from the API
    const response = await axios.get(`${process.env.MANAGEMENT_API_DOMAIN}actions/actions`, {
      headers: {
        Authorization: `Bearer ${req.access_token}`
      }
    });

    // Map to hold the mapping of client application names to action details
    const clientAppToActionMap = {};

    // Loop through all actions
    response.data.actions.forEach(action => {
      // If code field is not defined, skip this iteration
      if (!action.code) {
        return;
      }
      // Regex to find the client application name in the action code
      const regex = /event\.client\.name\s*===\s*"([^"]+)"/;
      const match = action.code.match(regex);

      // If the regex matched, then extract the client application name
      if (match && match[1]) {
        const clientAppName = match[1];

        // If the client application name is not yet a key in the map, then create an empty array
        if (!clientAppToActionMap[clientAppName]) {
          clientAppToActionMap[clientAppName] = { actions: [] };
        }

        // Add the action details to the array associated with the client application name
        clientAppToActionMap[clientAppName].actions.push({
          name: action.name,
          supported_triggers: req.hideTriggers ? undefined : action.supported_triggers
        });
      }
    });

    // Send the mapping as the response
    res.send(clientAppToActionMap);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error getting actions');
  }
}
