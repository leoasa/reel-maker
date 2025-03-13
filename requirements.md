Software Requirements Document: 
Reel Maker

Project Overview
Project Name: Reel Maker
Objective: To develop a software tool that creates engaging video reels by synchronizing video clips to music, with user-defined inputs and customizable configurations. The tool should prioritize saving reels to files, with optional functionality for direct uploads to TikTok and Instagram.

Functional Requirements
Video and Music Synchronization
The Reel Maker should automatically sync multiple video clips to a music track.
Input videos and music should align according to user-specified timestamps or rhythm patterns.
Video Splitting
The Reel Maker must support splitting multiple clips within a video file.
The splitting functionality can leverage the existing Mugen package (if applicable).
Input Formats
The tool must accept a JSON file as the primary input, specifying:
Video inputs (links, file paths, or raw video data)
Music file path (from YouTube links only)
Timestamp and playback speed for syncing.
User Choice:
Users can choose between providing a textual prompt or directly specifying inputs (video links, uploaded files, or a combination of both).
Inputs can include:
Prompt-based inputs for generating reels
Direct links to videos
Uploaded video files
A combination of video links and uploaded files.
User-Defined Timestamps
The user must be able to specify timestamps for syncing video clips with musical beats.
The tool should allow for custom note speed adjustments.
Aspect Ratio
The Reel Maker must enforce a single aspect ratio optimized for social media reels (e.g., 9:16 vertical format).
Output Options
Priority: Save the final reel as a video file in a user-specified directory.
Optional: Direct upload functionality for TikTok and Instagram.

Non-Functional Requirements
Performance
The Reel Maker should process video and audio inputs efficiently to deliver outputs promptly.
Compatibility
Supported platforms: Windows, macOS 
Supported video formats: MP4, MOV
Supported audio formats: MP3, WAV
Usability
The tool should provide clear error messages if inputs are invalid or processes fail.
A simple, command-line or GUI-based interface is acceptable, with clear instructions for input and output.
Scalability
The Reel Maker should handle up to 20 video clips and music tracks of up to 10 minutes in length without performance degradation.

Input JSON Structure
{
  "videos": [
    "video1.mp4",
    "https://example.com/video2",
    "video3.mp4"
  ],
  "music": "https://www.youtube.com/watch?v=example",
  "timestamps": {
    "video1.mp4": [0, 5],
    "https://example.com/video2": [2, 6],
    "video3.mp4": [1, 4]
  },
  "playbackSpeed": 1.5,
  "outputDirectory": "./reels/",
  "uploadTo": ["tiktok", "instagram"]
}

Examples of Input Types
Example 1: Prompt-Based Input
{
  "prompt": "Create a reel showing the top 10 trending dance moves of 2024 synced to an energetic beat from YouTube.",
  "music": "https://www.youtube.com/watch?v=exampleBeat",
  "playbackSpeed": 1.2,
  "outputDirectory": "./reels/",
  "uploadTo": ["tiktok"]
}
Example 2: Input with Links
{
  "videos": [
    "https://example.com/video1",
    "https://example.com/video2"
  ],
  "music": "https://www.youtube.com/watch?v=exampleMusic",
  "timestamps": {
    "https://example.com/video1": [0, 8],
    "https://example.com/video2": [3, 9]
  },
  "playbackSpeed": 1.0,
  "outputDirectory": "./reels/",
  "uploadTo": ["instagram"]
}
Example 3: Uploaded Video Files
{
  "videos": [
    "local_video1.mp4",
    "local_video2.mov"
  ],
  "music": "https://www.youtube.com/watch?v=exampleTrack",
  "timestamps": {
    "local_video1.mp4": [0, 10],
    "local_video2.mov": [5, 15]
  },
  "playbackSpeed": 1.5,
  "outputDirectory": "./reels/",
  "uploadTo": []
}
Example 4: Mixed Input (Links + Uploaded Videos)
{
  "videos": [
    "local_video1.mp4",
    "https://example.com/video2"
  ],
  "music": "https://www.youtube.com/watch?v=exampleSong",
  "timestamps": {
    "local_video1.mp4": [0, 6],
    "https://example.com/video2": [2, 8]
  },
  "playbackSpeed": 1.3,
  "outputDirectory": "./reels/",
  "uploadTo": ["tiktok", "instagram"]
}

Optional Features
Direct Upload
If implemented, integrate APIs for TikTok and Instagram to facilitate seamless uploads.
Include user authentication and session management.
GUI Option
Provide a graphical interface for users who prefer not to interact with JSON or command-line inputs.
