const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { google } = require('googleapis');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const dotenv = require('dotenv');
const { exec } = require('child_process');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const outputDir = path.join(__dirname, '../../output');
const tempDir = path.join(__dirname, '../../temp');

[uploadsDir, outputDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Accept only video and audio files
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and audio files are allowed'));
    }
  }
});

// YouTube API setup
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// API Routes
// Upload video files
app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    res.status(200).json({ success: true, files });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search YouTube for videos
app.get('/api/search/youtube', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query parameter is required' });
    }
    
    // Search for vertical videos (9:16 aspect ratio)
    const response = await youtube.search.list({
      part: 'snippet',
      q: query + ' vertical video',
      maxResults: 10,
      type: 'video',
      videoDefinition: 'high',
      videoDuration: 'short'
    });
    
    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
    
    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download YouTube video
app.post('/api/download', async (req, res) => {
  const { url } = req.body;
  console.log('Downloading video from URL:', url);

  try {
    // Extract video ID from URL
    let videoId;
    try {
      videoId = ytdl.getVideoID(url);
    } catch (error) {
      console.error('Error extracting video ID:', error.message);
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const filename = `${uuidv4()}.mp4`;
    const outputPath = path.join(uploadsDir, filename);
    
    console.log('Downloading video with ID:', videoId);
    console.log('Output path:', outputPath);

    // Use yt-dlp directly via child_process.exec
    const ytDlpCommand = `yt-dlp "${url}" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${outputPath}" --no-check-certificate --no-warnings`;
    
    console.log('Executing command:', ytDlpCommand);
    
    exec(ytDlpCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error downloading video with yt-dlp:', error);
        console.error('stderr:', stderr);
        return res.status(500).json({ error: 'Error downloading video: ' + error.message });
      }
      
      console.log('yt-dlp stdout:', stdout);
      
      // Get the video title for a better filename
      try {
        const stats = fs.statSync(outputPath);
        if (stats.size > 0) {
          console.log('Video downloaded successfully. File size:', stats.size);
          return res.json({
            filename,
            originalname: `youtube_${videoId}.mp4`,
            path: outputPath,
            url: `/uploads/${filename}`
          });
        } else {
          console.error('Downloaded file has zero size');
          return res.status(500).json({ error: 'Downloaded file has zero size' });
        }
      } catch (statError) {
        console.error('Error checking file:', statError);
        return res.status(500).json({ error: 'Error verifying downloaded file: ' + statError.message });
      }
    });
  } catch (error) {
    console.error('Error in download process:', error);
    return res.status(500).json({ error: 'Error downloading video: ' + error.message });
  }
});

// Create reel from videos and music
app.post('/api/create-reel', async (req, res) => {
  try {
    const { videos, music, timestamps, playbackSpeed, outputFilename } = req.body;
    
    if (!videos || !videos.length || !music) {
      return res.status(400).json({ success: false, message: 'Videos and music are required' });
    }
    
    // Generate a unique output filename if not provided
    const outputName = outputFilename || `reel-${uuidv4()}.mp4`;
    const outputPath = path.join(outputDir, outputName);
    
    // Process each video (crop to 9:16, apply timestamps, etc.)
    const processedVideos = await Promise.all(videos.map(async (video, index) => {
      const videoPath = video.path;
      const timestamp = timestamps[video.filename] || [0, 5]; // Default 5 seconds if not specified
      const tempOutputPath = path.join(tempDir, `processed-${index}-${path.basename(videoPath)}`);
      
      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .setStartTime(timestamp[0])
          .setDuration(timestamp[1] - timestamp[0])
          .videoFilters([
            // Crop to 9:16 aspect ratio
            {
              filter: 'crop',
              options: {
                w: 'ih*9/16',
                h: 'ih',
                x: '(iw-ih*9/16)/2',
                y: 0
              }
            }
          ])
          .output(tempOutputPath)
          .on('end', () => resolve({ path: tempOutputPath, duration: timestamp[1] - timestamp[0] }))
          .on('error', (err) => reject(err))
          .run();
      });
    }));
    
    // Download music if it's a YouTube URL
    let musicPath = music;
    if (music.includes('youtube.com') || music.includes('youtu.be')) {
      try {
        console.log('Downloading music from YouTube URL:', music);
        
        // Extract video ID for filename
        const videoId = music.includes('youtube.com') || music.includes('youtu.be') 
          ? music.split('v=')[1]?.split('&')[0] || music.split('/').pop() 
          : uuidv4();
        
        const tempMusicPath = path.join(tempDir, `music-${videoId}.mp3`);
        
        console.log('Starting music download with yt-dlp...');
        
        // Use yt-dlp directly via child_process.exec for music download
        const ytDlpMusicCommand = `yt-dlp "${music}" -x --audio-format mp3 --audio-quality 0 -o "${tempMusicPath}" --no-check-certificate --no-warnings`;
        
        console.log('Executing music download command:', ytDlpMusicCommand);
        
        // Use Promise to handle the async exec call
        await new Promise((resolve, reject) => {
          exec(ytDlpMusicCommand, (error, stdout, stderr) => {
            if (error) {
              console.error('Error downloading music with yt-dlp:', error);
              console.error('stderr:', stderr);
              reject(error);
              return;
            }
            
            console.log('Music downloaded successfully');
            console.log('yt-dlp stdout:', stdout);
            
            // Update the music URL to point to the local file
            musicPath = tempMusicPath;
            resolve();
          });
        });
      } catch (error) {
        console.error('Music download error:', error);
        console.log('Continuing with original music URL, which may not work');
        // Continue with the original music URL
      }
    }
    
    // Concatenate processed videos
    const concatListPath = path.join(tempDir, 'concat-list.txt');
    fs.writeFileSync(
      concatListPath,
      processedVideos.map(video => `file '${video.path.replace(/'/g, "'\\''")}'`).join('\\n')
    );
    
    const tempConcatPath = path.join(tempDir, `concat-${uuidv4()}.mp4`);
    
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatListPath)
        .inputOptions(['-f concat', '-safe 0'])
        .output(tempConcatPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
    
    // Add music to the concatenated video
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(tempConcatPath)
        .input(musicPath)
        .outputOptions([
          '-c:v copy',
          '-c:a aac',
          '-map 0:v:0',
          '-map 1:a:0',
          '-shortest'
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
    
    // Clean up temporary files
    [concatListPath, tempConcatPath, ...processedVideos.map(v => v.path)].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    
    if (musicPath.startsWith(tempDir) && fs.existsSync(musicPath)) {
      fs.unlinkSync(musicPath);
    }
    
    res.status(200).json({ 
      success: true, 
      output: {
        filename: outputName,
        path: outputPath,
        url: `/output/${outputName}`
      }
    });
  } catch (error) {
    console.error('Reel creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve static files
app.use('/uploads', express.static(uploadsDir));
app.use('/output', express.static(outputDir));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 