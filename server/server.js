// server/server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const nudgeRoutes = require('./routes/nudgeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Atlas connected successfully!'))
    .catch(err => {
        console.error('MongoDB Atlas connection error:', err);
        process.exit(1);
    });

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/nudges', nudgeRoutes);

app.get('/', (req, res) => {
    res.send('Fin-Nudge Backend API is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access backend at: http://localhost:${PORT}`);
});