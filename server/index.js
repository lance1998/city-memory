const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const Jimp = require('jimp');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// In-memory data storage
const posts = [];
const messages = [];
const capsules = [];

// 1. AI 修复照片
app.post('/api/ai/fix', upload.single('image'), async (req, res) => {
    try {
        let imageBuffer = null;
        if (req.file) {
            imageBuffer = req.file.buffer;
        } else if (req.body.image) {
            const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
            imageBuffer = Buffer.from(base64Data, 'base64');
        }

        if (!imageBuffer) {
             return res.status(400).json({ success: false, message: 'No image provided' });
        }

        const image = await Jimp.read(imageBuffer);
        image.contrast(0.1);
        image.color([{ apply: 'saturate', params: [10] }]);

        const resultBase64 = await image.getBase64Async(Jimp.MIME_JPEG);
        res.json({ success: true, message: 'AI修复完成', data: { fixedImage: resultBase64 } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'AI修复失败' });
    }
});

// 2. 社交功能 - 发帖 (接力/评论/动态)
app.post('/api/posts', upload.single('file'), (req, res) => {
  const { userId, content, type } = req.body;
  let fileData = null;

  if (req.file) {
      const base64Data = req.file.buffer.toString('base64');
      fileData = `data:${req.file.mimetype};base64,${base64Data}`;
  }

  const post = {
      id: Date.now().toString(),
      userId: userId || 'anonymous',
      content: content || '',
      type: type || 'post',
      file: fileData,
      createdAt: new Date().toISOString()
  };

  posts.push(post);
  console.log(`Stored post from ${post.userId}, type: ${post.type}`);
  res.json({ success: true, message: '发布成功', data: post });
});

app.get('/api/posts', (req, res) => {
    res.json({ success: true, data: posts });
});

app.post('/api/messages', upload.none(), (req, res) => {
    const { from, to, message } = req.body;

    const msg = {
        id: Date.now().toString(),
        from: from || 'anonymous',
        to: to || 'system',
        message: message || '',
        createdAt: new Date().toISOString()
    };

    messages.push(msg);
    console.log(`Stored message from ${msg.from} to ${msg.to}`);
    res.json({ success: true, message: '消息已发送', data: msg });
});

app.get('/api/messages', (req, res) => {
    res.json({ success: true, data: messages });
});

// 3. 其他模块 - 时光胶囊等
app.post('/api/capsules', upload.none(), (req, res) => {
    const { content } = req.body;
    const capsule = {
        id: Date.now().toString(),
        content: content,
        createdAt: new Date().toISOString()
    };
    capsules.push(capsule);
    res.json({ success: true, message: '时光胶囊保存成功', data: capsule });
});

app.get('/api/capsules', (req, res) => {
    res.json({ success: true, data: capsules });
});

app.post('/api/action', upload.none(), (req, res) => {
    const { action } = req.body;
    console.log(`Action requested: ${action}`);
    res.json({ success: true, message: action + ' 请求已接收' });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
