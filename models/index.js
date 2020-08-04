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
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
  
// }

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
//   })
//   .forEach(file => {
//     console.log(file);
//     const model = sequelize['import'](path.join(__dirname, file));
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize);

db.Info = require('./info')(sequelize, Sequelize);
db.InfoLike = require('./info_like')(sequelize, Sequelize);
db.InfoReview = require('./info_review')(sequelize, Sequelize);
db.InfoTag = require('./info_tag')(sequelize, Sequelize);
db.Tag = require('./tag')(sequelize, Sequelize);

db.Course = require('./course')(sequelize, Sequelize);
db.CourseLike = require('./course_like')(sequelize, Sequelize);
db.CourseReview = require('./course_review')(sequelize, Sequelize);
db.CourseShare = require('./course_share')(sequelize, Sequelize);

// Model간 관계
console.log(db.User);
//InfoLike fk - User, Info {id}     N:M
db.User.belongsToMany(db.Info, { through: 'info_like', foreignKey: 'user_id', sourceKey: 'id'});
db.Info.belongsToMany(db.User, { through: 'info_like', foreignKey: 'info_id', sourceKey: 'id'});

//InfoReview fk - User, Info {id}     N:M
db.User.belongsToMany(db.Info, { through: 'info_review', foreignKey: 'user_id', sourceKey: 'id'});
db.Info.belongsToMany(db.User, { through: 'info_review', foreignKey: 'info_id', sourceKey: 'id'});

//InfoTag fk - Info, Tag {id}     N:M
db.Info.hasMany(db.InfoTag, { foreignKey: 'info_id', sourceKey: 'id'});
db.Tag.hasMany(db.InfoTag, { foreignKey: 'tag_id', sourceKey: 'id'});
db.Info.belongsToMany(db.Tag, { through: 'info_tag'});
db.Tag.belongsToMany(db.Info, { through: 'info_tag'});
// db.InfoTag.belongsTo(db.Info, {foreignKey: 'info_id', sourceKey: 'id'});
// db.InfoTag.belongsTo(db.Tag, {foreignKey: 'tag_id', sourceKey: 'id'});

//User {id, nickname} -> Course {user_id, user_nickname}      1:N
db.User.hasMany(db.Course, { foreignKey: 'user_id', sourceKey: 'id'});
db.Course.belongsTo(db.User, { foreignKey: 'user_id', sourceKey: 'id'});
db.User.hasMany(db.Course, { foreignKey: 'user_nickname', sourceKey: 'nickname'});
db.Course.belongsTo(db.User, { foreignKey: 'user_nickname', sourceKey: 'nickname'});

//Info {id} -> Course {course_info1, course_info2, course_info3}      1:N
db.Info.hasMany(db.Course, { foreignKey: 'course_info1', sourceKey: 'id'});
db.Course.belongsTo(db.Info, { foreignKey: 'course_info1', sourceKey: 'id'});
db.Info.hasMany(db.Course, { foreignKey: 'course_info2', sourceKey: 'id'});
db.Course.belongsTo(db.Info, { foreignKey: 'course_info2', sourceKey: 'id'});
db.Info.hasMany(db.Course, { foreignKey: 'course_info3', sourceKey: 'id'});
db.Course.belongsTo(db.Info, { foreignKey: 'course_info3', sourceKey: 'id'});

//CourseLike fk - User, Course {id}     N:M
db.User.belongsToMany(db.Course, { through: 'course_like', foreignKey: 'user_id', sourceKey: 'id'});
db.Course.belongsToMany(db.User, { through: 'course_like', foreignKey: 'course_id', sourceKey: 'id'});

//CouresReview fk - User, Course {id}     N:M
db.User.belongsToMany(db.Course, { through: 'course_review', foreignKey: 'user_id', sourceKey: 'id'});
db.Course.belongsToMany(db.User, { through: 'course_review', foreignKey: 'course_id', sourceKey: 'id'});

//CourseShare fk - Course, User {id}     N:M
db.Course.belongsToMany(db.User, { through: 'course_share', foreignKey: 'course_id', sourceKey: 'id'});
db.User.belongsToMany(db.Course, { through: 'course_share', foreignKey: 'shared_user_id', sourceKey: 'id'});


module.exports = db;
