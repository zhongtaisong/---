var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs');
const { Model, } = require('../model/Language')

// 批量 - 新增更新
router.post('/add', async (req, res, next) => {
  const { list, } = req.body;
  const operations = list.map((item, index) => {
    const languageId_new = item?.languageId || `${ Date.now() + index }`;
    Object.assign(item, {
      lalanguageId: languageId_new,
    })
    return {
      updateOne: {
        filter: { languageId: languageId_new },
        update: item,
        upsert: true,
        new: true,
      }
    };
  });

  Model.bulkWrite(operations)
    .then(result => {
          console.log(result);
          res.send(result);
      })
    .catch(err => {
          console.log(err);
          res.send(err);
      });
});

// 单条 - 新增、更新
router.post('/update', async (req, res, next) => {
  const { languageId, ...params } = req.body;
  const languageId_new = languageId || `${ Date.now() }`;
  
  Model.findOneAndUpdate({ languageId: languageId_new, }, params, {
    upsert: true,
    new: true,
  })
    .then(result => {
          res.send(result);
      })
    .catch(err => {
          res.send(err);
      });
});

// 单条 - 删除
router.post('/delete', async (req, res, next) => {
  const { languageId, } = req.body;
  const languageId_new = languageId || `${ Date.now() }`;
  
  Model.deleteOne({ languageId: languageId_new, })
    .then(result => {
          console.log(result);
          res.send(result);
      })
    .catch(err => {
          console.log(err);
          res.send(err);
      });
});

router.get('/list', async(req, res, next)=>{
  const user = await Model.find()
  res.send({ 
   code: 200,
    msg: '获取成功',
    data: user
  })
})

router.get('/export/:language', async (req, res, next) => {
  const { language, } = req.params;
  const key = language || "zh";
  const list = await Model.find();
  const filePath = path.join(__dirname, `${ key }.json`); // 设置文件路径

  const result = list.reduce((res, item) => {
    if(item?.zh) {
      res[item?.zh] = item?.[key] || "";
    }
    return res;
  }, {});

  // 写入文件
  fs.writeFile(filePath, JSON.stringify(result, null, 2), (err) => {
    if (err) {
      return res.status(500).send("Failed to create file");
    }
    // 文件创建成功后，提供下载
    res.download(filePath, `${ key }.json`, (err) => {
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
