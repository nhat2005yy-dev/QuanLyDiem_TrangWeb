const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const registerRoutes = require('./routes/registerRoutes');
const classRoutes = require('./routes/classRoutes');
const classStudentRoutes = require('./routes/classStudentRoutes');
const khoaRoutes = require('./routes/khoaRoutes');
const monHocRoutes = require('./routes/monHocRoutes');
const giangVienRoutes = require('./routes/giangVienRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/test', testRoutes);
app.use('/', authRoutes);
app.use('/api', studentRoutes);
app.use('/api', gradeRoutes);
app.use('/api', registerRoutes);
app.use('/api', classRoutes);
app.use('/api', classStudentRoutes);
app.use('/api', khoaRoutes);
app.use('/api', monHocRoutes);
app.use('/api', giangVienRoutes);

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
