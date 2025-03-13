import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateReel.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const CreateReel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [musicFile, setMusicFile] = useState(null);
  const [musicUrl, setMusicUrl] = useState('');
  const [timestamps, setTimestamps] = useState({});
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [outputReel, setOutputReel] = useState(null);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    setIsElectron(window.electron !== undefined);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/search/youtube`, {
        params: { query: searchQuery }
      });

      setSearchResults(response.data.videos || []);
    } catch (err) {
      setError('Error searching for videos: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoSelect = async (video) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/download`, {
        url: video.url
      });

      // The response structure has changed, so we need to adapt our code
      const newVideo = {
        filename: response.data.filename,
        originalName: response.data.originalname,
        path: response.data.path,
        url: response.data.url,
        title: video.title,
        thumbnail: video.thumbnail
      };

      setSelectedVideos([...selectedVideos, newVideo]);
      
      // Initialize timestamp for this video
      setTimestamps({
        ...timestamps,
        [newVideo.filename]: [0, 5] // Default 5 seconds
      });

      setSuccess(`Added "${video.title}" to your reel`);
    } catch (err) {
      setError('Error downloading video: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const newVideos = response.data.files.map(file => ({
          ...file,
          title: file.originalName
        }));

        const newSelectedVideos = [...selectedVideos, ...newVideos];
        setSelectedVideos(newSelectedVideos);

        // Initialize timestamps for new videos
        const newTimestamps = { ...timestamps };
        newVideos.forEach(video => {
          newTimestamps[video.filename] = [0, 5]; // Default 5 seconds
        });
        setTimestamps(newTimestamps);

        setSuccess(`Added ${newVideos.length} video(s) to your reel`);
      }
    } catch (err) {
      setError('Error uploading files: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMusicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMusicFile(response.data.files[0]);
        setSuccess(`Added "${file.name}" as music`);
      }
    } catch (err) {
      setError('Error uploading music: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimestampChange = (filename, index, value) => {
    const newTimestamps = { ...timestamps };
    newTimestamps[filename][index] = parseFloat(value);
    setTimestamps(newTimestamps);
  };

  const handleRemoveVideo = (index) => {
    const newVideos = [...selectedVideos];
    const removedVideo = newVideos.splice(index, 1)[0];
    setSelectedVideos(newVideos);

    // Remove timestamps for this video
    const newTimestamps = { ...timestamps };
    delete newTimestamps[removedVideo.filename];
    setTimestamps(newTimestamps);
  };

  const handleCreateReel = async () => {
    if (selectedVideos.length === 0) {
      setError('Please add at least one video');
      return;
    }

    if (!musicFile && !musicUrl) {
      setError('Please add music');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        videos: selectedVideos,
        music: musicFile ? musicFile.path : musicUrl,
        timestamps,
        playbackSpeed
      };

      const response = await axios.post(`${API_BASE_URL}/create-reel`, requestData);

      if (response.data.success) {
        setOutputReel(response.data.output);
        setSuccess('Reel created successfully!');
      }
    } catch (err) {
      setError('Error creating reel: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReel = async () => {
    if (!outputReel) return;

    if (isElectron) {
      // Use Electron's save dialog
      try {
        const filePath = await window.electron.saveFile({
          defaultPath: outputReel.filename,
          sourcePath: outputReel.path
        });

        if (filePath) {
          setSuccess(`Reel saved to ${filePath}`);
        }
      } catch (err) {
        setError('Error saving file: ' + err.message);
      }
    } else {
      // Web browser download
      window.open(`${API_BASE_URL.replace('/api', '')}/output/${outputReel.filename}`, '_blank');
    }
  };

  const handleBrowseFiles = async () => {
    if (isElectron) {
      try {
        const filePaths = await window.electron.selectFiles();
        if (filePaths && filePaths.length > 0) {
          // Upload the selected files
          const formData = new FormData();
          for (const path of filePaths) {
            // Create a File object from the path
            const filename = path.split('/').pop();
            const file = new File([await fetch(path).then(r => r.blob())], filename);
            formData.append('files', file);
          }

          // Upload the files
          const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          if (response.data.success) {
            const newVideos = response.data.files.map(file => ({
              ...file,
              title: file.originalName
            }));

            const newSelectedVideos = [...selectedVideos, ...newVideos];
            setSelectedVideos(newSelectedVideos);

            // Initialize timestamps for new videos
            const newTimestamps = { ...timestamps };
            newVideos.forEach(video => {
              newTimestamps[video.filename] = [0, 5]; // Default 5 seconds
            });
            setTimestamps(newTimestamps);

            setSuccess(`Added ${newVideos.length} video(s) to your reel`);
          }
        }
      } catch (err) {
        setError('Error selecting files: ' + err.message);
      }
    }
  };

  return (
    <div className="create-reel">
      <h1>Create Your Reel</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="reel-container">
        <div className="reel-sidebar">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Videos
            </button>
            <button
              className={`tab ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              Search Videos
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'upload' && (
              <div className="upload-tab">
                <div className="upload-area">
                  <input
                    type="file"
                    id="video-upload"
                    multiple
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <label htmlFor="video-upload" className="upload-label">
                    <div className="upload-icon">📤</div>
                    <div>Drag & drop videos or click to browse</div>
                  </label>
                </div>
                {isElectron && (
                  <button className="btn btn-outline mt-3" onClick={handleBrowseFiles}>
                    Browse Files
                  </button>
                )}
              </div>
            )}

            {activeTab === 'search' && (
              <div className="search-tab">
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    type="text"
                    placeholder="Search for videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control"
                  />
                  <button type="submit" className="btn btn-primary">
                    Search
                  </button>
                </form>

                <div className="search-results">
                  {isLoading && <div className="loading">Searching...</div>}
                  {searchResults.length === 0 && !isLoading && (
                    <div className="no-results">No videos found</div>
                  )}
                  {searchResults.map((video) => (
                    <div key={video.id} className="video-result">
                      <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                      <div className="video-info">
                        <h3>{video.title}</h3>
                        <p>{video.channelTitle}</p>
                      </div>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleVideoSelect(video)}
                        disabled={isLoading}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="reel-editor">
          <h2>Your Reel</h2>

          <div className="selected-videos">
            {selectedVideos.length === 0 ? (
              <div className="no-videos">No videos selected</div>
            ) : (
              selectedVideos.map((video, index) => (
                <div key={index} className="selected-video">
                  <div className="video-header">
                    <h3>{video.title}</h3>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveVideo(index)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="timestamp-controls">
                    <div className="form-group">
                      <label>Start Time (seconds)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={timestamps[video.filename]?.[0] || 0}
                        onChange={(e) =>
                          handleTimestampChange(video.filename, 0, e.target.value)
                        }
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time (seconds)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={timestamps[video.filename]?.[1] || 5}
                        onChange={(e) =>
                          handleTimestampChange(video.filename, 1, e.target.value)
                        }
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="music-section">
            <h2>Music</h2>
            <div className="music-options">
              <div className="form-group">
                <label>Upload Music File</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleMusicUpload}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Or YouTube Music URL</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            {musicFile && (
              <div className="music-info">
                <p>Selected music: {musicFile.originalName}</p>
              </div>
            )}
          </div>

          <div className="playback-speed">
            <h2>Playback Speed</h2>
            <div className="form-group">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="form-control"
              />
              <span>{playbackSpeed}x</span>
            </div>
          </div>

          <div className="create-actions">
            <button
              className="btn btn-primary"
              onClick={handleCreateReel}
              disabled={isLoading || selectedVideos.length === 0 || (!musicFile && !musicUrl)}
            >
              {isLoading ? 'Creating...' : 'Create Reel'}
            </button>
          </div>

          {outputReel && (
            <div className="output-section">
              <h2>Your Reel is Ready!</h2>
              <div className="output-actions">
                <button className="btn btn-success" onClick={handleSaveReel}>
                  Save Reel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateReel; 