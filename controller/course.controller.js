const env = process.env;
const { Sequelize, sequelize, Op, QueryTypes} = require('sequelize');
const { User, Course, CourseLike, CourseReview, CourseShare, Info } = require('../models');
const model = require('../models');
const jwt_util = require('../js/jwt_util');

//COURSE CREATE
exports.createCourse = (req, res, next) => {

    let { title, dday, contents } = req.body;

    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {

        User.findOne({
            where: { id: token.user_id }
        })
        
        .then( user => {

            Course.create({
                user_id: user.id,
                user_nickname: user.nickname,
                category: category,
                title: title,
                contents: contents,
                dday: dday
            })
            
            .then( course => {

                res.json({
                    code: 200,
                    message: "Create Success (course create)"
                });

            });
        })
        
        .catch( err => {
            res.json({
                code: 500,
                message: "user select error (course create)",
                error: err
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (course create)"
        });

    }
};

//COURSE READ - ONE
exports.readCourse = (req, res, next) => {
    let course_id = req.query.id;
    let token = jwt_util.getAccount(req.headers.authorization);
    let like, shops = [];

    if( typeof token !== 'undefined')
    {
        
        User.findOne({
            where: { id: token.user_id }
        })
        
        .then( user => {
            let query = `
            SELECT 
                courses.id, courses.user_id AS user_id, courses.user_nickname, courses.title,
                courses.contents, courses.dday, courses.grade_avg, 
                courses.course_info1, courses.course_info2, courses.course_info3, 
                course_likes.id AS liked,
                infos.id AS info_id, infos.shopname AS shopname, infos.address AS address,
                infos.grade_avg AS info_grade_avg, infos.latitude AS latitude, infos.longitude AS longitude
            FROM hanium.courses 
            LEFT OUTER JOIN (hanium.course_likes)
            ON ( courses.id = course_likes.course_id )
            LEFT OUTER JOIN (hanium.infos)
            ON ( courses.course_info1 = infos.id OR courses.course_info2 = infos.id OR courses.course_info3 = infos.id )
            WHERE ( courses.id = :course_id )`;

            return model.sequelize.query(
                query, 
                {
                    replacements: {'course_id': course_id},
                    type: QueryTypes.SELECT
                }
            )
        })

        .then( courses => {
            
            console.log( courses );

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
                console.log(i," : ", json);
                shops.push(json);
            }

            res.json({
                id: courses[0].id,
                user_nickname: courses[0].user_nickname,
                title: courses[0].title,
                contents: courses[0].contents,
                grade_avg: courses[0].grade_avg,
                like: like,
                shops: shops
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (course read one)"
        });

    }
};

//COURSE READ - LIST
exports.readCourseList = (req, res, next) => {
    let token = jwt_util.getAccount(req.headers.authorization);
    let include_array = [], json = {}, outer_where = {};
    let courses = [], info_id_array = [], info_id_set = [], set_index = 0;

    if( typeof token !== 'undefined')
    {
        Course.findAll({
            attributes: { 
                exclude : ['createdAt', 'updatedAt', 'deletedAt'] 
            },
            where: { share: 1 } // 전체공개만 select
        })

        .then( course => {
            for( i = 0; i < Object.keys(course).length; i++)
            {
                //course data to response
                let json = {};
                json.id = course[i].id;
                json.title = course[i].title;
                json.dday = course[i].ddat;
                json.grade_avg = course[i].grade_avg;
                json.shops = [];
                courses.push(json);

                // info join 시 마지막으로 건 freign key -> course.course_info3 = info.id 조건을 자동으로 생성해 검색이 제대로 되지 않음.
                // 때문에 info select을 또 하는데, info를 중복해서 검사하지 않기 위해 id를 배열로 저장하고, 중복을 제거함.
                let id_array = [];
                id_array[0] = course[i].course_info1,
                id_array[1] = course[i].course_info2,
                id_array[2] = course[i].course_info3,
                info_id_set.push(course[i].course_info1);
                info_id_set.push(course[i].course_info2);
                info_id_set.push(course[i].course_info3);
                info_id_array[i] = id_array
            }

            //ES6의 SET을 이용해 중복을 제거 후 정렬.
            info_id_set = Array.from(new Set(info_id_set)); 
            //null값 검색 시 제거
            let null_index = info_id_set.findIndex( val => val == 'null' || val == 'undefined');
            if(null_index != -1)
                info_id_set.splice(null_index, 1);
            //sort
            info_id_array.sort();

            return Info.findAll({
                where: {
                    id: {
                        [Op.or]: info_id_set
                    }
                }
            });
        })

        .then( infos => {

            let shopnum = Object.keys(infos).length;
            let shops = [];

            for( i = 0; i < shopnum; i++ )
            {
                let json = {};
                json.id = infos[i].id;
                json.shopname = infos[i].shopname;
                json.address = infos[i].address;
                json.grade_avg = infos[i].grade_avg;
                json.latitude = infos[i].latitude;
                json.longitude = infos[i].longitude;
                shops.push(json);
            }

            for( i = 0; i < Object.keys(courses).length; i++ )
            {
                for( j = 0; j < 3; j++)
                {
                    if( !info_id_array[i][j] )
                    {
                        let index = info_id_set.findIndex( val => val == info_id_array[i][j]);
                        courses[i].shops.push(shops[index]);
                    }
                }
            }
            res.json({
                courses: courses,
                shops: shops
            });
        })
        
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (course read list)"
        });

    }
};

//MY COURSE READ - LIST
exports.readMyCourse = (req, res, next) => {
    let token = jwt_util.getAccount(req.headers.authorization);
    let include_array = [], json = {}, outer_where = {};
    let courses = [], info_id_array = [], info_id_set = [], set_index = 0;
    let user_id = token.user_id;

    if( typeof token !== 'undefined')
    {
        //공유 받은 코스와 내가 만든 코스들 모두 select
        let query = `
        SELECT 
            courses.id, courses.user_id AS user_id, courses.title, courses.dday, courses.grade_avg, 
            courses.course_info1, courses.shopname1, courses.course_info2, courses.shopname2, courses.course_info3, courses.shopname3, 
            course_shares.course_id AS course_id, course_shares.shared_user_id AS shared_user_id 
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

        .then( course => {

            console.log(course);
            for( i = 0; i < Object.keys(course).length; i++)
            {
                //course data to response
                let json = {};
                json.id = course[i].id;
                json.title = course[i].title;
                json.dday = course[i].ddat;
                json.grade_avg = course[i].grade_avg;
                json.share = ( course[i].shared_user_id == user_id ) ? 1 : 0;
                json.shops = [];
                courses.push(json);

                // info를 중복해서 검사하지 않기 위해 id를 배열로 저장하고, 중복을 제거함.
                let id_array = [];
                id_array[0] = course[i].course_info1,
                id_array[1] = course[i].course_info2,
                id_array[2] = course[i].course_info3,
                info_id_set.push(course[i].course_info1);
                info_id_set.push(course[i].course_info2);
                info_id_set.push(course[i].course_info3);
                info_id_array[i] = id_array
            }

            //ES6의 SET을 이용해 중복을 제거 후 정렬.
            info_id_set = Array.from(new Set(info_id_set)); 
            //null값 검색 시 제거
            let null_index = info_id_set.findIndex( val => val == null || val == 'undefined');
            if(null_index != -1)
                info_id_set.splice(null_index, 1);
            //sort
            info_id_array.sort();

            return Info.findAll({
                where: {
                    id: {
                        [Op.or]: info_id_set
                    }
                }
            });
        })

        .then( infos => {

            let shopnum = Object.keys(infos).length;
            let shops = [];

            for( i = 0; i < shopnum; i++ )
            {
                let json = {};
                json.id = infos[i].id;
                json.shopname = infos[i].shopname;
                json.address = infos[i].address;
                json.grade_avg = infos[i].grade_avg;
                json.latitude = infos[i].latitude;
                json.longitude = infos[i].longitude;
                shops.push(json);
            }

            for( i = 0; i < Object.keys(courses).length; i++ )
            {
                for( j = 0; j < 3; j++)
                {
                    if( info_id_array[i][j] )
                    {
                        let index = info_id_set.findIndex( val => val == info_id_array[i][j]);
                        courses[i].shops.push(shops[index]);
                        console.log("index : ", index);
                    }
                }
            }

            res.json({
                courses: courses
            });
        })
        
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (course read my list)"
        });

    }
};

//COURSE UPDATE
exports.updateCourse = (req, res, next) => {
    let course_id = req.body.id;
    let { category, title, dday, contents, shop_id1, shopname1, shop_id2, shopname2, shop_id3, shopname3} = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
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
        GROUP BY courses.id`;

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
                Course.update({
                    category: category, 
                    title: title, 
                    dday: dday, 
                    contents: contents, 
                    course_info1: shop_id1,
                    shopname1: shopname1,
                    course_info2: shop_id2, 
                    shopname2: shopname2,
                    course_info3: shop_id3,
                    shopname3: shopname3
                })

                .then( updated_course => {
                    res.send({
                        code: 200,
                        message: "course update success (course update)"
                    });
                })

                .catch( err => {
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
            message: "Can't read token (course update)"
        });

    }
};

//COURSE UPDATE SHARE
exports.updateShare = (req, res, next) => {
    let { share, course_id, shared_user_id} = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);

    console.log(share, course_id, shared_user_id)
    CourseShare
    if( typeof token !== 'undefined')
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
        GROUP BY courses.id`;

        model.sequelize.query(
            query, 
            {
                replacements: {'user_id': user_id},
                type: QueryTypes.SELECT
            }
        )

        .then( course => {
            console.log(course);
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
            message: "Can't read token (course share update)"
        });

    }
};

//COURSE DELETE
exports.deleteCourse = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
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
            res.json({
                code: 500,
                message: "user select error (course delete)",
                error: err
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (course delete)"
        });

    }
};

//COURSE Like
exports.likeCourse = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
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
            return course.increment(
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
            message: "Can't read token (course like)"
        });

    }
};

//COUSER LIKE CANCLE
exports.dislikeCourse = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {
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
            return course.decrement(
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
            message: "Can't read token (course cancle like)"
        });

    }
};

//COURSE Dip
exports.dipCourse = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {
        // 테스트로는 token의 user_id를 받아서 user를 따로 조회 안하도록 만듦 -> 나중에 수정 가능
        CourseDip.findOne({
            where : {
                user_id: token.user_id,
                course_id: course_id
            }
        })
        .then( course_dip => {
            if( course_dip )
            {
                //이미 찜되어 있으면 reject
                return new Promise( (resolve, reject) => {
                    reject(new Error('already dip'));
                });
            }
            return CourseDip.create({
                user_id: token.user_id,
                course_id: course_id
            })
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "create success (course dip)"
            });
        })
        
        .catch( err => {
            res.json({
                code: 500,
                message: "create error (course dip)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (course dip)"
        });

    }
};

//COURSE DIP CANCLE
exports.undipCourse = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {
        // 테스트로는 token의 user_id를 받아서 user를 따로 조회 안하도록 만듦 -> 나중에 수정 가능
        CourseDip.findOne({
            where : {
                user_id: token.user_id,
                course_id: course_id
            }
        })

        .then( course_dip => {

            if( !course_dip )
            {
                return new Promise( (resolve, reject) => {
                    reject(new Error('no data'));
                });
            }
            else
            {
                return CourseDip.destroy({
                    where : {
                        user_id: token.user_id,
                        course_id: course_id
                    }
                });
            }
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "delete success (course cancle dip)"
            });
        })
        
        .catch( err => {
            res.json({
                code: 500,
                message: "Can't delete : no data in db already (course cancle dip)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (course cancle dip)"
        });

    }
};

//COURSE READ REVIEW LIST
exports.readReviews = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
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
            message: "Can't read token (course read reviews)"
        });

    }
};

//COURSE WRITE REIVEW
exports.createReview = (req, res, next) => {
    let { course_id, grade, review } = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
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
            message: "Can't read token (course review create)"
        });

    }
};

//COURSE UPDATE REVIEW
exports.updateReview = (req, res, next) => {
    let review_id = req.body.id;
    let { grade, review } = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);
    let before_grade;

    if( typeof token !== 'undefined')
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
            message: "Can't read token (course update review)"
        });

    }
};

//COURSE DELETE REVIEW
exports.deleteReview = (req, res, next) => {
    let course_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
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
            message: "Can't read token (course review delete)"
        });

    }
};

