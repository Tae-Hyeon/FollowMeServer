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

db.User = require('./user')(sequelize, Sequelize);

db.Info = require('./info')(sequelize, Sequelize);
db.InfoLike = require('./info_like')(sequelize, Sequelize);
db.InfoReview = require('./info_review')(sequelize, Sequelize);
db.InfoTag = require('./info_tag')(sequelize, Sequelize);
db.Tag = require('./tag')(sequelize, Sequelize);

// Model간 관계
//InfoLike fk - User, Info {id}     N:M
db.User.hasMany(db.InfoLike, { foreignKey: 'user_id', sourceKey: 'id'});
db.Info.hasMany(db.InfoLike, { foreignKey: 'info_id', sourceKey: 'id'});
db.User.belongsToMany(db.Info, { through: 'info_like', foreignKey: 'user_id', sourceKey: 'id'});
db.Info.belongsToMany(db.User, { through: 'info_like', foreignKey: 'info_id', sourceKey: 'id'});

//InfoReview fk - User, Info {id}     N:M
db.User.hasMany(db.InfoLike, { foreignKey: 'user_id', sourceKey: 'id'});
db.Info.hasMany(db.InfoLike, { foreignKey: 'info_id', sourceKey: 'id'});
// unique -> foreign key 1:1로 중복 허용
db.User.belongsToMany(db.Info, { 
  through: {
    model: 'info_review',
    unique: false
  }, 
  foreignKey: 'user_id', 
  sourceKey: 'id'
});
db.Info.belongsToMany(db.User, { 
  through: {
    model: 'info_review',
    unique: false
  }, 
  foreignKey: 'info_id', 
  sourceKey: 'id'
});

//InfoTag fk - Info, Tag {id}     N:M
db.Info.hasMany(db.InfoTag, { foreignKey: 'info_id', sourceKey: 'id'});
db.Tag.hasMany(db.InfoTag, { foreignKey: 'tag_id', sourceKey: 'id'});
db.Info.belongsToMany(db.Tag, { through: 'info_tag'});
db.Tag.belongsToMany(db.Info, { through: 'info_tag'});

module.exports = db;
