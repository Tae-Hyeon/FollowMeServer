const express = require('express');
const router = express.Router();
const env = process.env;
const getAccount = require('../js/jwt_util');
const { Sequelize, sequelize, Op} = require('sequelize');
const { Course, CourseLike, Info, CourseReview } = require('../models');

//Course Create
router.post('/', function (req, res, next) {
    let { title, contents } = req.body;
    let uid = "" // User id
    
    Course.create({
        uid: uid,
        nickname: nickname,
        title: title,
        contents: contents,
    }).then( R => {
        res.json({
            code:200,
            message:"Create Success"
        });
    });
});

router.get('/:id', function (req, res, next) {
    let cid = req.params.id;
    Course.findOne({where: {id : req.params.id}})
    .then( course => {
  
        let { id, uid, title, contents, likenum, reviewnum } = course;
        let infoid = [course.course_info1, course.course_info2, course.course_info3, course.course_info4, course.course_info5];
        let like = false;

        //TODO : user permission check
        
        CourseLike.findOne({where: { cid: id, uid: uid }})
        .then( courselike => {
  
            if(courselike==null)
                like=false;
            else
                like=true;
    
        }).then( result => {
            res.json({
                id: id,
                nickname : nickname,
                title : title,
                contents : contents,
                likenum: likenum,
                reviewnum : reviewnum,
                like: like
            });
        });
    });
});

//COURSE UPDATE, DELETE
router.put('/', function (req, res, next) {
    //TODO 권한 인증

    let { id, title, contents } = req.body;
    Course.update({
        title : title,
        contents : contents
    }, { where : { id : id }
    }).then( result => {
        res.json({
            code:200,
            message:"Update Success"
        });
    });
    //   res.json({
    //     code:400,
    //     message:"권한이 없습니다."
    //   })
});

router.delete('/', function (req, res, next) {
    let id = req.body.id;
    // 권한 확인

    Course.destroy({where : {id : id}})
    .then( result => {
        res.json({
            code:200,
            message:"Delete Success"
        });
    });
});

// Course Add One Shop 
router.put('/shop', function (req, res, next) {
    let { cid, iid } = req.body;

    Course.findOne({where : {id : cid}})
    .then( course => {
        let course_info = null, count = 0;
        let str = "course_info", strto = "";
        do {
            ++count;
            strto = str + count;
            course_info = course.strto;
        }while(course_info != null);
        Course.update({
            strto : iid
        }, {where : { id : cid }})
        .then ( result => {
            res.json({
                code : 200,
                message : "Add Success"
            });
        });
    });
});

// Course Share Option
router.put('/share', function (req, res, next) {
    //TODO 권한 인증

    let { id, share } = req.body;
    Course.updatae({
        share : share
    }, { where : { id : id }
    }).then( result => {
        res.json({
            code:200,
            message:"Update Success"
        });
    });
});

// Course like
router.post('/like', function (req, res, next) {

    let { id } = req.body;
    Course.findOne({where: {id : id}})
    .then( course => {
        Course.update({
            likenum: course.likenum + 1
        }, {where : { id : id}});
        
        CourseLike.create({
            cid: id,
            uid: uid
        });
    });
});

// Course like cancle
router.delete('/dislike', function (req, res, next) {

    let { id } = req.body;
    Course.findOne({where: {id : id}})
    .then( course => {
        Course.update({
            likenum: course.likenum - 1
        }, {where : { id : id}});
        
        CourseLike.destroy({ where : {
            cid: id,
            uid: uid
        }});
    });
});

// Course review list
router.get('/review/:id', function (req, res, next) {

    let id = req.params.id;
    let uid;
    //jwt 확인
    Course.findOne({where: {id : id}})
    .then( course => {
        Course.update({
            likenum: course.likenum + 1
        }, {where : { id : id}});
        
        CourseLike.create({
            cid: id,
            uid: uid
        });
    });
});

// Course review
router.post('/review', function (req, res, next) {

    let { id, star, review } = req.body;
    CourseReview.create({
        cid : id,
        uid : uid,
        star : star,
        contents : review
    }).then( next => {
        Course.findOne({where: {id : id}})
        .then( course => {
            let after_star = (course.star * course.reviewnum + star) * (course.reviewnum / course.reviewnum + 1);
            Course.update({
                star: after_star,
                reviewnum : course.reviewnum + 1
            }, {where : { id : id}});
        });
    });
});

// Course review update
router.put('/review', function (req, res, next) {

    let { id, star, review } = req.body;
    let before_star, after_star;

    CourseReview.findOne({where : { cid : id }})
    .then( courseReview => {
        before_star = courseReview.star;
    }).then( next => {
        CourseReview.update({
            star : star,
            contents : review
        },{where : {
            cid : id,
            uid : uid
        }}).then( result => {
            if(before_star != star)
            {
                Course.findOne({where: {id : id}})
                .then( course => {
                    avg_star = (course.star * course.reviewnum - before_star + star) / course.reviewnum ;
                    Course.update({
                        star: avg_star,
                        reviewnum : course.reviewnum + 1
                    }, {where : { id : id}});
                });
            }
        });
    });
});

// Course review delete
router.delete('/review', function (req, res, next) {

    let { id } = req.body;
    //jwt 확인
    CourseReview.destroy({where : {
        cid : id,
        uid : uid
    }}).then( result => {
        Course.findOne({where: {id : id}})
        .then( course => {
            let after_star = (course.star * course.reviewnum - star) * (course.reviewnum / course.reviewnum - 1);
            Course.update({
                star: after_star,
                reviewnum : course.reviewnum - 1
            }, {where : { id : id}});
        });
    });
});
module.exports = router;