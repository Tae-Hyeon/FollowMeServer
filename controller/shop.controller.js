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

    let token = req.headers.authorization;

    if( typeof token !== 'undefined')
    {
        let user_id = jwt_util.getAccount(token);

        User.findOne({
            where: { id: user_id }
        })
        
        .then( user => {

            // 유저가 관리자인지 확인 ( 0 = 관리자, 0 = 유저 )
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
                    if( tag1 != null && tag2 != null && tag3 != null)
                    {

                        InfoTag.create({
                            info_id: info.id,
                            tag_id: tag1
                        })
                        
                        .then( next => {

                            InfoTag.create({
                                info_id: info.id,
                                tag_id: tag2
                            })

                            .then( next => {

                                InfoTag.create({
                                    info_id: info.id,
                                    tag_id: tag3
                                });

                            });

                        }).then( next => {

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
    let id = req.params.id;
    let token = jwt_util.getAccount(req.headers.authorization);
    let like = 2;

    if( typeof token !== 'undefined')
    {
        
        User.findOne({
            where: { id: token.user_id }
        })
        
        .then( user => {
            
            Info.findOne({
                where: { id: id }
            })
            
            .then( info => {
                
                // Info-Tag 태그 관계 확인
                InfoTag.findAll({
                    where: { info_id: id }
                })

                .then( tag => {
                    
                    // tag 값 초기화
                    let tag1 = (tag[0] == null) ? null : tag[0].id;
                    let tag2 = (tag[1] == null) ? null : tag[1].id;
                    let tag3 = (tag[2] == null) ? null : tag[2].id;

                    // Info-User 좋아요 관계 확인
                    InfoLike.findOne({
                        where: {
                            user_id: user.id,
                            info_id: id
                        }
                    })

                    .then( infolike => {

                        if( infolike == 'undefined')
                            like = 0;
                        else
                            like = 1;
                        
                        res.json({
                            id: info.id,
                            category: info.category,
                            shopname: info.shopname,
                            addreess: info.addreess,
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

                });
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
    console.log(category, tag);
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
        category, shopname, address,
        menu, operating_time, introduce,
        letitude, longitude, tag1, tag2, tag3 
    } = req.body;
    let token = req.headers.authorization;

    if( typeof token !== 'undefined')
    {

        User.findOne({
            where: { id: user_id }
        })
        
        .then( user => {

            // 유저가 관리자인지 확인 ( 0 = 관리자, 0 = 유저 )
            if( user.status == 0 )
            {

                Info.update({
                    
                },
                { where: {
            
                }})

            }
            else
            {

                res.json({
                    code: 403,
                    message: "No Permission (shop update) "
                });

            }
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
    let { 
        category, shopname, address,
        menu, operating_time, introduce,
        letitude, longitude, tag1, tag2, tag3 
    } = req.body;
    let token = req.headers.authorization;

    if( typeof token !== 'undefined')
    {

        User.findOne({
            where: { id: user_id }
        })
        
        .then( user => {

            // 유저가 관리자인지 확인 ( 0 = 관리자, 0 = 유저 )
            if( user.status == 0 )
            {

                Info.update({
                    
                },
                { where: {
            
                }})

            }
            else
            {

                res.json({
                    code: 403,
                    message: "No Permission (shop create) "
                });

            }
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