import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
    credentials: true
}));

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(cookieParser());


// Import routes
import userRoutes from './routes/user.routes.js';

// Use routes
app.use('/api/v1/users', userRoutes);


export {app};