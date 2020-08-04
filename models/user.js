module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user',{
        email :{
            type : DataTypes.STRING(30),
            allowNull : true,
            unique : true,
        },

        snsId : {
            type : DataTypes.STRING(30),
            allowNull : true,
        },

        password : {
            type : DataTypes.STRING(200),
            allowNull : true,
        },

        salt : {
            type : DataTypes.STRING(64),
            allowNull : true,
        },


        nickname : {
            type : DataTypes.STRING(40),
            allowNull : true,
            unique : true
        },

        provider : {
            type : DataTypes.STRING(40),
            allowNull : true,
            defaultValue : 'local',
        },

        status : {
            type : DataTypes.TINYINT(1),
            allowNull : true,
            defaultValue : 1,
        },

        p_photo : {
            type : DataTypes.STRING(100),
        },

        phone_num :{
            type : DataTypes.STRING(100)
        },

        gender : {
            type : DataTypes.TINYINT(1),
            allowNull : false,
            defaultValue : 1, 
        },

        // interest : {
        //     type : DataTypes.JSON,
        //     allowNull : true
        // },

        accessedAt : {
            type : DataTypes.DATE,
            allowNull : false,
            defaultValue : sequelize.literal('now()'),
        }
    
    },
    
        {
            timestamps : true,
            paranoid : true,
        }

    
    )

};