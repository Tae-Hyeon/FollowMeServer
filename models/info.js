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

        introduce: {
            type: DataTypes.STRING(2000),
            allowNULL: true
        },
    
        grade_avg: {
            type: DataTypes.FLOAT,
            allowNULL: true,
            defaultValue: 0
        },

        letitude: {
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
