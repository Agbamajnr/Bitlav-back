const express = require('express');
const app = express();

const mountApp = require('./v1/mount-app');

mountApp(app);

module.exports = app;