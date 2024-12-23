import mongodb from '@mongodb/index';

const i18n_schema = new mongodb.Schema({
    zh: { type: String, required: false, },
    en: { type: String, required: false, },
    ru: { type: String, required: false, },
}, { _id: false, });

const language_schema = new mongodb.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    info: {
        type: i18n_schema,
        required: true,
    },
    createTime: {
        type: Date,
        default: Date.now,
    },
    updateTime: {
        type: Date,
        default: Date.now,
    }
})

function getModelByName(modelName) {
    if (mongodb.models[modelName]) {
     return mongodb.model(modelName);
    }

    return mongodb.model(modelName, language_schema);   
 }

export default getModelByName;
