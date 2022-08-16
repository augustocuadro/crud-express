import express from 'express';
import Routes from './routes';
import mongoose from 'mongoose';
import logger from 'morgan';
import bodyParser from 'body-parser';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());

Routes.configure(app);

const start = async () => {
    await mongoose.connect('mongodb://localhost', {
        socketTimeoutMS: 5000
    });
    app.listen(PORT, () => {
        console.log(`Express server listening on port ${PORT}`);
    });
};

start().then(() => `Server started...`);
