require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const chatRoutes = require('./routes/chat');
const gradeRoutes = require('./routes/grade');
const planRoutes = require('./routes/plan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for PDF text content

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

// Global Rate Limiter (Basic protection)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Routes
const authMiddleware = require('./middleware/authMiddleware');
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/grade', authMiddleware, gradeRoutes);
app.use('/api/plan', authMiddleware, planRoutes);
app.use('/api/vector', authMiddleware, require('./routes/vector'));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
