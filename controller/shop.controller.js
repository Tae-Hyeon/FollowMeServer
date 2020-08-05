const env = process.env;
const { Sequelize, sequelize, Op} = require('sequelize');
const { User, Info, InfoLike, InfoReview, InfoTag } = require('../models');

const jwt_util = require('../js/jwt_util');

//Shop Info Create
exports.createShop = (req, res, next) => {

    let { 
        category, shopname, address,
        menu, operating_time, introduce,
        letitude, longitude, tag1, tag2, tag3 
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
                    introduce: introduce,
                    grade_avg: 0,
                    letitude: letitude,
                    longitude: longitude
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
                message: "user select error (shop update)",
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
                        where: { info_id : info_id }
                    }, 
                    {
                        model: InfoLike,
                        required: false, // lett outer join
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
                introduce: info.introduce,
                grade_avg: info.grade_avg,
                letitude: info.letitude,
                longitude: info.longitude,
                like: like,
                tag1: tag1,
                tag2: tag2,
                tag3: tag3
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
    let token = req.headers.authorization;
    //console.log(category, tag, token);

    if( typeof token !== 'undefined')
    {

        Info.findAll({
            attribute: { 
                exclude : ['createdAt', 'updatedAt', 'deletedAt'] 
            },
            include: [
                {
                    attribute: {
                        include : ['tag_id'],
                        exclude : ['created_at', 'updated_at', 'deleted_at']
                    },
                    model: InfoTag,
                    where: { tag_id: tag }
                }
            ],

            where: { category: category }
        })

        .then( info => {
            let shopnum = Object.keys(info).length;
            let shops = [];
            let json = {};

            for(key in info)
            {
                json.id = info[key].id;
                json.shopname = info[key].shopname;
                json.address = info[key].address;
                json.grade_avg = info[key].grade_avg;
                shops.push(json);
            }

            res.json({
                shopnum: shopnum,
                shops: shops
            });
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
    let { 
        id, category, shopname, address,
        menu, operating_time, introduce,
        letitude, longitude, tag1, tag2, tag3 
    } = req.body;
    let token = jwt_util.getAccount(req.headers.authorization);

    //console.log(id, category, req.body); 

    if( typeof token !== 'undefined')
    {

        User.findOne({
            where: { id: token.user_id }
        })
        
        .then( user => {

            // 유저가 관리자인지 확인 ( 0 = 관리자, 1 = 유저 )
            if( user.status == 0 )
            {

                Info.update(
                    {
                        category: category,
                        shopname: shopname,
                        address: address,
                        menu: menu,
                        operating_time: operating_time,
                        introduce: introduce,
                        grade_avg: 0,
                        letitude: letitude,
                        longitude: longitude
                    },
                    { 
                        where: { id: id } 
                    }
                )

                .then( info => {

                    return InfoTag.findAll({
                        attribute: ['id'],
                        required: true,
                        where: { info_id: id }
                    })

                })

                .then( infotags => {
                    console.log(infotags);
                    let tag_num_before = Object.keys(infotags).length;

                    let tag = [];

                    let delete_;
                    [tag1, tag2, tag3].forEach(element => {
                        if(element)
                            tag.push(element);
                    });

                    let tag_num_after = tag.length;
                    let getform = ( id, info_id, tag_id) => { 
                        return {
                            update : [
                                { tag_id: tag_id },
                                { 
                                    where: { 
                                        info_id: info_id, 
                                        id: id
                                    }
                                }
                            ],
                            create : {
                                info_id: info_id,
                                tag_id: tag_id
                            }
                            ,
                            delete : {
                                where :{
                                    id: id
                                }
                            }
                            
                        }
                    }

                    let getQuery = ( before, after, form ) => {
                        if( before < after ){

                        }
                    };

                    return InfoTag.update(
                        { tag_id: tag1 },
                        { 
                            where: { 
                                info_id: id, 
                                id: infotags[0].id 
                            }
                        }
                    )
                    
                    .then( infotag1 => {
                        return InfoTag.update(
                            { tag_id: tag2 },
                            {
                                where: { 
                                    info_id: id, 
                                    id: infotags[1].id 
                                }
                            }
                        )
                    })

                    .then( infotag2 => {
                        return InfoTag.update(
                            { tag_id: tag3 },
                            {
                                where: { 
                                    info_id: id, 
                                    id: infotags[2].id 
                                }
                            }
                        )
                    })

                    .catch( err => {
                        res.json({
                            code: 500,
                            message: "tag update error (shop update)",
                            error: err
                        })
                    });
                })
                
                .then( result => {
                    res.json({
                        code: 200,
                        message:"Update Success"
                    });
                })
                    
                .catch( err => {
                    console.log(err);
                    res.json({
                        code: 500,
                        message: "shop update error (shop update)",
                        error: err
                    });
                });
            }
            else
            {

                res.json({
                    code: 403,
                    message: "No Permission (shop update) "
                });

            }
        })
        
        .catch( err => {
            res.json({
                code: 500,
                message: "user select error (shop update)",
                error: err
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
                //console.log(infolike);
                // res.json({
                //     code: 500,
                //     message: "like fail - already like (shop like)"
                // });
                return new Promise( (resolve, reject) => {
                    reject();
                });
                //reject 시키지 않으면 계속 resolve되어 increase하여 좋아요 수가 늘어남
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
                    reject();
                });
            }

            return InfoLike.destroy({
                where : {
                    user_id: token.user_id,
                    info_id: info_id
                }
            });
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

exports.createReview = (re1, res, next) => {

};

exports.updateReview = (re1, res, next) => {

};

exports.deleteReview = (re1, res, next) => {

};

