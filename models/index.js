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

db.Course = require('./course')(sequelize, Sequelize);
db.CourseLike = require('./course_like')(sequelize, Sequelize);
db.CourseReview = require('./course_review')(sequelize, Sequelize);
db.CourseShare = require('./course_share')(sequelize, Sequelize);

// Model간 관계
//User {id, nickname} -> Course {user_id, user_nickname}    1:N
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
db.User.hasMany(db.CourseLike, { foreignKey: 'user_id', sourceKey: 'id'});
db.Course.hasMany(db.CourseLike, { foreignKey: 'course_id', sourceKey: 'id'});
db.User.belongsToMany(db.Course, { through: 'course_like', foreignKey: 'user_id', sourceKey: 'id'});
db.Course.belongsToMany(db.User, { through: 'course_like', foreignKey: 'course_id', sourceKey: 'id'});

//CouresReview fk - User, Course {id}     N:M
db.User.hasMany(db.CourseReview, { foreignKey: 'user_id', sourceKey: 'id'});
db.Course.hasMany(db.CourseReview, { foreignKey: 'course_id', sourceKey: 'id'});
// unique -> foreign key 1:1로 중복 허용
db.User.belongsToMany(db.Course, { 
  through: {
    model: 'course_review',
    unique: false
  }, 
  foreignKey: 'user_id', 
  sourceKey: 'id'
});
db.Course.belongsToMany(db.User, { 
  through: {
    model: 'course_review',
    unique: false
  }, 
  foreignKey: 'course_id', 
  sourceKey: 'id'
});


//CourseShare fk - Course, User {id}     N:M
db.Course.hasMany(db.CourseShare, { foreignKey: 'course_id', sourceKey: 'id'});
db.User.hasMany(db.CourseShare, { foreignKey: 'shared_user_id', sourceKey: 'id'});
db.Course.belongsToMany(db.User, { through: 'course_share', foreignKey: 'course_id', sourceKey: 'id'});
db.User.belongsToMany(db.Course, { through: 'course_share', foreignKey: 'shared_user_id', sourceKey: 'id'});


module.exports = db;
