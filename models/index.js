'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//db.User = require('./user')(sequelize, Sequelize);
db.Info = require('./info')(sequelize, Sequelize);
db.InfoLike = require('./infolike')(sequelize, Sequelize);

// info-user 좋아요 Relation
// db.User.hasMany(db.InfoLike, { foreignKey: 'uid', sourceKey: 'id'});
// db.InfoLike.belongsTo(db.User, { foreignKey: 'uid', sourceKey: 'id'});
db.Info.hasMany(db.InfoLike, { foreignKey: 'iid', sourceKey: 'id'});
db.InfoLike.belongsTo(db.Info, { foreignKey: 'iid', sourceKey: 'id'});

module.exports = db;
