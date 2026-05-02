import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Heart, ChevronDown, ListMusic } from 'lucide-react';

const Player = ({ currentSong, songsQueue, playSong, likedSongs, toggleLike }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Swipe-to-dismiss state
  const touchStartY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].screenY;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].screenY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 100) {
      setIsExpanded(false);
    }
    setDragOffset(0);
  };

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.log("Auto-play prevented", e));
    }
  }, [currentSong]);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
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

  const playNext = (e) => {
    if (e) e.stopPropagation();
    if (songsQueue && currentSong) {
      const currentIndex = songsQueue.findIndex(s => s._id === currentSong._id);
      if (currentIndex !== -1 && currentIndex < songsQueue.length - 1) {
        playSong(songsQueue[currentIndex + 1], songsQueue);
      }
    }
  };

  const playPrev = (e) => {
    if (e) e.stopPropagation();
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

  const isLiked = likedSongs?.includes(currentSong._id);

  return (
    <>
      <audio 
        ref={audioRef} 
        src={currentSong.uri} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* MOBILE MINI PLAYER - Purple Glass Floating Island */}
      <div 
        onClick={() => setIsExpanded(true)}
        className={`md:hidden fixed bottom-[88px] left-3 right-3 h-16 bg-[#1a152e]/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-purple-500/20 flex items-center px-3 z-[90] transition-all duration-500 active:scale-[0.98] ${isExpanded ? 'opacity-0 translate-y-12' : 'opacity-100 translate-y-0'}`}
      >
        <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg flex-shrink-0 relative group">
          {currentSong.image ? (
            <img src={currentSong.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-950 text-[8px] font-black text-white/20">SONG</div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 px-4">
          <p className="text-[13px] font-black text-white truncate tracking-tight">{currentSong.title}</p>
          <p className="text-[11px] font-bold text-purple-200/50 truncate tracking-tight">{currentSong.artist?.username || 'Unknown Artist'}</p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleLike(currentSong._id); }}
            className={`transition-all active:scale-125 ${isLiked ? 'text-green-500' : 'text-white/40 hover:text-white'}`}
          >
            <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg active:scale-90"
          >
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
          </button>
        </div>

        {/* Purple Progress Bar */}
        <div className="absolute bottom-0 left-3 right-3 h-[3px] bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-500 transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.6)]" 
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* MOBILE FULLSCREEN PLAYER - Purple Immersive Experience */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          transform: isExpanded ? `translateY(${dragOffset}px)` : 'translateY(100%)',
          transition: dragOffset > 0 ? 'none' : 'transform 0.5s cubic-bezier(0, 0, 0.2, 1), opacity 0.5s ease-out'
        }}
        className={`md:hidden fixed inset-0 bg-gradient-to-b from-[#2e1d4b] via-[#12101d] to-black z-[110] flex flex-col p-6 pb-safe ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_30%,rgba(168,85,247,0.2),transparent_70%)] pointer-events-none" />
        
        <header className="flex justify-between items-center mb-4 relative z-10">
          <button onClick={() => setIsExpanded(false)} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors active:scale-90">
            <ChevronDown className="w-8 h-8" />
          </button>
          <div className="text-center flex-1 px-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300/30">Playing Track</p>
            <p className="text-xs font-black text-white mt-0.5 truncate">{currentSong.title}</p>
          </div>
          <button className="p-2 -mr-2 text-white/60 hover:text-white transition-colors">
             <ListMusic size={20} />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 min-h-0">
          <div className={`w-full aspect-square max-w-[260px] sm:max-w-[300px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] mb-6 transition-transform duration-700 ${isPlaying ? 'scale-100' : 'scale-[0.92] opacity-80'} ring-1 ring-purple-500/20 flex-shrink`}>
            {currentSong.image ? (
              <img src={currentSong.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-4xl font-black text-white/5">SONG</div>
            )}
          </div>

          <div className="w-full max-w-[300px] flex items-end justify-between gap-4 mb-4">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate leading-tight tracking-tighter">{currentSong.title}</h2>
              <p className="text-base sm:text-lg font-bold text-purple-300/50 truncate mt-1">{currentSong.artist?.username || 'Unknown Artist'}</p>
            </div>
            <button 
              onClick={() => toggleLike(currentSong._id)}
              className={`transition-all active:scale-125 mb-1 ${isLiked ? 'text-green-500' : 'text-purple-300/30 hover:text-purple-400'}`}
            >
              <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="w-full max-w-[300px] flex flex-col gap-3 mb-4">
            <div className="relative w-full h-6 flex items-center group">
               <input 
                  type="range" 
                  min={0} 
                  max={duration || 100} 
                  value={currentTime} 
                  onChange={handleSeek}
                  className="absolute w-full h-1.5 opacity-0 cursor-pointer z-20"
               />
               <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-purple-500 rounded-full relative" 
                     style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                   >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
                   </div>
               </div>
            </div>
            <div className="flex justify-between text-[10px] font-black text-purple-300/30 tracking-widest uppercase">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* COMPACT & ALIGNED MOBILE CONTROLS */}
        <div className="w-full flex items-center justify-between max-w-[280px] mx-auto mt-auto mb-6 relative z-10 px-2 gap-4">
          <button className="text-purple-300/30 hover:text-white transition-colors">
            <Shuffle size={18} />
          </button>
          <button onClick={playPrev} className="text-white hover:text-purple-300 transition-all active:scale-75">
            <SkipBack className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-[0_10px_30px_rgba(168,85,247,0.3)] active:scale-90 transition-all flex-shrink-0"
          >
            {isPlaying ? <Pause className="w-6 h-6" fill="black" /> : <Play className="w-6 h-6 ml-1" fill="black" />}
          </button>
          <button onClick={playNext} className="text-white hover:text-purple-300 transition-all active:scale-75">
            <SkipForward className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" />
          </button>
          <button className="text-purple-300/30 hover:text-white transition-colors">
            <Repeat size={18} />
          </button>
        </div>
      </div>

      {/* DESKTOP PLAYER - Standard Dark Fixed Bar */}
      <div className="hidden md:flex fixed bottom-0 left-0 w-full h-[100px] bg-black/95 backdrop-blur-3xl border-t border-white/5 text-white px-8 items-center justify-between z-[60]">
        {/* Left: Song Info */}
        <div className="flex items-center gap-5 w-[30%] min-w-0">
          <div className="w-16 h-16 bg-white/5 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-white/5 group relative">
              {currentSong.image ? (
                <img src={currentSong.image} alt={currentSong.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <span className="text-gray-500 text-xs font-black">SONG</span>
              )}
          </div>
          <div className="flex flex-col justify-center overflow-hidden">
            <p className="font-black text-[15px] truncate hover:underline cursor-pointer tracking-tight">{currentSong.title}</p>
            <p className="text-[13px] font-bold text-white/50 truncate hover:text-white cursor-pointer transition-colors mt-0.5 tracking-tight">{currentSong.artist?.username || 'Unknown Artist'}</p>
          </div>
          <button 
            onClick={() => toggleLike(currentSong._id)}
            className={`transition-all ml-4 active:scale-125 ${isLiked ? 'text-green-500' : 'text-white/20 hover:text-green-500'}`}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>
        
        {/* Center: Controls */}
        <div className="flex-1 max-w-[700px] flex flex-col items-center justify-center px-6">
          <div className="flex items-center gap-9 mb-3">
            <button className="text-white/20 hover:text-white transition-colors active:scale-90">
              <Shuffle size={18} />
            </button>
            <button onClick={playPrev} className="text-white/70 hover:text-white transition-all active:scale-75">
              <SkipBack size={22} fill="currentColor" />
            </button>
            <button 
              onClick={togglePlay} 
              className="w-11 h-11 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-black shadow-[0_8px_20px_rgba(255,255,255,0.15)]"
            >
              {isPlaying ? <Pause size={22} fill="black" /> : <Play size={22} fill="black" className="ml-1" />}
            </button>
            <button onClick={playNext} className="text-white/70 hover:text-white transition-all active:scale-75">
              <SkipForward size={22} fill="currentColor" />
            </button>
            <button className="text-white/20 hover:text-white transition-colors active:scale-90">
              <Repeat size={18} />
            </button>
          </div>
          
          <div className="w-full flex items-center gap-4 text-[11px] font-black text-white/30 tracking-widest uppercase">
            <span className="w-12 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 h-1 group flex items-center">
               <input 
                  type="range" 
                  min={0} 
                  max={duration || 100} 
                  value={currentTime} 
                  onChange={handleSeek}
                  className="absolute w-full h-3 opacity-0 cursor-pointer z-10"
               />
               <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-white group-hover:bg-green-500 rounded-full transition-colors relative" 
                     style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                   >
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
               </div>
            </div>
            <span className="w-12">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume */}
        <div className="flex w-[30%] justify-end items-center gap-5 pr-2">
          <button className="text-white/40 hover:text-white transition-colors">
            <ListMusic size={20} />
          </button>
          <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors active:scale-90">
            {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
          <div className="relative w-32 h-1 group flex items-center">
              <input 
                type="range" 
                min={0} 
                max={1} 
                step={0.01}
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange}
                className="absolute w-full h-3 opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-white group-hover:bg-green-500 rounded-full transition-colors relative" 
                     style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                   >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
               </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;
