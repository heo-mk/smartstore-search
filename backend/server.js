require('dotenv').config();
const express = require('express');
const cors = require('cors');
const trendRoutes = require('./routes/trends');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors({
  origin: 'http://localhost:3000', // 프론트엔드 URL
  credentials: true
}));
app.use(express.json());

// 라우트
app.use('/api/trends', trendRoutes);

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

// 에러 처리
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
