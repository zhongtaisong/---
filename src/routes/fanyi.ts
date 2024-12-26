import express from 'express';
import { baiduTranslateFn, createSendContentFn } from '@common/kit';
import { SUCCESS_CODE } from '@common/const';
const router = express.Router();

router.post('/baidu', async (req, res) => {
  const { text, language, } = req?.body || {};
  const send = createSendContentFn(res);
  if(!text || !language) {
    return send({
      code: "fanyi-000001",
      message: "参数不正确"
    });
  }

  try {
    const result = await baiduTranslateFn({
      q: text,
      to: language,
    });
    
    send({
      code: SUCCESS_CODE,
      context: result || "",
      message: "操作成功"
    });
  } catch (error) {
    return send({
      code: "fanyi-000002",
      message: String(error).includes("Access Limit") ? "访问频率过高" : error,
    });
  }
});

export default router;
