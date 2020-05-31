const express = require('express');
const router = express.Router();
const env = process.env;
const { Sequelize, sequelize, Op} = require('sequelize');
const { Info, InfoLike } = require('../models');
const redis = require('redis');
const connect = redis.createClient(env.REDIS_PORT, env.RDIS_HOST);

//SHOP INFO CREATE
router.post('/new', function (req, res, next) {
  var { shopname, address, menu, category, tag, operating_time, introduce } = req.body;

  Info.create({
    shopname: shopname,
    address: address,
    menu: menu,
    category: category,
    tag: tag,
    operating_time: operating_time,
    introduce: introduce
  }).then( info => {
    res.json({
      code:200,
      message:"Join Success"
    });
  })
});

//SHOP INFO READ
router.get('/profile/:id', function (req, res, next) {
  var auth, like;
  //auth=(req.isAuthenticated()) ? 'login' : 'notlogin'
  Info.findOne({where: {id : req.params.id}})
  .then( info => {

    var { id, shopname, address, menu, category, tag, operating_time, introduce, likenum } = info;
    likenum=info.likenum;

    InfoLike.findOne({where: { iid: id, uid: req.user.id }})
    .then( infolike => {

      if(infolike==null)
        like=false;
      else
        like=true;

    }).then( result => {
      res.json({
        auth : auth,
        id: id,
        shopname: shopname,
        address: address,
        menu : menu,
        introduce: introduce,
        likenum: likenum,
        like: like
      });
    })
  });
});

//SHOP INFO UPDATE, DELETE
router.post('/profile/:id', function (req, res, next) {
  let method = req.body.method, id = req.body.id, status = 1;
  //TODO 권한 인증 user status == 관리자
  if(status == 2) {
    if(method == 'upt')
    {
      let { id, shopname, address, menu, category, tag, operating_time, introduce } = req.body;
      Info.updatae({
        shopname: shopname,
        address: address,
        menu: menu,
        category: category,
        tag: tag,
        operating_time: operating_time,
        introduce: introduce 
      }, { where : { id : id }
      }).then( result => {
        res.json({
          code:200,
          message:"Update Success"
        });
      });
    }
    else if(method == 'del')
    {
      Info.destroy({where : {id : id}}).then(result => {
        res.json({
          code:200,
          message:"Delete Success"
        });
      });
    }
  }
  else {
    res.json({
      code:400,
      message:"권한이 없습니다."
    })
  }
});

//SHOP LIST READ
router.get('/list', function (req, res, next) {
    //TODO 로그인 인증
    if(true)
    {
      // Info List all select
      Info.findAll({
        attributes : [ 'id', 'shopname', 'address', 'likenum'] //TODO 평점 추가 필요
      }).then(info => {
        let keyname = 'shop', info_list = {};
        for(let i=0; i<info.length; i++)
            info_list[keyname+(i+1)] = info[i];

        res.json({
            info_list: info_list
        });
      }).catch( err => {
        res.json({
            code : 400,
            info_list: null,
            message: "error",
            err : err
        });
      });
    }
    else
    {
      res.json({
        code : 400,
        message : "로그인을 해야합니다."
      });
    }
});

//좋아요
router.post('/like/:id', function (req, res, next) {
    let iid = req.params.id;
    let uid = req.user.id; //TODO jwt에 맞게 변경 필요
    InfoLike.findOne({where: {iid: iid, uid: uid}})
    .then( like => {
        if(like == null)
        {
          InfoLike.create({iid: iid, uid: uid});
          Info.findOne({where: {id: iid}})
          .then( info => {
            console.log('info');
            Info.update(
              { likenum: info.likenum+1 }, 
              { where: { id:iid } }
            );
          });
        }
    }).then( result =>{
      res.json({
        code: 200,
        message: "like success"
      });
    });
});

//좋아요 취소
router.post('/dislike/:id', function (req, res, next) {
  let iid = req.params.id;
  let uid = req.user.id; //TODO jwt에 맞게 변경 필요
  InfoLike.findOne({where: {iid: iid, uid: uid}})
  .then( like => {
    if(like != null)
    {
      InfoLike.destroy({where : {iid: iid, uid: uid}});
      Info.findOne({where: {id: iid}})
      .then( info => {
        Info.update(
          { likenum: info.likenum-1 },
          { where: { id: iid } }
        );
      });
    }
  }).then( result => {
    res.json({
      code: 200,
      message: "like cancled"
    });
  });
});
module.exports = router;