import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Register APK mime type
express.static.mime.define({ 'application/vnd.android.package-archive': ['apk'] });

// Robust chunked streaming with full HTTP 206 Range support for mobile Chrome
app.get(['/Auto_Parts_India.apk', '/download', '/download-apk'], (req, res) => {
  const apkPath = path.join(__dirname, 'Auto_Parts_India.apk');
  if (!fs.existsSync(apkPath)) {
    return res.status(404).send('APK file not found');
  }

  const stat = fs.statSync(apkPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(apkPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="Auto_Parts_India.apk"'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="Auto_Parts_India.apk"',
      'Accept-Ranges': 'bytes'
    };
    res.writeHead(200, head);
    fs.createReadStream(apkPath).pipe(res);
  }
});

// Serve static assets
app.use(express.static(__dirname));

// Fallback to index.html ONLY for HTML navigation routes, NOT for .apk or assets
app.get('*', (req, res) => {
  if (req.path.endsWith('.apk')) {
    return res.status(404).send('APK not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`AutoParts India server running on http://${HOST}:${PORT}`);
});
