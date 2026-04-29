import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Heart } from 'lucide-react';

const Player = ({ currentSong, songsQueue, playSong }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.log("Auto-play prevented", e));
    }
  }, [currentSong]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log(e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.volume = newMuted ? 0 : volume;
  };

  const handleEnded = () => {
    if (songsQueue && songsQueue.length > 0 && currentSong) {
      const currentIndex = songsQueue.findIndex(s => s._id === currentSong._id);
      if (currentIndex !== -1 && currentIndex < songsQueue.length - 1) {
        playSong(songsQueue[currentIndex + 1], songsQueue);
      } else {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    if (songsQueue && currentSong) {
      const currentIndex = songsQueue.findIndex(s => s._id === currentSong._id);
      if (currentIndex !== -1 && currentIndex < songsQueue.length - 1) {
        playSong(songsQueue[currentIndex + 1], songsQueue);
      }
    }
  };

  const playPrev = () => {
    if (songsQueue && currentSong) {
      const currentIndex = songsQueue.findIndex(s => s._id === currentSong._id);
      if (currentIndex > 0) {
        playSong(songsQueue[currentIndex - 1], songsQueue);
      } else {
        if (audioRef.current) audioRef.current.currentTime = 0;
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full h-24 bg-[#181818] border-t border-gray-800 text-white px-4 flex items-center justify-between z-50">
      <audio 
        ref={audioRef} 
        src={currentSong.uri} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Left: Song Info */}
      <div className="flex items-center gap-4 w-1/3 min-w-[180px]">
        <div className="w-14 h-14 bg-gray-700 flex-shrink-0 flex items-center justify-center rounded">
            <span className="text-gray-400 text-xs">Art</span>
        </div>
        <div className="flex flex-col justify-center overflow-hidden mr-2">
          <p className="font-bold text-sm truncate hover:underline cursor-pointer">{currentSong.title}</p>
          <p className="text-xs text-gray-400 truncate hover:underline cursor-pointer">{currentSong.artist?.username || 'Unknown Artist'}</p>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Heart size={16} />
        </button>
      </div>
      
      {/* Center: Controls */}
      <div className="flex-1 max-w-[722px] flex flex-col items-center justify-center px-4">
        <div className="flex items-center gap-6 mb-2">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Shuffle size={16} />
          </button>
          
          <button onClick={playPrev} className="text-gray-400 hover:text-white transition-colors disabled:opacity-50" disabled={!songsQueue || songsQueue.length <= 1}>
            <SkipBack size={20} fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-all text-black"
          >
            {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-1" />}
          </button>
          
          <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors disabled:opacity-50" disabled={!songsQueue || songsQueue.length <= 1}>
            <SkipForward size={20} fill="currentColor" />
          </button>

          <button className="text-gray-400 hover:text-white transition-colors">
            <Repeat size={16} />
          </button>
        </div>
        
        <div className="w-full flex items-center gap-2 text-xs text-gray-400 font-medium">
          <span>{formatTime(currentTime)}</span>
          <div className="relative flex-1 h-1 group flex items-center">
             <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={currentTime} 
                onChange={handleSeek}
                className="absolute w-full h-1 opacity-0 cursor-pointer z-10"
             />
             <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-white group-hover:bg-green-500 rounded-full" 
                   style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                 />
             </div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="hidden md:flex w-1/3 justify-end items-center gap-3 pr-2">
        <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <div className="relative w-24 h-1 group flex items-center">
            <input 
              type="range" 
              min={0} 
              max={1} 
              step={0.01}
              value={isMuted ? 0 : volume} 
              onChange={handleVolumeChange}
              className="absolute w-full h-1 opacity-0 cursor-pointer z-10"
            />
            <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-white group-hover:bg-green-500 rounded-full" 
                   style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                 />
             </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
