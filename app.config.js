// Import app.json
const appJson = require("./app.json");

// Export the configuration directly
module.exports = {
  ...appJson,
};
