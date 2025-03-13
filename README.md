# Reel Maker

A web application for creating synced music videos from multiple clips. This application allows users to search for YouTube videos, download them, and combine them with music to create custom reels.

## Features

- Search and download YouTube videos
- Upload local video files
- Add music from YouTube or local files
- Customize video timestamps
- Adjust playback speed
- Create synced music videos
- Save and download the final reel

## Technologies Used

- **Frontend**: React.js
- **Backend**: Express.js, Node.js
- **Video Processing**: FFmpeg
- **YouTube Integration**: YouTube API, yt-dlp

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/reel-maker.git
   cd reel-maker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5001
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. Install yt-dlp globally:
   ```
   brew install yt-dlp  # macOS
   # or
   sudo apt install yt-dlp  # Ubuntu/Debian
   # or
   sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
   sudo chmod a+rx /usr/local/bin/yt-dlp
   ```

## Usage

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. To run the backend server only:
   ```
   npm run server
   ```

4. To run the frontend only:
   ```
   npm run client
   ```

## Project Structure

- `/src/frontend` - React frontend code
- `/src/backend` - Express server code
- `/uploads` - Temporary storage for uploaded videos
- `/output` - Storage for generated reels
- `/temp` - Temporary files used during processing

## License

MIT

## Acknowledgements

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for YouTube video downloading
- [FFmpeg](https://ffmpeg.org/) for video processing
- [YouTube API](https://developers.google.com/youtube/v3) for video search 