var express = require('express');
var router = express.Router();
const axios = require('axios');
const path = require('path');
const fs = require('fs');

router.post('/fanyi', function(req, res, next) {
  let { text, language, } = req.body;
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
router.post('/download', function(req, res, next) {
  const { data, } = req.body;
  if(!Array.isArray(data) || !data.length) {
    return res.send(null);
  }

  const filePath = path.join(__dirname, 'language.json'); // 设置文件路径

  const result = data.reduce((res, item) => {
    res[item?.key] = item?.value;
    return res;
  }, {});

  // 写入文件
  fs.writeFile(filePath, JSON.stringify(result, null, 2), (err) => {
    if (err) {
      return res.status(500).send("Failed to create file");
    }
    // 文件创建成功后，提供下载
    res.download(filePath, 'en.json', (err) => {
      if (err) {
        return res.status(500).send("Failed to download file");
      }
      // 可选：下载完成后删除文件
      fs.unlink(filePath, err => {
        if (err) {
          return console.log("Error deleting the file");
        }
      });
    });
  })
});

module.exports = router;
