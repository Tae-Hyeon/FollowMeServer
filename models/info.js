module.exports = (sequelize, DataTypes) => {
    return sequelize.define('info', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNULL: false
        },

        category: {
            type: DataTypes.INTEGER
        },

        shopname: {
            type: DataTypes.STRING(40),
            allowNULL: true
        },

        address: {
            type: DataTypes.STRING(100),
            allowNULL: true
        },

        menu: {
            type : DataTypes.STRING(500),
            allowNULL: true
        },

        operatingTime: {
            type: DataTypes.STRING(30),
            allowNULL: true
        },
    
        grade_avg: {
            type: DataTypes.FLOAT,
            allowNULL: true,
            defaultValue: 0
        },

        latitude: {
            type: DataTypes.INTEGER,
            allowNULL: true
        },
        
        longitude: {
            type: DataTypes.INTEGER,
            allowNULL: true
        },

        reviewnum: {
            type: DataTypes.INTEGER,
            allowNULL: true,
            defaultValue: 0
        },

        likenum: {
            type: DataTypes.INTEGER,
            allowNULL: true,
            defaultValue: 0
        },

        main_photo: {
            type: DataTypes.INTEGER,
            allowNULL: true
        },

        photo1: {
            type: DataTypes.STRING(100),
            allowNULL: true
        },
        
        photo2: {
            type: DataTypes.STRING(100),
            allowNULL: true
        },
        
        photo3: {
            type: DataTypes.STRING(100),
            allowNULL: true
        },
        
        photo4: {
            type: DataTypes.STRING(100),
            allowNULL: true
        },
        
        photo5: {
            type: DataTypes.STRING(100),
            allowNULL: true
        },
        
        photo6: {
            type: DataTypes.STRING(100),
            allowNULL: true
        },
        
        photo7: {
            type: DataTypes.STRING(100),
            allowNULL: true
        },
        
        photo8: {
            type: DataTypes.STRING(100),
            allowNULL: true
        },
        
        photo9: {
            type: DataTypes.STRING(100),
            allowNULL: true
        },
        
        photo10: {
            type: DataTypes.STRING(100),
            allowNULL: true
        },

        created_at: {
            type: DataTypes.DATE,
            allowNULL: true,
            defaultValue: sequelize.literal('now()')
        }

    }, 

        {
            timestamp: false,
            paranoid: true,
            underscored: true,
        }

    );

};
