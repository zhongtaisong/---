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

  const result = await baiduTranslateFn({
    q: text,
    to: language,
  });

  send({
    code: SUCCESS_CODE,
    context: result || "",
    message: "操作成功"
  });
});

export default router;
