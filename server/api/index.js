// Vercel serverless function entrypoint for Duo Chat Server
const app = require('../src/index');

module.exports = (req, res) => {
  return app(req, res);
};
