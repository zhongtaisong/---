
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createLogContentFn, createModalFn, createSendContentFn, getTerminalFn } from '@common/kit';
import { PAGE_NUM, PAGE_SIZE, SUCCESS_CODE } from '@common/const';
const router = express.Router();

/**
 * 批量更新
 */
router.post('/bulkWrite/:action', async (req, res) => {
  const { list, } = req.body;
  const { action, } = req.params;
  const send = createSendContentFn(res);
  const languageModel = createModalFn(req);
  if(!Array.isArray(list) || !list.length) {
    return send({
      code: "language-000001",
      message: "参数不正确"
    });
  }

  const list_new = list.filter(item => item && Object.keys(list).length);
  if(!list_new.length) {
    return send({
      code: "language-000002",
      message: "参数不正确"
    });
  }

  if(["add"].includes(action)) {
    const zh_list = list_new.map(item => item?.info?.zh).filter(Boolean);
    const zh_result = await languageModel.find({ 'info.zh': { $in: zh_list, } });
    if(Array.isArray(zh_result) && zh_result.length) {
      return send({
        code: "language-000016",
        message: `"${ zh_result?.[0]?.info?.zh }"已存在`,
      });
    }
  }

  const data = list_new.map((item, index) => {
    if(!item || !Object.keys(item).length) return;

    const { info, } = item;
    if(!info || !Object.keys(info).length) return;

    const id = item?.id || `${ Date.now() + index }`;
    Object.assign(item, {
      id,
    })
    return {
      updateOne: {
        filter: { id, },
        update: item,
        upsert: true,
        new: true,
      }
    };
  }).filter(Boolean);

  if(!Array.isArray(data) || !data.length) {
    return send({
      code: "language-000015",
      message: "参数不正确"
    });
  }
  
  languageModel.bulkWrite(data).then(() => {
    send({
      code: SUCCESS_CODE,
      context: null,
      message: "操作成功"
    });
  }).catch(err => {
    send({
      code: "language-000003",
      context: JSON.stringify(err ?? ""),
      message: "操作失败"
    });
  });
});

/**
 * 批量删除
 */
router.post('/deleteMany', async (req, res) => {
  const { ids, } = req.body;
  const send = createSendContentFn(res);
  const languageModel = createModalFn(req);
  if(!Array.isArray(ids) || !ids.length) {
    return send({
      code: "language-000004",
      message: "参数不正确"
    });
  }

  const ids_new = ids.filter(Boolean);
  if(!ids_new.length) {
    return send({
      code: "language-000005",
      message: "参数不正确"
    });
  }
  
  languageModel.deleteMany({ 
    id: { $in: ids_new, },
  }).then(() => {
    send({
      code: SUCCESS_CODE,
      context: null,
      message: "操作成功"
    });
  }).catch(err => {
    send({
      code: "language-000006",
      context: JSON.stringify(err ?? ""),
      message: "操作失败"
    });
  });
});

/**
 * 分页查询
 */
router.post('/list', async (req, res)=>{
  const { pageNum, pageSize, zh, } = req.body;
  const page_num = pageNum ?? PAGE_NUM;
  const page_size = pageSize ?? PAGE_SIZE;
  const send = createSendContentFn(res);
  const languageModel = createModalFn(req);
  if(typeof page_num !== 'number' || typeof page_size !== 'number') {
    return send({
      code: "language-000007",
      message: "参数不正确"
    });
  }
  if(page_num < 0 || page_size < 0) {
    return send({
      code: "language-000008",
      message: "参数不正确"
    });
  }

  try {
    const filter_params = {};
    if(zh) {
      Object.assign(filter_params, {
        'info.zh': new RegExp(zh, 'i'),
      });
    }
    const result = await languageModel.find(filter_params, {
      _id: 0,
      __v: 0,
    }).skip(page_num * page_size).limit(page_size).sort({ createTime: -1 }).exec();
    const total = await languageModel.countDocuments();
    send({
      code: SUCCESS_CODE,
      context: {
        pageNum: page_num,
        totalPages: Math.ceil(total / page_size),
        pageSize: page_size,
        total,
        content: result || [],
      },
      message: "操作成功"
    });
  } catch (error) {
    send({
      code: "language-000009",
      context: JSON.stringify(error ?? ""),
      message: "操作失败"
    });
  }
})

/**
 * 导出json
 */
router.post('/export', async (req, res) => {
  const { language, ids, } = req.body;
  const send = createSendContentFn(res);
  const languageModel = createModalFn(req);
  const language_key = language || "zh";

  const params = {};
  if(Array.isArray(ids) && ids.length) {
    Object.assign(params, {
      id: { $in: ids, },
    })
  }

  try {
    const list = await languageModel.find(params).sort({ createTime: -1 }).exec();
    const result = list.reduce((prev, item) => {
      const info = item?.info || {};
      if(info && Object.keys(info).length) {
        const key = info["zh"];
        const value = info[language_key];
        if(key) {
          prev[key] = value || "";
        }
      }
      return prev;
    }, {});

    const file_path = path.join(__dirname, `../temp/${ language_key }.json`);
    fs.mkdirSync(path.dirname(file_path), { recursive: true });
    fs.writeFile(
      file_path, 
      JSON.stringify(result, null, 2), 
      (err) => {
        if(err) {
          return send({
            code: "language-000011",
            message: "操作失败"
          });
        }
        
        res.download(file_path, `${ language_key }.json`, (err) => {
          if (err) {
            return send({
              code: "language-000012",
              message: "操作失败"
            });
          }

          fs.unlink(file_path, err => {
            if(err) {
              return send({
                code: "language-000013",
                message: "操作失败"
              });
            }

            return createLogContentFn({
              path: "/export",
              log: "导出json成功",
            });
          });
        });
      }
    )
  } catch (error) {
    send({
      code: "language-000010",
      context: JSON.stringify(error ?? ""),
      message: "操作失败"
    });
  }
});

export default router;
