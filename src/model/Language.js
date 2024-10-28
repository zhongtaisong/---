// 引入mongodb
const mongoose = require('../db/mongodb')
// 建立用户表
const UserSchema = new mongoose.Schema({
    languageId: {
        type: String,
        required: true,
        unique: true,
    },
    zh: {
        type: String,
        required: true,
        unique: true,
    },
    en: {
        type: String,
    },
    ru: {
        type: String,
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    updateTime: {
        type: Date,
        default: Date.now
    }
})

// 建立用户数据库模型
const Model = mongoose.model('Language', UserSchema)
module.exports = { Model, }
