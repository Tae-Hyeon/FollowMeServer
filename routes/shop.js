const express = require('express');
const router = express.Router();
const ShopController = require('../controller/shop.controller');

const env = process.env;
const { Sequelize, sequelize, Op} = require('sequelize');
const { Info, InfoLike } = require('../models');

const jwt_util = require('../js/jwt_util');


//SHOP INFO CREATE
router.post('/', ShopController.createShop);

//SHOP LIST READ
router.get('/list', ShopController.readShopList);

//SHOP INFO READ
router.get('/one', ShopController.readShop);

//SHOP INFO UPDATE, DELETE
router.put('/', ShopController.updateShop);

router.delete('/', ShopController.deleteShop);

//좋아요
router.post('/like', ShopController.likeShop);

//좋아요 취소
router.post('/dislike', ShopController.dislikeShop); 

module.exports = router;