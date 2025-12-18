const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化数据库
const db = new Database(path.join(__dirname, 'comments.db'));

// 创建评论表
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    avatar TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  )
`);

// 中间件
app.use(cors({
    origin: '*', // 允许所有来源，生产环境可限制
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// 获取评论列表（最新100条）
app.get('/api/comments', (req, res) => {
    try {
        const comments = db.prepare(`
      SELECT * FROM comments 
      ORDER BY createdAt DESC 
      LIMIT 100
    `).all();
        res.json(comments);
    } catch (error) {
        console.error('获取评论失败:', error);
        res.status(500).json({ error: '获取评论失败' });
    }
});

// 发布新评论
app.post('/api/comments', (req, res) => {
    try {
        const { nickname, avatar, content } = req.body;

        // 验证输入
        if (!nickname || !avatar || !content) {
            return res.status(400).json({ error: '缺少必要字段' });
        }

        if (content.length > 500) {
            return res.status(400).json({ error: '评论内容过长（最多500字）' });
        }

        const comment = {
            id: uuidv4(),
            nickname: nickname.slice(0, 20), // 限制昵称长度
            avatar: avatar.slice(0, 10), // 限制 avatar 长度
            content: content.slice(0, 500),
            createdAt: Date.now()
        };

        const stmt = db.prepare(`
      INSERT INTO comments (id, nickname, avatar, content, createdAt)
      VALUES (@id, @nickname, @avatar, @content, @createdAt)
    `);
        stmt.run(comment);

        res.status(201).json(comment);
    } catch (error) {
        console.error('发布评论失败:', error);
        res.status(500).json({ error: '发布评论失败' });
    }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Word Game API 服务已启动`);
    console.log(`📡 监听端口: ${PORT}`);
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
});
