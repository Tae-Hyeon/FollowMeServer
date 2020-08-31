const env = process.env;
const { Sequelize, sequelize, Op, QueryTypes} = require('sequelize');
const { User, Course, CourseLike, CourseReview, CourseShare, Info } = require('../models');
const model = require('../models');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

const insert0 = (data) => {
    return (data < 10) ? ("0"+data ) : data;
}

exports.recommend_update = () => {
    console.log('recommend update ....');
    let date = new Date();
    let yesterday = date.getFullYear() + '-' + insert0(date.getMonth() + 1) + '-' + insert0(date.getDate() - 1);
    let today = date.getFullYear() + '-' + insert0(date.getMonth() + 1) + '-' + insert0(date.getDate());

    let query = `
    SELECT 
	infos.id, infos.shopname, infos.address, infos.grade_avg,
    COUNT(info_likes.id) AS likes
    FROM infos
    JOIN info_likes
    ON ( infos.id = info_likes.info_id )
    WHERE ( DATE(info_likes.created_at) >= :yesterday AND DATE(info_likes.created_at) < :today )
    GROUP BY infos.id
    ORDER BY likes DESC
    LIMIT 0, 9;
    `

    model.sequelize.query(
        query,
        {
            replacements: {
                'yesterday': yesterday,
                'today': today
            },
            type: QueryTypes.SELECT
        }
    )

    .then( infos =>{
        // console.log("result : \n");
        // for( i = 0; i < Object.keys(infos).length; i++)
        // {
        //     console.log(infos[i]);
        // }

        let json = {};
        client.set('recommend', JSON.stringify(infos));
        // client.get('recommend', function (err, reply) {
        //     console.log(reply.toString());
        //     json = JSON.parse(reply.toString());
        //     console.log(json);
        // })
    });

}