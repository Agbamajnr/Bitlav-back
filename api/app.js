const express = require('express');
const app = express();

const mountApp = require('./v1/mount-app');

mountApp(app);

// cron job
// async function checkForDeposits

// setInterval(({

// }, 3600000)

module.exports = app;