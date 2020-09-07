const env = process.env;
const { Sequelize, sequelize, Op, QueryTypes} = require('sequelize');
const { User, Course, CourseLike, CourseReview, CourseShare, Info } = require('../models');
const model = require('../models');
const jwt_util = require('../js/jwt_util');
const fs = require('fs');
const image_path = env.IMAGE_PATH;
const image_db_path = env.IMAGE_DB_PATH;
const image_middle_path = env.IMAGE_MIDDLE_PATH;
const default_image_name = env.DEFAULT_IMAGE_NAME;

//COURSE CREATE
exports.createCourse = (req, res, next) => {

    let { category, title, contents, dday } = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);
    let file = req.file;

    if(!category) 
        category = 1;
    if( typeof token != 'undefined')
    {

        User.findOne({
            where: { id: token.user_id }
        })
        
        .then( user => {
            let main_photo = null;
    
            Course.create({
                user_id: user.id,
                user_nickname: user.nickname,
                category: category,
                title: title,
                contents: contents,
                dday: dday
            })
            
            .then( course => {
                if(file)
                {
                    let file = req.file;
                    oldFilename = image_path + "default_main_" + file.originalname;
                    newFilename = image_path + course.id + image_middle_path + file.originalname;

                    fs.rename( oldFilename , newFilename, 
                        function (err) { 
                            if (err) 
                            {
                                res.json({
                                    message: "file update error (course create)"
                                });
                                throw err; 
                            }
                        }
                    );

                    return Course.update(
                        { main_photo: image_db_path + course.id + image_middle_path + file.originalname },
                        { where : { id: course.id }}
                    ).then( upt => {
                        res.json({
                            code: 200,
                            message: "Create Success (course create)"
                        });
                    });
                }
                else
                {
                    res.json({
                        code: 200,
                        message: "Create Success (course create)"
                    });
                }
            });
        })
        
        .catch( err => {
            console.log(err);
            res.json({
                code: 500,
                message: "user select error (course create)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course create)"
        });

    }
};

//COURSE READ - ONE
exports.readCourse = (req, res, next) => {
    let course_id = req.query.id;
    let token = jwt_util.getAccount(req.headers.authorization);
    let like, shops = [];

    if( typeof token != 'undefined')
    {
        
        User.findOne({
            where: { id: token.user_id }
        })
        
        .then( user => {
            let query = `
            SELECT 
                courses.id, courses.user_id AS user_id, courses.user_nickname, courses.title,
                courses.contents, courses.dday, courses.grade_avg, courses.main_photo,
                courses.course_info1, courses.course_info2, courses.course_info3, 
                DATE_FORMAT(courses.created_at,'%Y-%m-%d') AS created_at,
                course_likes.id AS liked,
                infos.id AS info_id, infos.shopname AS shopname, infos.address AS address,
                infos.grade_avg AS info_grade_avg, infos.latitude AS latitude, infos.longitude AS longitude
            FROM hanium.courses 
            LEFT OUTER JOIN (hanium.course_likes)
            ON ( courses.id = course_likes.course_id )
            LEFT OUTER JOIN (hanium.infos)
            ON ( courses.course_info1 = infos.id OR courses.course_info2 = infos.id OR courses.course_info3 = infos.id )
            WHERE ( courses.id = :course_id AND course_likes.user_id = :user_id)`;

            return model.sequelize.query(
                query, 
                {
                    replacements: {
                        'course_id': course_id,
                        'user_id': user.id
                    },
                    type: QueryTypes.SELECT
                }
            )
        })

        .then( courses => {

            console.log(courses);
            if( !courses[0].liked )
                like = 0;
            else
                like = 1;

            for( i = 0; i < Object.keys(courses).length; i++ )
            {
                let json = {};
                json.id = courses[i].info_id;
                json.shopname = courses[i].shopname;
                json.address = courses[i].address;
                json.grade_avg = courses[i].info_grade_avg;
                json.latitude = courses[i].latitude;
                json.longitude = courses[i].longitude;
                json.main_photo = courses[i].main_photo;
                shops.push(json);
            }

            res.json({
                id: courses[0].id,
                user_nickname: courses[0].user_nickname,
                title: courses[0].title,
                contents: courses[0].contents,
                dday: courses[0].dday,
                grade_avg: courses[0].grade_avg,
                like: like,
                created_at: courses[0].created_at,
                shops: shops
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course read one)"
        });

    }
};

//COURSE READ - LIST
exports.readCourseList = (req, res, next) => {
    let token = jwt_util.getAccount(req.headers.authorization);
    let courses = [], info_id_array = [], info_id_set = [], set_index = 0;
    
    if( typeof token != 'undefined')
    {
        let query = `
        SELECT 
            courses.id, courses.user_nickname, courses.title, courses.dday, courses.grade_avg, courses.main_photo,
            courses.course_info1 AS shop_id1, courses.shopname1, courses.course_info2 AS shop_id2, courses.shopname2, courses.course_info3 AS shop_id3, courses.shopname3, 
            DATE_FORMAT(courses.created_at,'%Y-%m-%d') AS created_at
        FROM courses
        WHERE (courses.share = 1)`;

        model.sequelize.query(
            query, 
            {
                type: QueryTypes.SELECT
            }
        )
        
        .then( courses => {
            
            return new Promise( resolve => {
                let course_array = courses;
                for(let i = 0; i <= course_array.length; i++)
                {
                    if( i == course_array.length )
                    {
                        resolve(course_array);
                    }
                    course_array[i].shops = [
                        {
                            shop_id: course_array[i].shop_id1,
                            shopname: course_array[i].shopname1
                        },
                        {
                            shop_id: course_array[i].shop_id2,
                            shopname: course_array[i].shopname2
                        },
                        {
                            shop_id: course_array[i].shop_id3,
                            shopname: course_array[i].shopname3
                        }
                    ];
                    delete course_array[i].shop_id1;
                    delete course_array[i].shopname1;
                    delete course_array[i].shop_id2;
                    delete course_array[i].shopname2;
                    delete course_array[i].shop_id3;
                    delete course_array[i].shopname3;
                }
            })
        })

        .then( courses => {
            res.json({
                courses: courses
            });
        })
        
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course read list)"
        });

    }
};

//MY COURSE READ - LIST
exports.readMyCourse = (req, res, next) => {
    let token = jwt_util.getAccount(req.headers.authorization);
    let user_id = token.user_id;

    if( typeof token != 'undefined')
    {
        //공유 받은 코스와 내가 만든 코스들 모두 select
        let query = `
        SELECT 
            courses.id, courses.title, courses.dday, courses.grade_avg, courses.main_photo,
            courses.course_info1 AS shop_id1, courses.shopname1, courses.course_info2 AS shop_id2, courses.shopname2, courses.course_info3 AS shop_id3, courses.shopname3, 
            DATE_FORMAT(courses.created_at,'%Y-%m-%d') AS created_at, COUNT(course_shares.course_id) AS share
        FROM hanium.courses 
        LEFT OUTER JOIN (hanium.course_shares)
        ON courses.id = course_shares.course_id 
        WHERE (user_id = :user_id OR shared_user_id = :user_id ) 
        GROUP BY courses.id`;

        model.sequelize.query(
            query, 
            {
                replacements: {'user_id': user_id},
                type: QueryTypes.SELECT
            }
        )

        .then( courses => {
            
            return new Promise( resolve => {
                let course_array = courses;
                for(let i = 0; i <= course_array.length; i++)
                {
                    if( i == course_array.length )
                    {
                        resolve(course_array);
                    }
                    course_array[i].shops = [
                        {
                            shop_id: course_array[i].shop_id1,
                            shopname: course_array[i].shopname1
                        },
                        {
                            shop_id: course_array[i].shop_id2,
                            shopname: course_array[i].shopname2
                        },
                        {
                            shop_id: course_array[i].shop_id3,
                            shopname: course_array[i].shopname3
                        }
                    ];
                    delete course_array[i].shop_id1;
                    delete course_array[i].shopname1;
                    delete course_array[i].shop_id2;
                    delete course_array[i].shopname2;
                    delete course_array[i].shop_id3;
                    delete course_array[i].shopname3;
                }
            })
        })

        .then( courses => {
            res.json({
                courses: courses
            });
        })
        
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course read my list)"
        });

    }
};

//COURSE UPDATE
exports.updateCourse = (req, res, next) => {
    let course_id = req.body.id;
    let { category, title, dday, contents, shop_id1, shopname1, shop_id2, shopname2, shop_id3, shopname3} = req.body;
    let file = req.file;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
    {

        let user_id = token.user_id;

        let newFilename = (file) ? (image_db_path + course_id + image_middle_path + file.originalname) : (image_db_path + default_image_name)

        // 수정할 권한이 있는지 확인 ( 내소유 or 공유 받은 코스 )
        let query = `
        SELECT 
            courses.id, courses.user_id AS user_id, courses.title, courses.dday, courses.grade_avg, courses.main_photo,
            courses.course_info1, courses.shopname1, courses.course_info2, courses.shopname2, courses.course_info3, courses.shopname3, 
            course_shares.course_id AS course_id, course_shares.shared_user_id AS shared_user_id 
        FROM hanium.courses 
        LEFT OUTER JOIN (hanium.course_shares)
        ON courses.id = course_shares.course_id 
        WHERE courses.id = :course_id AND (user_id = :user_id OR shared_user_id = :user_id ) 
        GROUP BY courses.id`;

        model.sequelize.query(
            query, 
            {
                replacements: {
                    'course_id': course_id,
                    'user_id': user_id
                },
                type: QueryTypes.SELECT
            }
        )

        .then( course => {

            if( course )
            {
                let oldFilename = course[0].main_photo;
                console.log(env.pp+oldFilename);
                if( (oldFilename != newFilename) && (oldFilename != (image_db_path + default_image_name)))
                {
                    fs.unlink( env.PP + oldFilename, function (err) {
                        if(err)
                        {
                            res.json({
                                message: "file delete error (course update)"
                            });
                            throw err; 
                        }
                    })
                }
            
                Course.update({
                    category: category, 
                    title: title, 
                    dday: dday, 
                    contents: contents,
                    main_photo: newFilename,
                    course_info1: shop_id1,
                    shopname1: shopname1,
                    course_info2: shop_id2, 
                    shopname2: shopname2,
                    course_info3: shop_id3,
                    shopname3: shopname3
                },
                {
                    where: {id: course_id}
                })

                .then( updated_course => {
                    res.send({
                        code: 200,
                        message: "course update success (course update)"
                    });
                })

                .catch( err => {
                    console.log(err);
                    res.json({
                        code: 500,
                        message: "course update error (course update)"
                    });
                })
            }
            else
            {
                res.json({
                    code: 403,
                    message: "Can't update - no Permission (course update)"
                })
            }
        })

        .catch( err => {
            console.log(err);
            res.json({
                code: 500,
                message: "course select error (course update)"
            });
        })
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course update)"
        });

    }
};

//COURSE UPDATE SHARE
exports.updateShare = (req, res, next) => {
    let { share, course_id, shared_user_id} = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
    {
        let user_id = token.user_id;

        // 수정할 권한이 있는지 확인 ( 내소유 or 공유 받은 코스 )
        let query = `
        SELECT 
            courses.id, courses.user_id AS user_id, courses.title, courses.dday, courses.grade_avg, 
            courses.course_info1, courses.shopname1, courses.course_info2, courses.shopname2, courses.course_info3, courses.shopname3, 
            course_shares.course_id AS course_id, course_shares.shared_user_id AS shared_user_id 
        FROM hanium.courses 
        LEFT OUTER JOIN (hanium.course_shares)
        ON courses.id = course_shares.course_id 
        WHERE (user_id = :user_id OR shared_user_id = :user_id ) 
        `;

        model.sequelize.query(
            query, 
            {
                replacements: {'user_id': user_id},
                type: QueryTypes.SELECT
            }
        )

        .then( course => {
            
            if( course )
            {
                if(share == 0) // 비공개 전환
                {
                    Course.update(
                        { share: share },
                        { where: { id: course_id }}
                    )

                    .then( updated_course => {
                        //비공개로 전환해도 공유된 것을 삭제는 안하는 걸 원할 수 있음. -> 수정 필요
                        return CourseShare.destroy({
                            where: { course_id: course_id }
                        })
                    })

                    .then( result => {
                        res.json({
                            code: 200,
                            message: "Course Share Update success " + course.share + " -> " + share + " (course share update)"
                        });
                    })

                    .catch(err => {
                        console.log(err);
                        res.json({
                            code: 500,
                            message: "Course Share Update Error - share to 0 (course share update)"
                        });
                    })
                }
                else if(share == 1) // 전체 공개
                {
                    Course.update(
                        { share: share },
                        { where: { id: course_id }}
                    )

                    .then( updated_course => {
                        res.json({
                            code: 200,
                            message: "Course Share Update success " + course.share + " -> " + share + " (course share update)"
                        });
                    })

                    .catch(err => {
                        console.log(err);
                        res.json({
                            code: 500,
                            message: "Course Share Update Error - share to 1 (course share update)"
                        });
                    })
                }
                else if(share == 2) // 공유대상 지정 
                // 하면서 디비에는 친구에게 공개는 표시 안해주고 0과 1로 비공개, 전체공개만 해주는게 맞다고 생각
                // 전체공개를 하면서 친구에게 공유를 할 수 있고, 메인에서 select 시 전체 공개된 것들을 검색함.
                {
                    CourseShare.findOne({
                        where : {
                            course_id: course_id,
                            shared_user_id: shared_user_id
                        }
                    })

                    .then( shared => {
                        if(shared)
                        {
                            res.json({
                                code: 400,
                                message: "Already shared (course share update)"
                            })
                        }
                        else
                        {
                            CourseShare.create(
                                { shared_user_id: shared_user_id },
                                { where: { course_id: course_id }}
                            )
                            
                            .then( shared => {
                                res.json({
                                    code: 200,
                                    message: "Course Share Success (course share update)"
                                })
                            })

                            .catch( err => {
                                console.log(err);
                                res.json({
                                    code: 400,
                                    message: "Course Share Create Error - share to 2 (course share update)"
                                })
                            })
                        }
                    })
                    
                    .catch( err => {
                        console.log(err);
                        res.json({
                            code: 400,
                            message: "Course Share Select Error - share to 2 (course share update)"
                        })
                    })
                }
            }
            else
            {
                res.json({
                    code: 403,
                    message: "Can't update - no Permission (course share update)"
                })
            }
        })

        .catch( err => {
            console.log(err);
            res.json({
                code: 500,
                message: "course update error (course share update)"
            });
        })
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course share update)"
        });

    }
};

//COURSE DELETE
exports.deleteCourse = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
    {

        User.findOne({
            indluce: {
                model: Course,
                where: { id: course_id }
            },
            where: { id: token.user_id }
        })
        
        .then( user => {

            // 유저가 관리자인지 확인 ( 0 = 관리자, 1 = 유저 )
            if( user.status == 0 )
            {

                if( user.course )
                {
                    Course.destroy({
                        where: { id: course_id}
                    })
                    
                    .then(course => {
                        res.json({
                            code: 200,
                            message: "Delete Success"
                        });
                    });
                }
                else 
                {
                    res.json({
                        code: 500,
                        message: "delete error : no data in db(course delete)"
                    });
                }
            }
            else
            {

                res.json({
                    code: 403,
                    message: "No Permission (course delete) "
                });

            }
        })

        .catch( err => {
            console.log(err);
            res.json({
                code: 500,
                message: "user select error (course delete)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course delete)"
        });

    }
};

//COURSE Like
exports.likeCourse = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
    {
        // 테스트로는 token의 user_id를 받아서 user를 따로 조회 안하도록 만듦 -> 나중에 수정 가능
        CourseLike.findOne({
            where : {
                user_id: token.user_id,
                course_id: course_id
            }
        })
        .then( course_like => {
            if( course_like )
            {
                //이미 좋아요가 있으면 reject
                //reject 시키지 않으면 계속 resolve되어 increase하여 좋아요 수가 늘어남
                return new Promise( (resolve, reject) => {
                    reject(new Error('already like'));
                });
            }
            return CourseLike.create({
                user_id: token.user_id,
                course_id: course_id
            })
        })

        .then( course_like => {
            return Course.increment(
                { likenum: 1 },
                { where : { id: course_id } }
            );
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "like success (course like)"
            });
        })
        
        .catch( err => {
            console.log(err);
            res.json({
                code: 500,
                message: "create error (course like)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course like)"
        });

    }
};

//COUSER LIKE CANCLE
exports.dislikeCourse = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
    {
        if( typeof course_id )
        // 테스트로는 token의 user_id를 받아서 user를 따로 조회 안하도록 만듦 -> 나중에 수정 가능
        CourseLike.findOne({
            where : {
                user_id: token.user_id,
                course_id: course_id
            }
        })

        .then( course_like => {

            if( !course_like )
            {
                return new Promise( (resolve, reject) => {
                    reject(new Error('no data to delete'));
                });
            }
            else
            {
                return CourseLike.destroy({
                    where : {
                        user_id: token.user_id,
                        course_id: course_id
                    }
                });
            }
        })

        .then( course_like => {
            return Course.decrement(
                { likenum: 1 },
                { where : { id: course_id } }
            );
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "like cancle success (course cancle like)"
            });
        })
        
        .catch( err => {
            console.log(err);
            res.json({
                code: 500,
                message: "no data in db already (course cancle like)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course cancle like)"
        });

    }
};

//COURSE READ REVIEW LIST
exports.readReviews = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
    {
        CourseReview.findAll({
            // where : {
                
            // }
        })

        .then( course_reviews => {

            let reviewnum = Object.keys(course_reviews).length;
            let reviews = [];
            let json = {};

            for(key in course)
            {
                json.id = course_reviews[key].id;
                json.grade = course_reviews[key].grade;
                json.nickname = course_reviews[key].nickname;
                json.review = course_reviews[key].contents;
                reviews.push(json);
            }

            res.json({
                reviewnum: reviewnum,
                reveiws : reviews
            })
            
        })
        
        .catch( err => {
            console.log(err);
            res.json({
                code: 500,
                message: "read error (course read reviews)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course read reviews)"
        });

    }
};

//COURSE WRITE REIVEW
exports.createReview = (req, res, next) => {
    let { course_id, grade, review } = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
    {
        CourseReview.create({
                course_id: course_id,
                user_id: token.user_id,
                grade: grade,
                contents: review
        })

        .then( course_review => {
            
            return Course.update(
                { 
                    grade_avg: Sequelize.literal('((grade_avg * reviewnum) + ' + grade + ') / (reviewnum + 1)' ),
                    reviewnum: Sequelize.literal('reviewnum + 1')
                },
                { where : { id: course_id } }
            );
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "create success (course review create)"
            });
        })
        
        .catch( err => {
            console.log(err);   
            res.json({
                code: 500,
                message: "create error (course review create)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course review create)"
        });

    }
};

//COURSE UPDATE REVIEW
exports.updateReview = (req, res, next) => {
    let review_id = req.body.id;
    let { grade, review } = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);
    let before_grade;

    if( typeof token != 'undefined')
    {
        courseReview.findOne({
            where : { id: review_id }
        })

        .then( course_review => {

            if( !course_review )
            {
                return new Promise( (resolve, reject) => {
                    reject(new Error('no data to update'));
                });
            }
            else
            {
                before_grade = course_review.grade;
                return CourseReview.update({
                    grade: grade,
                    contents: review
                })
            }
        })

        
        .then( course_review => {

            return Course.update(
                { 
                    grade_avg: Sequelize.literal('grade_avg + ' + ( grade - before_grade ) / 'reviewnum' ),
                },
                { where : { id: course_id } }
            );
        })
        
        .then( course => {
            res.json({
                code: 200,
                message: "update success (course update review)"
            });
        })
        
        .catch( err => {
            console.log(err);
            res.json({
                code: 500,
                message: "update error (course update review)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course update review)"
        });

    }
};

//COURSE DELETE REVIEW
exports.deleteReview = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
    {
        CourseReview.destroy({
            where : {
                user_id: token.user_id,
                course_id: course_id
            }
        })

        .then( course_review => {

            // review 없을 시 reject
            if( !course_review )
            {
                return new Promise( (resolve, reject) => {
                    reject(new Error('no data to delete'));
                });
            }
            else
            {
                return Course.decrement(
                    { reviewnum: 1 },
                    { where : { id: course_id } }
                );
            }
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "delete success (course review delete)"
            });
        })
        
        .catch( err => {
            console.log(err);
            res.json({
                code: 500,
                message: "delete error (course review delete)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "JWT Token Error (course review delete)"
        });

    }
};

