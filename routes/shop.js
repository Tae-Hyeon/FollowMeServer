const express = require('express');
const router = express.Router();
const ShopController = require('../controller/shop.controller');

const env = process.env;
const { Sequelize, sequelize, Op} = require('sequelize');
const { Info, InfoLike } = require('../models');

const jwt_util = require('../js/jwt_util');


//SHOP INFO CREATE
router.post('/', function (req, res, next) {
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
      message:"Create Success"
    });
  })
});

//SHOP LIST READ
router.get('/', ShopController.readShopList);

//SHOP INFO READ
router.get('/:id', ShopController.readShop);

//SHOP INFO UPDATE, DELETE
router.put('/', ShopController.updateShop);
// function (req, res, next) {
//   let { method ,id } = req.body;
//   let status = 1;
//   //TODO 권한 인증 user status == 관리자
//   if(status == 2) {
//     if(method == 'upt')
//     {
//       let { id, shopname, address, menu, category, tag, operating_time, introduce } = req.body;
//       Info.updatae({
//         shopname: shopname,
//         address: address,
//         menu: menu,
//         category: category,
//         tag: tag,
//         operating_time: operating_time,
//         introduce: introduce 
//       }, { where : { id : id }
//       }).then( result => {
//         res.json({
//           code:200,
//           message:"Update Success"
//         });
//       });
//     }
//     else if(method == 'del')
//     {
//       Info.destroy({where : {id : id}}).then(result => {
//         res.json({
//           code:200,
//           message:"Delete Success"
//         });
//       });
//     }
//   }
//   else {
//     res.json({
//       code:400,
//       message:"권한이 없습니다."
//     })
//   }
// });

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