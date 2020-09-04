module.exports = (sequelize, DataTypes) => {
    return sequelize.define('course_like', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNULL: false
        },
        
        course_id: {
            type: DataTypes.INTEGER,
            allowNULL: false,
            unique: false
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNULL: false,
            unique: false
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
