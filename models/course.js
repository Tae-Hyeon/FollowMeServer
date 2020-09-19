module.exports = (sequelize, DataTypes) => {
    return sequelize.define('course', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNULL: false
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNULL: false
        },

        user_nickname: {
            type: DataTypes.STRING(40),
            allowNULL: false
        },

        thema: {
            type: DataTypes.INTEGER,
            allowNULL: true
        },

        title: {
            type: DataTypes.STRING(200),
            allowNULL: false
        },

        main_photo: {
            type: DataTypes.STRING(100),
            defaultValue: process.env.IMAGE_DB_PATH + process.env.DEFAULT_IMAGE_NAME,
            allowNULL: false
        },

        course_info1: {
            type: DataTypes.INTEGER,
            allowNULL: true
        },

        shopname1: {
            type: DataTypes.STRING(40),
            allowNULL: true
        },

        course_info2: {
            type: DataTypes.INTEGER,
            allowNULL: true
        },

        shopname2: {
            type: DataTypes.STRING(40),
            allowNULL: true
        },

        course_info3: {
            type: DataTypes.INTEGER,
            allowNULL: true
        },

        shopname3: {
            type: DataTypes.STRING(40),
            allowNULL: true
        },
        
        grade_avg: {
            type: DataTypes.FLOAT,
            allowNULL: true,
            defaultValue: 0
        },

        dday: {
            type: DataTypes.DATEONLY,
            allowNULL: true
        },

        reviewnum: {
            type: DataTypes.INTEGER,
            allowNULL: false,
            defaultValue: 0
        },

        likenum: {
            type: DataTypes.INTEGER,
            allowNULL: false,
            defaultValue: 0
        },

        share: {
            type: DataTypes.TINYINT(1),
            allowNULL: false,
            defaultValue: 0
        }

    }, 
        
        {
            timestamp: false,
            paranoid: true,
            underscored: true,
        }

    );
    
};
