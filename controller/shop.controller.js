const env = process.env;
const { Sequelize, sequelize, Op, QueryTypes} = require('sequelize');
const { User, Info, InfoLike, InfoReview, InfoThema} = require('../models');
const model = require('../models');

const jwt_util = require('../js/jwt_util');
const crud_util = require('../js/crud_util');

const fs = require('fs');
const image_path = env.IMAGE_PATH;
const image_db_path = env.IMAGE_DB_PATH;
const image_middle_path = env.IMAGE_MIDDLE_PATH;
const default_image_name = env.DEFAULT_IMAGE_NAME;

//Shop Info Create
exports.createShop = (req, res, next) => {

    let { 
        category, shopname, address, menu, operating_time, 
        latitude, longitude, thema1, thema2, thema3, main_photo
    } = req.body;

    let files = req.files;

    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
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
                    latitude: latitude,
                    longitude: longitude
                })
                
                .then( info => {

                    // create thema
                    if( !(thema1 == null && thema2 == null && thema3 == null) )
                    {

                        let infothemas = []

                        if( thema1 )
                            infothemas[0] = { info_id: info.id, thema_id: thema1 };
                        if( thema2 )
                            infothemas[1] = { info_id: info.id, thema_id: thema2 };
                        if( thema3 )
                            infothemas[2] = { info_id: info.id, thema_id: thema3 };
                            

                        InfoThema.bulkCreate(infothemas)

                        .then( () => { 
                            res.json({
                                code: 200,
                                message: "Create Success"
                            });  
                        });
                    }
                    else // no create thema
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
            console.log(err);
            res.json({
                code: 500,
                message: "user select error (shop create)",
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

    if( typeof token != 'undefined')
    {
        
        User.findOne({
            where: { id: token.user_id }
        })
        
        .then( user => {
            return Info.findOne({
                include: [
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
                latitude: info.latitude,
                longitude: info.longitude,
                like: like,
                main_photo: info.main_photo,
                photos: [
                    info.photo1,
                    info.photo2,
                    info.photo3,
                    info.photo4,
                    info.photo5,
                    info.photo6,
                    info.photo7,
                    info.photo8,
                    info.photo9,
                    info.photo10
                ]
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
    let { category, thema } = req.query;
    let token = jwt_util.getAccount(req.headers.authorization);

    let category_json = (category) ? {'category': category} : {};
    let thema_json = (thema) ? {'thema_id': thema} : {};

    let query = {
        attributes: { 
            exclude : ['createdAt', 'updatedAt', 'deletedAt'] 
        }
    }

    if (category)
        query.where = category_json
    if (thema)
    {
        query.include = [
            {
                attributes: {
                    include : ['thema_id'],
                    exclude : ['created_at', 'updated_at', 'deleted_at']
                },
                model: InfoThema,
                required: true,
                where: thema_json
            }
        ]
    }

    if( typeof token != 'undefined')
    {

        Info.findAll(query)

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
        latitude, longitude, thema1, thema2, thema3, main_photo
    } = req.body;

    let token = jwt_util.getAccount(req.headers.authorization);
    let themas, parameter_set, infothema_id, query;
    let info_backup;

    if( typeof token != 'undefined')
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
                            latitude: latitude,
                            longitude: longitude,
                            main_photo: main_photo
                        },
                        { 
                            where: { id: info_id } 
                        }
                    )
                })

                .then( info => {

                    return InfoThema.findAll({
                        where: { info_id: info_id }
                    })

                })

                .then( infothemas => {
                    
                    themas_backup = infothemas;
                    themas = crud_util.getThemaArray(thema1, thema2, thema3);
                    parameter_set = crud_util.getParamsArray(infothemas, themas);
                    infothema_id = parameter_set[0];
                    themas = parameter_set[1];
                    query = parameter_set[2];
                    
                    return crud_util.execCRUD(infothema_id[0], info_id, themas[0], query[0]);
                })

                .then( infothema1 => {
                    return crud_util.execCRUD(infothema_id[1], info_id, themas[1], query[1]);
                })

                .then( infothema2 => {
                    return crud_util.execCRUD(infothema_id[2], info_id, themas[2], query[2]);
                })

                .then( infothema3 => {
                    res.json({
                        code: 200,
                        message:"Update Success"
                    });
                })

                .catch( err => {
                    console.log("error occure in thema update \n"+ err);
                    //backup transaction 시간날 때 찾아보기.
                    Info.update(
                        {
                            category: info_backup.category,
                            shopname: info_backup.shopname,
                            address: info_backup.address,
                            menu: info_backup.menu,
                            operating_time: info_backup.operating_time,
                            latitude: info_backup.latitude,
                            longitude: info_backup.longitude
                        },
                        { 
                            where: { id: info_id } 
                        }
                    )

                    // .then( info => {

                    //     if(themas_backup)
                    //         return crud_util.getform(themas_backup[0].id, info_id, themas_backup[0].thema_id, backup_query[0]);
                    //     else
                    //         return new Promise();
                    // })

                    // .then( infothema1 => {
                    //     if(themas_backup[1])
                    //         return crud_util.getform(themas_backup[1].id, info_id, themas_backup[1].thema_id, backup_query[1])
                    //     else
                    //     {
                    //         return new Promise( (resolve, reject) => {
                    //             reject(new Error('no data to delete'));
                    //         });
                    //     }
                    // })

                    // .then( infothema2 => {
                    //     if(themas_backup[2])
                    //         return crud_util.getform(themas_backup[2].id, info_id, themas_backup[2].thema_id, backup_query[2])
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

    if( typeof token != 'undefined')
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
                    res.json({
                        code: 200,
                        message: "Delete Success"
                    });
                })
                
                .catch( err => {
                    console.log(err);
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
            console.log(err);
            res.json({
                code: 500,
                message: "user select error (shop delete)",
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

    if( typeof token != 'undefined')
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
            console.log(err);
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

    if( typeof token != 'undefined')
    {
        let info_json = {};
        let info_array = info_id.split(',');
    
        // 테스트로는 token의 user_id를 받아서 user를 따로 조회 안하도록 만듦 -> 나중에 수정 가능
        InfoLike.findAll({
            where : {
                user_id: token.user_id,
                info_id: {
                    [Op.or] : info_array
                }
            }
        })

        .then( infolike => {

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
                        info_id: info_array
                    }
                });
            }
        })

        .then( infolike => {
            return Info.decrement(
                { likenum: 1 },
                { where : { id: { [Op.or] : info_array } } }
            );
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "dislike success (shop cancle like)"
            });
        })
        
        .catch( err => {
            console.log(err);
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

//Shop Info Read - Like List
exports.readLikeList = (req, res, next) => {
    let info_id = req.query.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
    {

        Info.findAll({
            attributes: { 
                exclude : ['createdAt', 'updatedAt', 'deletedAt'] 
            },
            include: [
                {
                    attribute:  {

                    },
                    model: InfoLike,
                    required: true,
                    where: {user_id: token.user_id}
                }
            ],
            where: {id: info_id}
        })

        .then( infos => {
            console.log(infos);
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
            message: "Can't read token (shop read like list)"
        });

    }
};

exports.readReviews = (req, res, next) => {
    let shop_id = req.query.id;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
    {
        let query = `
        SELECT 
            info_reviews.id, info_reviews.grade, info_reviews.contents,
            users.nickname
        FROM info_reviews
        LEFT OUTER JOIN (users)
        ON (info_reviews.user_id = users.id)
        WHERE (info_reviews.info_id = :info_id)
        `
        model.sequelize.query(
            query,
            {
                replacements: {
                    'info_id': shop_id
                },
                type: QueryTypes.SELECT
            }
        )

        .then( info_reviews => {

            let reviewnum = Object.keys(info_reviews).length;
            return new Promise( resolve => {
                let review_array = info_reviews;
                let reviews = [];
                for(let i = 0; i <= review_array.length; i++)
                {
                    if( i == review_array.length )
                    {
                        resolve(reviews);
                    }
                    let json = {};
                    json.id = review_array[i].id;
                    json.grade = review_array[i].grade;
                    json.nickname = review_array[i].nickname;
                    json.review = review_array[i].contents;
                    reviews.push(json);
                }
            })
            .then( reviews => {
                res.json({
                    reviewnum: reviewnum,
                    reveiws : reviews
                })
            })
        })
        
        .catch( err => {
            console.log(err);
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
    let { shop_id, grade, review } = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);

    if( typeof token != 'undefined')
    {
        InfoReview.create({
                info_id: shop_id,
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

    if( typeof token != 'undefined')
    {
        InfoReview.findOne({
            where : { id: review_id }
        })

        .then( info_review => {

            if( !info_review )
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

        .then( info_review => {

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
            console.log(err);
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

    if( typeof token != 'undefined')
    {
        InfoReview.findOne({
            where : {
                user_id: token.user_id,
                info_id: info_id
            }
        })

        .then( info_review => {

            if( !info_review )
            {
                return new Promise( (resolve, reject) => {
                    reject(new Error('no data to update'));
                });
            }
            else
            {
                before_grade = info_review.grade;
                return InfoReview.destroy({
                    where : {
                        user_id: token.user_id,
                        info_id: info_id
                    }
                }). then( next => {
                    Info.update(
                        { 
                            grade_avg: Sequelize.literal('((grade_avg * reviewnum) - ' + grade + ') / (reviewnum - 1)' ),
                            reviewnum: Sequelize.literal('reviewnum - 1')
                        },
                        { where : { id: info_id } }
                    );
                });
            }
        })

        .then( result =>{
            res.json({
              code: 200,
              message: "delete success (shop review delete)"
            });
        })
        
        .catch( err => {
            console.log(err);
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

