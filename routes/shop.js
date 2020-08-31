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

//SHOP RECOMMEND LIST READ
router.get('/recommend', ShopController.getRecommend);

//SHOP INFO READ
router.get('/one', ShopController.readShop);

//SHOP INFO UPDATE
router.put('/', ShopController.updateShop);

//SHOP INFO DELETE
router.delete('/', ShopController.deleteShop);

//좋아요
router.post('/like', ShopController.likeShop);

//좋아요 취소
router.post('/dislike', ShopController.dislikeShop); 

//찜 리스트
router.get('/dip', ShopController.readDipList);

//찜
router.post('/dip', ShopController.dipShop);

//찜 취소
router.post('/undip', ShopController.undipShop);

//SHOP REVIEW CREATE
router.post('/review', ShopController.createReview);

//SHOP REVIEW LIST READ
router.get('/review', ShopController.readReviews);

//SHOP REVIEW UPDATE 
router.put('/review', ShopController.updateReview);

//SHOP REVIEW DELETE
router.delete('/review', ShopController.deleteReview);

module.exports = router;