import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/api/auth.js';
//Load .env
dotenv.config();
//Create app server
const app = express();
const PORT = process.env.PORT || 3000;
//Connect to DB
mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ewvie.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true}, 
    () => console.log('Connected to DB')
);
//App middleware
app.use(express.json());
app.use(cors());
//Route middleware
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send("Live."));

//Start server
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));