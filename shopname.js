const { sequelize, Op } = require('sequelize');
const { Course, Info } = require('./models');

Course.findAll()

.then( courses => {
    let updateShopname = async function (course) {
        let id = course.id;

        let shop1 = await Info.findOne({
            attributes: ['id', 'shopname'],
            where : {
                id : course.course_info1
            }
        })
        
        let course1 = await Course.update(
            { shopname1: shop1.shopname },
            { where: {
                id: id,
                course_info1: course.course_info1
            }}
        )

        let shop2 = await Info.findOne({
            attributes: ['id', 'shopname'],
            where : {
                id : course.course_info2
            }
        })
        
        let course2 = await Course.update(
            { shopname2: shop2.shopname },
            { where: {
                id: id,
                course_info2: course.course_info2 
            }}
        )

        let shop3 = await Info.findOne({
            attributes: ['id', 'shopname'],
            where : {
                id : course.course_info3
            }
        })
        
        let course3 = await Course.update(
            { shopname3: shop3.shopname },
            { where: {
                id: id,
                course_info3: course.course_info3 
            }}
        )
    }

    for(let i = 0; i < Object.keys(courses).length; i++)
    {
        updateShopname(courses[i]);
    }
})
