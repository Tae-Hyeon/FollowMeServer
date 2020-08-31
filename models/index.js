'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config')[env];
const db = {};
const sequelize = new Sequelize ({
  hostname: config.hostname,
  database: config.database,
  username: config.username,
  password: config.password,
  dialect:  config.dialect
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
