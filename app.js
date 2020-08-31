const { sequelize } = require('sequelize');
const models = require("./models/index.js");
var schedule = require('node-schedule');

const schedule_func = require('./js/recommend_update')

require('dotenv').config();

models.sequelize.sync().then( () => {
  console.log(" DB 연결 성공");
}).catch(err => {
  console.log("연결 실패");
  console.log(err);
});

const scheduler = schedule.scheduleJob('0 0 * * * * ', function(){
  schedule_func.recommend_update()
});


