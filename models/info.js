module.exports = (sequelize, DataTypes) => {
    // info table
    // - ID (PK) - INT
    // - shopname (FK,NN) - VARCHAR
    // - address (NN) - VARCHAR
    // - menu (NN) - VARCHAR
    // - link (NN) - VARCHAR - 아직 안넣음
    // - 카테고리(음식점, 카페, 명소) -INT
    // - 태그(맛잇는 녀석들, 실내데이트 , 이색데이트) - Json
    // - 운영시간(요일별) (NN) - CHAR
    // - likenum (NN) -INT
    // - reviewnum (NN)- INT
    // - 소개 (NN) - VARCHAR
    // - 위도 (NN) - 아직 안넣음
    // - 경도 (NN) - 아직 안넣음
    return sequelize.define('info', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNULL: false
        },
        shopname: {
            type: DataTypes.STRING(30),
            allowNULL: false
        },
        address: {
            type: DataTypes.STRING(50),
            allowNULL: false
        },
        menu: {
            type : DataTypes.STRING(200),
            allowNULL: false
        },
        category: {
            type: DataTypes.INTEGER, // 0 : 음식점 , 1 : 카페, 2 : 명소
            allowNULL: false
        },
        tag: {
            type: DataTypes.STRING(20), //json
            allowNULL: false
        },
        operatingTime: {
            type: DataTypes.STRING(30),
            allowNULL: false
        },
        likenum: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNULL: false
        },
        reviewnum: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNULL: false
        },
        introduce: {
            type: DataTypes.STRING(200),
            allowNULL: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNULL: true,
            defaultValue: sequelize.literal('now()')
        }
    }, {
        timestamp: false,
        paranoid: true,
        underscored: true,
    });
};
