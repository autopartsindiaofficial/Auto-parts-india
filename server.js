import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Serve static assets and files from the root directory
app.use(express.static(__dirname));

// Direct instant APK download endpoint
app.get(['/download', '/download-apk', '/Auto_Parts_India.apk'], (req, res) => {
  const apkPath = path.join(__dirname, 'Auto_Parts_India.apk');
  res.download(apkPath, 'Auto_Parts_India.apk', (err) => {
    if (err && !res.headersSent) {
      res.redirect('https://huggingface.co/autoparts/autoparts-india-apk/resolve/main/Auto_Parts_India.apk?download=true');
    }
  });
});

// Serve index.html for root or any SPA/fallback request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`AutoParts India server running on http://${HOST}:${PORT}`);
});
