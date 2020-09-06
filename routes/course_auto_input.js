const express = require('express');
const router = express.Router();
const { Course, CourseLike} = require('../models');
function getRandomArbitrary(min, max) {
    return new Promise( resolve => {
        resolve(Math.floor(Math.random() * (max - min) + min));
    })
}
function insert0 (num) {
    return (num <10) ? ("0"+num) : num;
}

router.get('/', function (req, res, next) {
    //let datas=data.split('/ ');
    var autoCreate = async function () {
        var user_nickname = ["admin", "user1", "user2", "user3", "user4", "user5", "user6"];
        var category = [1,2,3];
        var title = ["강남 데이트코스", "홍대에서 데이트", "남친과 데이트", "동성친구와 데이트", "먹거리", "데일리 데이트", "오락 데이트", "비오는날 어디가", "산책코스", "더운 여름 나기"];
        var contents = ["호화로운 데이트", "사치", "쉬기에 너무 좋아", "오늘 행복해요", "여기 추천합니다", "이코스 대박", "뭐라하지 이거", "다음에 또 가고싶어"];
        var dday = ["2020-09-14", "2020-09-01", "2020-09-02", "2020-09-03", "2020-09-04", "2020-09-05", "2020-09-06", "2020-09-07"]
        var shopname = ["중앙해장", "브루클린더버거조인트", "농민백암순대 본점", "다운타우너 청담점", "쮸즈", "미즈컨테이너", "미미면가", "요멘야 고에몬", "어글리스토브", "백년옥 본점", "쉑쉑버거", "하동관 코엑스점", "반룡산", "새벽집", "알베르", "리틀넥", "애플하우스", "호랑이식당", "목포집", "대우식당", "뽕나무쟁이 족발", "대가방", "진미평양냉면", "브라더후드키친", "한성돈까스"];

        let getInfosJson = async function (course_id) {
            let json = {};
            let info_id = [], shopnames = []; 
            for(i = 0; i<3; i++)
            {
                let id = await getRandomArbitrary(1,25);
                while(info_id.find(element => {element == id}))
                {
                    id = await getRandomArbitrary(1,25);
                }
                info_id.push(id);
                shopnames.push(shopname[id-1]);
            }

            return [course_id, info_id[0], shopnames[0], info_id[1], shopnames[1], info_id[2], shopnames[2]];
        }

        for(let i=0; i<3; i++)
        {
            let id = await getRandomArbitrary(1,7);
            let category_index = await getRandomArbitrary(0,3);
            let title_index = await getRandomArbitrary(0,10);
            let contents_index = await getRandomArbitrary(0,8);
            let dday_index = await getRandomArbitrary(0,8);
            let grade_avg = await getRandomArbitrary(0,11);

            let course = await Course.create({
                user_id: id,
                user_nickname: user_nickname[id - 1],
                category: category[category_index],
                title: title[title_index],
                contents: contents[contents_index],
                grade_avg: grade_avg,
                dday: dday[dday_index]
            })

            let data = await new Promise(resolve => {
                    resolve(getInfosJson(course.id))
            });
            console.log(data);
            let updated_course = await Course.update(
                {
                    course_info1: data[1],
                    shopname1: data[2],
                    course_info2: data[3], 
                    shopname2: data[4],
                    course_info3: data[5],
                    shopname3: data[6]
                },
                {
                    where: {id: data[0]}
                }
            ).then(upt => {
                return new Promise(resolve => {
                    resolve(30);
                });
            });
        }
    }
    autoCreate();
});


router.get('/like', function (req, res, next) {
    
    var autoCreate = async function () {
        for(let i=0; i<25; i++)
        {
            let user_id = await getRandomArbitrary(1,7);
            let course_id = await getRandomArbitrary(1,50);
            let month = await getRandomArbitrary(8, 10);
            let date = await getRandomArbitrary(1,30);
            let created_at = "2020-" + insert0(month) + "-" + insert0(date) + " 00:00:00";

            CourseLike.findOne({
                where: {
                    course_id: course_id,
                    user_id: user_id
                }
            })

            .then( course_like => {
                if(!course_like)
                {
                    return CourseLike.create({
                        course_id: course_id,
                        user_id: user_id,
                        created_at: created_at
                    })
                }

            });
        }
    }
    autoCreate();
});

module.exports = router;
