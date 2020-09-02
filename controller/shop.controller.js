const env = process.env;
const { Sequelize, sequelize, Op} = require('sequelize');
const { User, Info, InfoLike, InfoDip, InfoReview, InfoTag} = require('../models');

const redis = require('redis');
const client = redis.createClient(env.REDIS_PORT, env.REDIS_HOST);

const jwt_util = require('../js/jwt_util');
const crud_util = require('../js/crud_util');

//Shop Recommend List
exports.getRecommend = (req, res, next) => {
    client.get('recommend', function (err, reply) {
        if(err){
            console.log(err);
            res.send("error "+err);
            return;
        }

        let json = JSON.parse(reply);

        res.json(json);
    })
}

//Shop Info Create
exports.createShop = (req, res, next) => {

    let { 
        category, shopname, address, menu, operating_time, 
        letitude, longitude, tag1, tag2, tag3,
        main_photo,
        photo1, photo2, photo3, photo4, photo5, 
        photo6, photo7, photo8, photo9, photo10
    } = req.body;

    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {

        User.findOne({
            where: { id: token.user_id }
        })
        
        .then( user => {

            // 유저가 관리자인지 확인 ( 0 = 관리자, 1 = 유저 )
            if( user.status == 0 )
            {

                Info.create({
                    category: category,
                    shopname: shopname,
                    address: address,
                    menu: menu,
                    operating_time: operating_time,
                    grade_avg: 0,
                    letitude: letitude,
                    longitude: longitude,
                    main_photo: main_photo,
                    photo1: photo1,
                    photo2: photo2,
                    photo3: photo3,
                    photo4: photo4,
                    photo5: photo5,
                    photo6: photo6,
                    photo7: photo7,
                    photo8: photo8,
                    photo9: photo9,
                    photo10: photo10
                })
                
                .then( info => {

                    // create tag
                    if( !(tag1 == null && tag2 == null && tag3 == null) )
                    {

                        let infotags = []

                        if( tag1 )
                            infotags[0] = { info_id: info.id, tag_id: tag1 };
                        if( tag2 )
                            infotags[1] = { info_id: info.id, tag_id: tag2 };
                        if( tag3 )
                            infotags[2] = { info_id: info.id, tag_id: tag3 };
                            

                        InfoTag.bulkCreate(infotags)
                        
                        // .then( () => {
                        //     return InfoTag.findAll();
                        // })

                        .then( () => { 
                            res.json({
                                code: 200,
                                message: "Create Success"
                            });  
                        });
                    }
                    else // no create tag
                    {

                        res.json({
                            code: 200,
                            message: "Create Success"
                        });

                    }
                });
            }
            else
            {

                res.json({
                    code: 403,
                    message: "No Permission (shop create) "
                });

            }
        })
        
        .catch( err => {
            res.json({
                code: 500,
                message: "user select error (shop create)",
                error: err
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop create)"
        });

    }
};

//Shop Info Read - One
exports.readShop = (req, res, next) => {
    let info_id = req.query.id;
    let token = jwt_util.getAccount(req.headers.authorization);
    //console.log(info_id, token);

    if( typeof token !== 'undefined')
    {
        
        User.findOne({
            where: { id: token.user_id }
        })
        
        .then( user => {
            return Info.findOne({
                include: [
                    {
                        model: InfoTag,
                        required: false,
                        where: { info_id : info_id }
                    }, 
                    {
                        model: InfoLike,
                        required: false, // left outer join
                        where: { user_id : user.id, info_id : info_id }
                    }
                ],
                where: { id: info_id }
            });
        })

        .then( info => {
            let tag1 = (info.info_tags[0] == null) ? null : info.info_tags[0].tag_id;
            let tag2 = (info.info_tags[1] == null) ? null : info.info_tags[1].tag_id;
            let tag3 = (info.info_tags[2] == null) ? null : info.info_tags[2].tag_id;

            if( !info.info_like )
                like = 0;
            else
                like = 1;
            
            res.json({
                id: info.id,
                category: info.category,
                shopname: info.shopname,
                address: info.address,
                menu: info.menu,
                operating_time: info.operating_time,
                grade_avg: info.grade_avg,
                letitude: info.letitude,
                longitude: info.longitude,
                like: like,
                tag1: tag1,
                tag2: tag2,
                tag3: tag3,
                main_photo: info.main_photo,
                photo1: info.photo1,
                photo2: info.photo2,
                photo3: info.photo3,
                photo4: info.photo4,
                photo5: info.photo5,
                photo6: info.photo6,
                photo7: info.photo7,
                photo8: info.photo8,
                photo9: info.photo9,
                photo10: info.photo10
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop read one)"
        });

    }
};

//Shop Info Read - List
exports.readShopList = (req, res, next) => {
    let { category, tag } = req.query;
    let token = jwt_util.getAccount(req.headers.authorization);

    let category_json = (category) ? {'category': category} : {};
    let tag_json = (tag) ? {'tag_id': tag} : {};

    if( typeof token !== 'undefined')
    {

        Info.findAll({
            attributes: { 
                exclude : ['createdAt', 'updatedAt', 'deletedAt'] 
            },
            include: [
                {
                    attributes: {
                        include : ['tag_id'],
                        exclude : ['created_at', 'updated_at', 'deleted_at']
                    },
                    model: InfoTag,
                    required: false,
                    where: tag_json
                }
            ],

            where: category_json
        })

        .then( infos => {
            let shopnum = Object.keys(infos).length;
            let getShopJson = async function (infos) {
                let shops = [];
                for( i = 0; i < shopnum; i++ )
                {
                    let json = await crud_util.getShopData(infos[i]);
                    shops.push(json);
                }

                res.json({
                    shopnum: shopnum,
                    shops: shops
                });
            }

            let shops = getShopJson(infos);
        })
        
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop read list)"
        });

    }
};

//Shop Info Update
exports.updateShop = (req, res, next) => {
    let info_id = req.body.id;
    let { 
        category, shopname, address, menu, operating_time, 
        letitude, longitude, tag1, tag2, tag3,
        main_photo,
        photo1, photo2, photo3, photo4, photo5, 
        photo6, photo7, photo8, photo9, photo10
    } = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);
    let tags, parameter_set, infotag_id, query;
    let info_backup;

    if( typeof token !== 'undefined')
    {

        User.findOne({
            where: { id: token.user_id }
        })
        
        .then( user => {

            // 유저가 관리자인지 확인 ( 0 = 관리자, 1 = 유저 )
            if( user.status == 0 )
            {

                Info.findOne({
                    where: { id: info_id }
                })

                .then( info_back => {

                    info_backup = info_back; // 실패 시 되돌리기 위한 데이터 저장
                    
                    return Info.update(
                        {
                            category: category,
                            shopname: shopname,
                            address: address,
                            menu: menu,
                            operating_time: operating_time,
                            letitude: letitude,
                            longitude: longitude,
                            main_photo: main_photo,
                            photo1: photo1,
                            photo2: photo2,
                            photo3: photo3,
                            photo4: photo4,
                            photo5: photo5,
                            photo6: photo6,
                            photo7: photo7,
                            photo8: photo8,
                            photo9: photo9,
                            photo10: photo10
                        },
                        { 
                            where: { id: info_id } 
                        }
                    )
                })

                .then( info => {

                    return InfoTag.findAll({
                        where: { info_id: info_id }
                    })

                })

                .then( infotags => {
                    
                    tags_backup = infotags;
                    tags = crud_util.getTagArray(tag1, tag2, tag3);
                    parameter_set = crud_util.getParamsArray(infotags, tags);
                    infotag_id = parameter_set[0];
                    tags = parameter_set[1];
                    query = parameter_set[2];
                    console.log(parameter_set);
                    return crud_util.execCRUD(infotag_id[0], info_id, tags[0], query[0]);
                })

                .then( infotag1 => {
                    console.log("result 0 : " +infotag1);
                    return crud_util.execCRUD(infotag_id[1], info_id, tags[1], query[1]);
                })

                .then( infotag2 => {
                    console.log("result 1 : " +infotag2);
                    return crud_util.execCRUD(infotag_id[2], info_id, tags[2], query[2]);
                })

                .then( infotag3 => {
                    console.log("result 2 : " +infotag3);
                    res.json({
                        code: 200,
                        message:"Update Success"
                    });
                })

                .catch( err => {
                    console.log("error occure in tag update \n"+ err);
                    //backup transaction 시간날 때 찾아보기.
                    Info.update(
                        {
                            category: info_backup.category,
                            shopname: info_backup.shopname,
                            address: info_backup.address,
                            menu: info_backup.menu,
                            operating_time: info_backup.operating_time,
                            letitude: info_backup.letitude,
                            longitude: info_backup.longitude
                        },
                        { 
                            where: { id: info_id } 
                        }
                    )

                    // .then( info => {

                    //     if(tags_backup)
                    //         return crud_util.getform(tags_backup[0].id, info_id, tags_backup[0].tag_id, backup_query[0]);
                    //     else
                    //         return new Promise();
                    // })

                    // .then( infotag1 => {
                    //     if(tags_backup[1])
                    //         return crud_util.getform(tags_backup[1].id, info_id, tags_backup[1].tag_id, backup_query[1])
                    //     else
                    //     {
                    //         return new Promise( (resolve, reject) => {
                    //             reject(new Error('no data to delete'));
                    //         });
                    //     }
                    // })

                    // .then( infotag2 => {
                    //     if(tags_backup[2])
                    //         return crud_util.getform(tags_backup[2].id, info_id, tags_backup[2].tag_id, backup_query[2])
                    //     else
                    //     {
                    //         return new Promise( (resolve, reject) => {
                    //             reject(new Error('no data to delete'));
                    //         });
                    //     }
                    // })

                    .then( result => {
                        res.json({
                            code: 500,
                            message: "shop update error (shop update)"
                        });
                    })
                    
                    .catch( err => {
                        console.log(err);
                        res.json({
                            code: 500,
                            message: "shop backup error (shop update)"
                        });
                    });
                });
            }
            else
            {

                res.json({
                    code: 403,
                    message: "No Permission (shop update)"
                });

            }
        })
        
        .catch( err => {
            console.log(err);
            res.json({
                code: 500,
                message: "user select error (shop update)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop update)"
        });

    }
};

//Shop Info Delete
exports.deleteShop = (req, res, next) => {
    let info_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {

        User.findOne({
            where: { id: token.user_id }
        })
        
        .then( user => {

            // 유저가 관리자인지 확인 ( 0 = 관리자, 1 = 유저 )
            if( user.status == 0 )
            {

                Info.findOne({
                    where: { id: info_id }
                })

                .then( info => {
                    console.log(info);
                    res.json({
                        code: 200,
                        message: "Delete Success"
                    });
                })
                
                .catch( error => {
                    res.json({
                        code: 500,
                        message: "delete error (shop delete)"
                    });
                });
            }
            else
            {

                res.json({
                    code: 403,
                    message: "No Permission (shop delete) "
                });

            }
        })

        .catch( err => {
            res.json({
                code: 500,
                message: "user select error (shop delete)",
                error: err
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop delete)"
        });

    }
};

exports.likeShop = (req, res, next) => {
    let info_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {
        // 테스트로는 token의 user_id를 받아서 user를 따로 조회 안하도록 만듦 -> 나중에 수정 가능
        InfoLike.findOne({
            where : {
                user_id: token.user_id,
                info_id: info_id
            }
        })
        .then( infolike => {
            if( infolike )
            {
                //이미 좋아요가 있으면 reject
                //reject 시키지 않으면 계속 resolve되어 increase하여 좋아요 수가 늘어남
                return new Promise( (resolve, reject) => {
                    reject(new Error('already like'));
                });
            }
            return InfoLike.create({
                user_id: token.user_id,
                info_id: info_id
            })
        })

        .then( infolike => {
            return Info.increment(
                { likenum: 1 },
                { where : { id: info_id } }
            );
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "like success (shop like)"
            });
        })
        
        .catch( err => {
            res.json({
                code: 500,
                message: "create error (shop like)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop like)"
        });

    }
};

exports.dislikeShop = (req, res, next) => {
    let info_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {
        // 테스트로는 token의 user_id를 받아서 user를 따로 조회 안하도록 만듦 -> 나중에 수정 가능
        InfoLike.findOne({
            where : {
                user_id: token.user_id,
                info_id: info_id
            }
        })

        .then( infolike => {

            console.log(infolike);
            if( !infolike )
            {
                return new Promise( (resolve, reject) => {
                    reject(new Error('no data to delete'));
                });
            }
            else
            {
                return InfoLike.destroy({
                    where : {
                        user_id: token.user_id,
                        info_id: info_id
                    }
                });
            }
        })

        .then( infolike => {
            return Info.decrement(
                { likenum: 1 },
                { where : { id: info_id } }
            );
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "dislike success (shop cancle like)"
            });
        })
        
        .catch( err => {
            res.json({
                code: 500,
                message: "no data in db already (shop cancle like)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop cancle like)"
        });

    }
};

//Shop Info Read - Dip List
exports.readDipList = (req, res, next) => {
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {

        Info.findAll({
            attributes: { 
                exclude : ['createdAt', 'updatedAt', 'deletedAt'] 
            },
            include: [
                {
                    attribute:  {

                    },
                    model: InfoDip,
                    required: true,
                    where: {user_id: token.user_id}
                }
            ]
        })

        .then( infos => {
            let shopnum = Object.keys(infos).length;
            let getShopJson = async function (infos) {
                let shops = [];
                for( i = 0; i < shopnum; i++ )
                {
                    let json = await crud_util.getShopData(infos[i]);
                    shops.push(json);
                }

                res.json({
                    shopnum: shopnum,
                    shops: shops
                });
            }

            let shops = getShopJson(infos);
        })
        
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop read list)"
        });

    }
};

exports.dipShop = (req, res, next) => {
    let info_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {
        // 테스트로는 token의 user_id를 받아서 user를 따로 조회 안하도록 만듦 -> 나중에 수정 가능
        InfoDip.findOne({
            where : {
                user_id: token.user_id,
                info_id: info_id
            }
        })
        .then( infodip => {
            if( infodip )
            {
                //이미 찜되어 있으면 reject
                return new Promise( (resolve, reject) => {
                    reject(new Error('already dip'));
                });
            }
            return InfoDip.create({
                user_id: token.user_id,
                info_id: info_id
            })
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "create success (shop dip)"
            });
        })
        
        .catch( err => {
            res.json({
                code: 500,
                message: "create error (shop dip)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop dip)"
        });

    }
};

exports.undipShop = (req, res, next) => {
    let info_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {
        // 테스트로는 token의 user_id를 받아서 user를 따로 조회 안하도록 만듦 -> 나중에 수정 가능
        InfoDip.findOne({
            where : {
                user_id: token.user_id,
                info_id: info_id
            }
        })

        .then( infodip => {

            if( !infodip )
            {
                return new Promise( (resolve, reject) => {
                    reject(new Error('no data'));
                });
            }
            else
            {
                return InfoDip.destroy({
                    where : {
                        user_id: token.user_id,
                        info_id: info_id
                    }
                });
            }
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "delete success (shop undip)"
            });
        })
        
        .catch( err => {
            res.json({
                code: 500,
                message: "Can't delete : no data in db already (shop undip)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop undip)"
        });

    }
};

exports.readReviews = (req, res, next) => {
    let info_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {
        InfoReview.findAll({
            // where : {
                
            // }
        })

        .then( inforeviews => {

            let reviewnum = Object.keys(inforeviews).length;
            let reviews = [];
            let json = {};

            for(key in info)
            {
                json.id = inforeviews[key].id;
                json.grade = inforeviews[key].grade;
                json.nickname = inforeviews[key].nickname;
                json.review = inforeviews[key].contents;
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
                message: "read error (shop read reviews)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop read reviews)"
        });

    }
};

exports.createReview = (req, res, next) => {
    let { info_id, grade, review } = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {
        InfoReview.create({
                info_id: info_id,
                user_id: token.user_id,
                grade: grade,
                contents: review
        })

        .then( inforeview => {
            
            return Info.update(
                { 
                    grade_avg: Sequelize.literal('((grade_avg * reviewnum) + ' + grade + ') / (reviewnum + 1)' ),
                    reviewnum: Sequelize.literal('reviewnum + 1')
                },
                { where : { id: info_id } }
            );
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "create success (shop review create)"
            });
        })
        
        .catch( err => {
            console.log(err);   
            res.json({
                code: 500,
                message: "create error (shop review create)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop review create)"
        });

    }
};

exports.updateReview = (req, res, next) => {
    let review_id = req.body.id;
    let { grade, review } = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);
    let before_grade;

    if( typeof token !== 'undefined')
    {
        InfoReview.findOne({
            where : { id: review_id }
        })

        .then( inforeview => {

            if( !inforeview )
            {
                return new Promise( (resolve, reject) => {
                    reject(new Error('no data to update'));
                });
            }
            else
            {
                before_grade = info_review.grade;
                return InfoReview.update(
                    {
                        grade: grade,
                        contents: review
                    },
                    {
                        where: {
                            user_id: token.user_id,
                            id: review_id
                        }
                    }
                );
            }
        })

        .then( inforeview => {

            return Info.update(
                { 
                    grade_avg: Sequelize.literal('grade_avg + ' + ( grade - before_grade ) / 'reviewnum' )
                },
                { where : { id: info_id } }
            );
        })

        .then( info => {
            res.json({
                code: 200,
                message: "update success (shop update review)"
            })
        })
        
        .catch( err => {
            res.json({
                code: 500,
                message: "update error (shop update review)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop update review)"
        });

    }
};

exports.deleteReview = (req, res, next) => {
    let info_id = req.body.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token !== 'undefined')
    {
        InfoReview.destroy({
            where : {
                user_id: token.user_id,
                info_id: info_id
            }
        })

        .then( inforeview => {

            // review 없을 시 reject
            if( !inforeview )
            {
                return new Promise( (resolve, reject) => {
                    reject(new Error('no data to delete'));
                });
            }
            else
            {
                return Info.decrement(
                    { reviewnum: 1 },
                    { where : { id: info_id } }
                );
            }
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "delete success (shop review delete)"
            });
        })
        
        .catch( err => {
            res.json({
                code: 500,
                message: "delete error (shop review delete)"
            });
        });
    }
    else
    {

        res.json({
            code: 400,
            message: "Can't read token (shop review delete)"
        });

    }
};

