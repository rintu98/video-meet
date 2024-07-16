import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { connectToSocket } from './controller/socketManager.js';
import authRoute from "./route/AuthRoute.js"
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);
const MONGO_URL = process.env.MONGO_URL;
const port = process.env.PORT;

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '40kb' }));
app.use(express.urlencoded({ limit: '40kb', extended: true }));

app.use('/', authRoute);

mongoose
  .connect(MONGO_URL)
  .then(() => console.log('MongoDB is connected successfully'))
  .catch((err) => console.error(err));

app.get('/', (req, res) => {
  res.send('Hello World');
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
