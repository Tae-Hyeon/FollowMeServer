const express = require('express');
const router = express.Router();
const ShopController = require('../controller/shop.controller');

const multer = require('multer');
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, process.env.IMAGE_PATH );
        },
        filename: function (req, file, cb) {
            let shop_id = (req.body.id) ? req.body.id : "default";
            cb(null, shop_id + process.env.IMAGE_MIDDLE_PATH + file.originalname);
        },
    }),
    limits: { fileSize: 1024 * 1024 * 1024, }
});

//SHOP INFO CREATE
router.post('/', upload.array('photo'), ShopController.createShop);

//SHOP LIST READ
router.get('/list', ShopController.readShopList);

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

//좋아요 리스트
router.get('/like', ShopController.readLikeList);

//SHOP REVIEW CREATE
router.post('/review', ShopController.createReview);

//SHOP REVIEW LIST READ
router.get('/review', ShopController.readReviews);

//SHOP REVIEW UPDATE 
router.put('/review', ShopController.updateReview);

//SHOP REVIEW DELETE
router.delete('/review', ShopController.deleteReview);

module.exports = router;