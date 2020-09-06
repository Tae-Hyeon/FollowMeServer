const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, process.env.IMAGE_PATH );
        },
        filename: function (req, file, cb) {
            let course_id = (req.body.id) ? req.body.id : "default";
            cb(null, course_id + "_main_" + file.originalname);
        },
    }),
    limits: { files: 10, fileSize: 1024 * 1024 * 1024, }
});
const CourseController = require('../controller/course.controller');

//COURSE CREATE
router.post('/', upload.single('main_photo'), CourseController.createCourse);

//COURSE READ ONE
router.get('/one', CourseController.readCourse);

//COURSE READ LIST
router.get('/list', CourseController.readCourseList);

//COURSE READ MY LIST
router.get('/my', CourseController.readMyCourse);

//COURSE UPDATE
router.put('/', upload.single('main_photo'), CourseController.updateCourse);

//COURSE UPDATE SHARE
router.put('/share', CourseController.updateShare);

//COURSE DELETE
router.delete('/', CourseController.deleteCourse);

//COURSE LIKE
router.post('/like', CourseController.likeCourse);

//COURSE LIKE CANCLE
router.post('/dislike', CourseController.dislikeCourse);

//COURSE READ REVIEW LIST
router.get('/review/:id', CourseController.readReviews);

//COURSE CREATE REVIEW
router.post('/review', CourseController.createReview);

//COURSE UPDATE REIVIEW
router.put('/review', CourseController.updateReview);

//COURSE DELETE REVIEW
router.delete('/review', CourseController.deleteReview);

module.exports = router;