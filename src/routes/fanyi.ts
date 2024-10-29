import express, { Request, Response, NextFunction, } from 'express';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

const router = express.Router();

router.post('/baidu', (req, res) => {
  const { text, language, } = req?.body || {};
  if(!text) {
    return res.send("");
  }

  language = language || "en";

  // 百度翻译 API 的请求参数
  const APP_ID = '20240229001978184'; // 你的百度翻译应用ID
  const APP_SECRET = 'B16tUSS7lSTOsmwe5oWJ'; // 你的百度翻译应用密钥

  getFyContent(text);

  function getFyContent(str) {
      const salt = Date.now();
      const apiUrl = `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(str)}&from=zh&to=${ language }&appid=${APP_ID}&salt=${ salt }&sign=${generateSign(str, salt)}`;
      
      // 调用百度翻译 API
      axios.get(apiUrl)
          .then(response => {
              const { error_code, error_msg, trans_result, } = response?.data || {};
              const translatedText = trans_result?.[0]?.dst || "";
              const send_params = {}
              
              if(!error_code) {
                Object.assign(send_params, {
                  content: translatedText,
                })
              }else {
                Object.assign(send_params, {
                  error_code, error_msg,
                })
              }
              res.send(send_params);
          })
          .catch(error => {
              console.error('翻译失败：', error);
          })
      

  }
  // 生成签名
  function generateSign(text, salt) {
      const sign = `${APP_ID}${text}${salt}${APP_SECRET}`;
      return md5(sign);
  }

  function md5(str) {
      return require('crypto').createHash('md5').update(str).digest('hex');
  }


});

export default router;
