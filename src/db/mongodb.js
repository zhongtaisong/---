// 引入 mongoose 
const mongoose = require('mongoose')

// 连接数据库，自动新建 ExpressApi 库
mongoose.connect('mongodb://localhost:27017/i18n', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB!');
}).catch(err => {
    console.error('Connection error:', err);
});

module.exports = mongoose
