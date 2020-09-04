const express = require('express');
const router = express.Router();
const { Course } = require('../models');
function getRandomArbitrary(min, max) {
    return new Promise( resolve => {
        resolve(Math.floor(Math.random() * (max - min) + min));
    })
}
router.get('/', function (req, res, next) {
    //let datas=data.split('/ ');

    let user_id = [1,2,3];
    let user_nickname = ["admin", "user1", "user2"];
    let category = [1,2,3];
    let title = ["강남 데이트코스", "홍대에서 데이트", "남친과 데이트", "동성친구와 데이트", "먹거리", "데일리 데이트", "오락 데이트", "비오는날 어디가", "산책코스", "더운 여름 나기"];
    let contents = ["호화로운 데이트", "사치", "쉬기에 너무 좋아", "오늘 행복해요", "여기 추천합니다", "이코스 대박", "뭐라하지 이거", "다음에 또 가고싶어"];
    let dday = ["2020-09-14", "2020-09-01", "2020-09-02", "2020-09-03", "2020-09-04", "2020-09-05", "2020-09-06", "2020-09-07"]
    for(let i=0; i<25; i++)
    {
        user_index = user_id[getRandomArbitrary(0,3)];
        Course.create({
            user_id: user_index,
            user_nickname: user_nickname[user_index-1],
            category: category[getRandomArbitrary(0,3)],
            title: title[getRandomArbitrary(0,10)],
            contents: contents[getRandomArbitrary(0,8)],
            dday: dday[[getRandomArbitrary(0,8)]]
        })

        .then(course => {
            let getInfosJson = async function () {
                let json = {};
                let shopname = ["중앙해장", "브루클린더버거조인트", "농민백암순대 본점", "다운타우너 청담점", "쮸즈", "미즈컨테이너", "미미면가", "요멘야 고에몬", "어글리스토브", "백년옥 본점", "쉑쉑버거", "하동관 코엑스점", "반룡산", "새벽집", "알베르", "리틀넥", "애플하우스", "호랑이식당", "목포집", "대우식당", "뽕나무쟁이 족발", "대가방", "진미평양냉면", "브라더후드키친", "한성돈까스"];
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

                return Course.update(
                    {
                        course_info1: info_id[0],
                        shopname1: shopnames[0],
                        course_info2: info_id[1], 
                        shopname2: shopnames[1],
                        course_info3: info_id[2],
                        shopname3: shopnames[2]
                    },
                    {
                        where: {id: course.id}
                    }
                );
            }

            getInfosJson();
        })
    }

});

module.exports = router;
