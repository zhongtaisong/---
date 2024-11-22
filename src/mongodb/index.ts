import { createLogContentFn } from '@common/kit';
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/i18n', {
    // @ts-ignore
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    createLogContentFn({
        path: "mongodb",
        log: "连接成功",
    });
}).catch(err => {
    createLogContentFn({
        path: "mongodb",
        log: `连接失败，${ err }`,
    });
});

export default mongoose;
