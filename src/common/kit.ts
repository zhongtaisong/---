import { Response, } from 'express';
import crypto from 'crypto';
import { BAIDU_APP_ID, BAIDU_APP_SECRET, BAIDU_TRANSLATE_URL } from './config';
import axios from 'axios';
import { SUCCESS_CODE } from './const';

/**
 * 创建响应体 - 操作
 * @param res 
 * @param params 
 * @returns 
 */
export const createSendContentFn = (res: Response) => (params: {
    code: string;
    context?: any;
    message?: string;
}) => {
    if(!res || !Object.keys(res).length) return;

    const code = params?.code ?? null;
    const message = params?.message ?? null;
    if(code !== SUCCESS_CODE) {
        createLogContentFn({
            path: code,
            log: message,
        });
    }

    res?.status?.(200)?.send({
        code,
        context: params?.context ?? null,
        message,
    });
}

/**
 * 创建日志信息 - 操作
 * @param params 
 * @returns 
 */
export const createLogContentFn = (params: {
    path: string;
    log?: string;
}) => {
    if(!params || !Object.keys(params).length) return;

    const date = new Date();
    const time = date.toLocaleString();
    const { path, log, } = params;
    if(!path) return;

    console.log(`${ time } --- ${ path } --- ${ log || "" }`);
}

/**
 * 百度翻译md5 - 生成操作
 * @param data 
 * @returns 
 */
export const getBaiduMd5Fn = (data: string) => crypto.createHash('md5').update(data || "").digest('hex');

/**
 * 百度翻译签名 - 生成操作
 * @param text 
 * @param salt 
 * @returns 
 */
export const generateBaiduSignFn = (text: string, salt: string | number) => {
    const sign = `${ BAIDU_APP_ID }${ text || "" }${ salt || "" }${ BAIDU_APP_SECRET }`;
    return getBaiduMd5Fn(sign);
}

/**
 * 百度翻译 - 翻译操作
 * @param params 
 * @returns 
 */
export const baiduTranslateFn = (params: {
    q: string;
    from?: string;
    to: string;
}) => {
    return new Promise((resolve, reject) => {
        const { q, from, to, } = params;
        if(!q || !to) {
            return reject("参数不正确");
        }

        const salt = Date.now();
        const params_new = {
            q: encodeURIComponent(q || ""),
            from: from || "zh",
            to: to || "",
            appid: BAIDU_APP_ID,
            salt,
            sign: generateBaiduSignFn(q, salt),
        }

        let url = BAIDU_TRANSLATE_URL;
        const params_str = Object.entries(params_new).reduce((result, [key, value], index, arr) => {
            result += `${ key }=${ value || "" }${ index < arr.length - 1 ? "&" : "" }`;
            return result;
        }, "");
        if(params_str) {
            url += `?${ params_str }`;
        }
        
        axios.get(url).then(result => {
            const { error_code, error_msg, trans_result, } = result?.data || {};
            const text = trans_result?.[0]?.dst || "";
            if(!error_code) {
                resolve(text);
            }else {
                reject(error_msg);
            }
        }).catch(error => {
            reject(error);
        })
    }) as Promise<string>;
}
