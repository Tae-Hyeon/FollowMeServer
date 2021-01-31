module.exports = (sequelize, DataTypes) => {
    return sequelize.define('info_thema', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNULL: false
        },
        
        info_id: {
            type: DataTypes.INTEGER,
            allowNULL: false
        },

        thema_id: {
            type: DataTypes.INTEGER,
            allowNULL: false
        },

        created_at: {
            type: DataTypes.DATE,
            allowNULL: true,
            defaultValue: sequelize.literal('now()')
        }

    },

        {
            timestamp: false,
            //paranoid: true,
            underscored: true,
        }

    );

};
