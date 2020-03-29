const winston = require('winston');

const consoleTransport = new winston.transports.Console();

const winstonOptions = {
  level: process.env.LOG_LEVEL || 'info',
  transports: [consoleTransport],
};
module.exports = new winston.createLogger(winstonOptions);
