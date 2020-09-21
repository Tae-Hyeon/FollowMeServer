const {InfoThema } = require('../models');

exports.getShopData = (info) => {
    return new Promise( resolve => {
        let json = {};

        json.id = info.id;
        json.shopname = info.shopname;
        json.address = info.address;
        json.grade_avg = info.grade_avg;
        json.main_photo = 'null';

        if(info.main_photo)
        {
            let photo_num = "photo" + info.main_photo;
            json.main_photo = info[photo_num];
        }

        resolve(json);
    })
}

exports.getThemaArray = (thema1, thema2, thema3) => {
    let thema = []
    let arr = [thema1, thema2, thema3];
    arr.forEach(element => {
        if(element)
            thema.push(Number(element));
    });
    return thema;
};

exports.getParamsArray = (infothemas, themas) => {
    let infothema_id_nothing = []; 
    let infothema_id_crud = [];
    let thema_id = [];
    let crt = themas;
    let query = [];
    let before_leng = Object.keys(infothemas).length;
    let after_leng = themas.length;

    infothemas.forEach(element => {
        if(element)
            infothema_id_crud.push(element.id);
    });
    infothema_id_crud;

    infothemas.forEach(element => {
        if(element)
        {
            let isBeing = crt.indexOf(element.thema_id);
            let isBeing2 = crt.findIndex(thema => thema == element.thema_id);
            console.log(isBeing, isBeing2, typeof element.thema_id, typeof crt[0]);
            if(isBeing != -1)
            {
                query.push("nothing");
                infothema_id_nothing.push(element.id);
                infothema_id_crud.splice(infothema_id_crud.indexOf(element.id), 1);
                thema_id.push(-1);
                crt.splice(isBeing, 1);
                before_leng--; after_leng--;
            }
        }
    });
    console.log(before_leng, after_leng);
    while ( !(after_leng == 0 && before_leng == 0))
    {
        if(before_leng > 0 && after_leng > 0)
        {
            query.push("update");
            before_leng--;
            after_leng--;
        }
        else if(before_leng > after_leng)
        {
            query.push("delete");
            before_leng--;
        }
        else if(before_leng < after_leng)
        {
            infothema_id_crud.push(-1);
            query.push("create");
            after_leng--;
        }
    }

    return [infothema_id_nothing.concat(infothema_id_crud), thema_id.concat(crt), query];
};

exports.execCRUD = ( id, info_id, thema_id, query) => { 
    console.log(id, info_id, thema_id, query);
    if(query == "update")
    {
        return InfoThema.update(
            { thema_id: thema_id },
            { 
                where: { 
                    info_id: info_id, 
                    id: id
                }
            }
        );
    }
    else if(query == "create")
    {
        return InfoThema.create({
            info_id: info_id,
            thema_id: thema_id
        });
    }
    else if(query == "delete")
    {
        return InfoThema.destroy({
            where :{
                id: id
            }
        });
    }
    else if(query == "nothing")
    {
        return new Promise( (resolve, reject) => {
            resolve();  
        });
    }
}

exports.getBackupQuery = (changed_id) => {
    let query = [];
    for( i = 0; i < changed_id[0].length; i++ )
        query.push("update");
    for( i = 0; i < changed_id[1].length; i++ )
        query.push("delete");
    for( i = 0; i < changed_id[2].length; i++ )
        query.push("create");
    for( i = 0, j=query.length; i < 3 - j; i++ )
        query.push("nothing");

    return query;
}