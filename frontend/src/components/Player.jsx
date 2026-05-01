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
    <div className="fixed bottom-[72px] md:bottom-0 left-0 w-full h-20 md:h-24 bg-black/80 backdrop-blur-lg border-t border-white/5 text-white px-2 md:px-6 flex items-center justify-between z-[60] transition-all duration-300">
      <audio 
        ref={audioRef} 
        src={currentSong.uri} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Left: Song Info */}
      <div className="flex items-center gap-3 md:gap-4 w-auto md:w-1/3 min-w-0">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 flex-shrink-0 flex items-center justify-center rounded-lg overflow-hidden shadow-2xl border border-white/5">
            {currentSong.image ? (
              <img src={currentSong.image} alt={currentSong.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-[10px] md:text-xs font-bold">SONG</span>
            )}
        </div>
        <div className="flex flex-col justify-center overflow-hidden">
          <p className="font-bold text-sm md:text-base truncate max-w-[120px] sm:max-w-none hover:underline cursor-pointer">{currentSong.title}</p>
          <p className="text-xs md:text-sm text-gray-400 truncate max-w-[120px] sm:max-w-none hover:text-white cursor-pointer transition-colors">{currentSong.artist?.username || 'Unknown Artist'}</p>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors hidden sm:block ml-2">
          <Heart size={18} />
        </button>
      </div>
      
      {/* Center: Controls */}
      <div className="flex-1 max-w-[600px] flex flex-col items-center justify-center px-4">
        <div className="flex items-center gap-4 md:gap-8 mb-2">
          <button className="text-gray-400 hover:text-white transition-colors hidden sm:block">
            <Shuffle size={18} />
          </button>
          
          <button onClick={playPrev} className="text-gray-300 hover:text-white transition-all active:scale-90 disabled:opacity-30" disabled={!songsQueue || songsQueue.length <= 1}>
            <SkipBack size={20} fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-black shadow-lg"
          >
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
          </button>
          
          <button onClick={playNext} className="text-gray-300 hover:text-white transition-all active:scale-90 disabled:opacity-30" disabled={!songsQueue || songsQueue.length <= 1}>
            <SkipForward size={20} fill="currentColor" />
          </button>

          <button className="text-gray-400 hover:text-white transition-colors hidden sm:block">
            <Repeat size={18} />
          </button>
        </div>
        
        <div className="w-full flex items-center gap-3 text-[10px] md:text-xs text-gray-400 font-medium">
          <span className="w-8 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 h-1 group flex items-center">
             <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={currentTime} 
                onChange={handleSeek}
                className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
             />
             <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-white group-hover:bg-green-500 rounded-full transition-colors" 
                   style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                 />
             </div>
             {/* Progress handle (optional, could be added with absolute positioning) */}
          </div>
          <span className="w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="hidden md:flex w-1/3 justify-end items-center gap-4 pr-2">
        <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
          {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>
        <div className="relative w-28 h-1 group flex items-center">
            <input 
              type="range" 
              min={0} 
              max={1} 
              step={0.01}
              value={isMuted ? 0 : volume} 
              onChange={handleVolumeChange}
              className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
            />
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-white group-hover:bg-green-500 rounded-full transition-colors" 
                   style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                 />
             </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
