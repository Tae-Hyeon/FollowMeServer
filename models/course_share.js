module.exports = (sequelize, DataTypes) => {
    return sequelize.define('course_share', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNULL: false
        },
        
        course_id: {
            type: DataTypes.INTEGER,
            allowNULL: false
        },

        shared_user_id: {
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
            paranoid: true,
            underscored: true,
        }

    );

};
