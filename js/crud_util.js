const {InfoTag } = require('../models');
const { readShopList } = require('../controller/shop.controller');

exports.getShopData = (info) => {
    return new Promise( resolve => {
        let json = {};

        json.id = info.id;
        json.shopname = info.shopname;
        json.address = info.address;
        json.grade_avg = info.grade_avg;

        if(info.main_photo)
        {
            let photo_num = "photo" + info.main_photo;
            json.photo = info[photo_num];
        }

        resolve(json);
    })
}

exports.getTagArray = (tag1, tag2, tag3) => {
    let tag = []
    let arr = [tag1, tag2, tag3];
    arr.forEach(element => {
        if(element)
            tag.push(Number(element));
    });
    return tag;
};

exports.getParamsArray = (infotags, tags) => {
    let infotag_id_nothing = []; 
    let infotag_id_crud = [];
    let tag_id = [];
    let crt = tags;
    let query = [];
    let before_leng = Object.keys(infotags).length;
    let after_leng = tags.length;

    infotags.forEach(element => {
        if(element)
            infotag_id_crud.push(element.id);
    });
    infotag_id_crud;

    infotags.forEach(element => {
        if(element)
        {
            let isBeing = crt.indexOf(element.tag_id);
            let isBeing2 = crt.findIndex(tag => tag == element.tag_id);
            console.log(isBeing, isBeing2, typeof element.tag_id, typeof crt[0]);
            if(isBeing != -1)
            {
                query.push("nothing");
                infotag_id_nothing.push(element.id);
                infotag_id_crud.splice(infotag_id_crud.indexOf(element.id), 1);
                tag_id.push(-1);
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
            infotag_id_crud.push(-1);
            query.push("create");
            after_leng--;
        }
    }

    return [infotag_id_nothing.concat(infotag_id_crud), tag_id.concat(crt), query];
};

exports.execCRUD = ( id, info_id, tag_id, query) => { 
    console.log(id, info_id, tag_id, query);
    if(query == "update")
    {
        return InfoTag.update(
            { tag_id: tag_id },
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
        return InfoTag.create({
            info_id: info_id,
            tag_id: tag_id
        });
    }
    else if(query == "delete")
    {
        return InfoTag.destroy({
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