import express, { Request, Response, } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import axios from 'axios';
import { baiduTranslateFn, createLogContentFn, createSendContentFn } from '@common/kit';

const router = express.Router();

router.post('/baidu', async (req: Request, res: Response) => {
  const { text, language, } = req?.body || {};
  const send = createSendContentFn(res);
  if(!text || !language) {
    createLogContentFn({
      path: "/baidu",
      log: "参数不正确",
    });
    send({
      code: "fanyi000000",
      message: "参数不正确"
    });
    return;
  }

  const result = await baiduTranslateFn({
    q: text,
    to: language,
  });

});

export default router;
