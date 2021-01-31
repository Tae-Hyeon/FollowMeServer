module.exports = (sequelize, DataTypes) => {
    return sequelize.define('info_review', {

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

        user_id: {
            type: DataTypes.INTEGER,
            allowNULL: false
        },

        grade: {
            type: DataTypes.INTEGER,
            allowNULL: false,
            defaultValue: 0
        },

        contents: {
            type: DataTypes.STRING(500),
            allowNULL: false
        },

        // photo: {
        //     type: DataTypes.JSONB()
        // },

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
