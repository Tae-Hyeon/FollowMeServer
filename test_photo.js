const { Info } = require('./models');

function getRandomArbitrary(min, max) {
    return new Promise( resolve => {
        resolve(Math.floor(Math.random() * (max - min) + min));
    })
}

for(let i = 0; i < 30; i ++)
{
    let photo_input = async function (id) {
        let times = await getRandomArbitrary(1,11);
        let photo_array = [];
        let photo_json = {
            'main_photo': 1,
            'photo1': null,
            'photo2': null,
            'photo3': null,
            'photo4': null,
            'photo5': null,
            'photo6': null,
            'photo7': null,
            'photo8': null,
            'photo9': null,
            'photo10': null,
        }
        for(let j = 0; j <= times; j++)
        {
            if (j == times)
            {
                Info.update(
                    photo_json,
                    {
                        where: {id: id}
                    }
                )
                break;
            }
            let photo_num = await getRandomArbitrary(1,11);
            while(photo_array.find(element => {element == photo_num}))
            {
                photo_num = await getRandomArbitrary(1,11);
            }
            photo_array.push(photo_num);
            let key = 'photo' + (j+1);
            let val = process.env.IMAGE_PATH + photo_num + '.jpg';

            photo_json[key] = val;
        }
    }
    photo_input(i);
}
