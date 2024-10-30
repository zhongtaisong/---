import createError from 'http-errors';
import express, { Request, Response, NextFunction, } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';
import fanyiRouter from './routes/fanyi';
// import languageRouter from './routes/language';

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/fanyi', fanyiRouter);
// app.use('/language', languageRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
});

export default app;
