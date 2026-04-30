const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'https://spotifyclonemern.onrender.com', 'https://spotifyclonemern.netlify.app'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


app.use('/api/auth',authRoutes);
app.use('/api/music',musicRoutes);

module.exports = app;