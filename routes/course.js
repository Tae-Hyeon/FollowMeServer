const express = require('express');
const router = express.Router();

const CourseController = require('../controller/course.controller');

//COURSE CREATE
router.post('/', CourseController.createCourse);

//COURSE READ ONE
router.get('/one', CourseController.readCourse);

//COURSE READ LIST
router.get('/list', CourseController.readCourseList);

//COURSE READ MY LIST
router.get('/my', CourseController.readMyCourse);

//COURSE UPDATE
router.put('/', CourseController.updateCourse);

//COURSE UPDATE SHARE
router.put('/share', CourseController.updateShare);

//COURSE DELETE
router.delete('/', CourseController.deleteCourse);

//COURSE LIKE
router.post('/like', CourseController.likeCourse);

//COURSE LIKE CANCLE
router.delete('/dislike', CourseController.dislikeCourse);

//COURSE READ REVIEW LIST
router.get('/review/:id', CourseController.readReviews);

//COURSE CREATE REVIEW
router.post('/review', CourseController.createReview);

//COURSE UPDATE REIVIEW
router.put('/review', CourseController.updateReview);

//COURSE DELETE REVIEW
router.delete('/review', CourseController.deleteReview);

module.exports = router;