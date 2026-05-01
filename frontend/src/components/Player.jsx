import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Heart, ChevronUp, ChevronDown } from 'lucide-react';

const Player = ({ currentSong, songsQueue, playSong }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <>
      <audio 
        ref={audioRef} 
        src={currentSong.uri} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* MOBILE MINI PLAYER (Floating) */}
      <div 
        onClick={() => setIsExpanded(true)}
        className={`md:hidden fixed bottom-[84px] left-2 right-2 h-14 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg shadow-2xl border border-white/10 flex items-center px-3 z-[90] transition-all duration-300 active:scale-95 ${isExpanded ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}
      >
        <div className="w-10 h-10 rounded overflow-hidden shadow-lg flex-shrink-0 bg-white/5">
          {currentSong.image ? (
            <img src={currentSong.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-[8px] font-bold">SONG</div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 px-3">
          <p className="text-sm font-bold text-white truncate">{currentSong.title}</p>
          <p className="text-[10px] font-medium text-gray-400 truncate tracking-tight">{currentSong.artist?.username || 'Unknown Artist'}</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-white/60 hover:text-white transition-colors">
            <Heart size={20} />
          </button>
          <button 
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black"
          >
            {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
          </button>
        </div>

        {/* Progress Bar (at very bottom of mini player) */}
        <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-100" 
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* MOBILE FULLSCREEN PLAYER */}
      <div className={`md:hidden fixed inset-0 bg-gradient-to-b from-gray-800 via-[#121212] to-black z-[110] transition-all duration-500 flex flex-col p-6 pb-safe ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <header className="flex justify-between items-center mb-10">
          <button onClick={() => setIsExpanded(false)} className="p-2 text-white/70 hover:text-white transition-colors">
            <ChevronDown size={32} />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Playing from your library</p>
            <p className="text-xs font-bold text-white mt-0.5 truncate max-w-[200px]">{currentSong.title}</p>
          </div>
          <div className="w-12 h-12" /> {/* Spacer */}
        </header>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full aspect-square max-w-[340px] rounded-2xl overflow-hidden shadow-2xl mb-12 ring-1 ring-white/10 bg-white/5">
            {currentSong.image ? (
              <img src={currentSong.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-3xl font-black text-white/10">SONG</div>
            )}
          </div>

          <div className="w-full max-w-[340px] flex items-start justify-between gap-4 mb-10">
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-white truncate leading-tight">{currentSong.title}</h2>
              <p className="text-lg font-bold text-gray-400 truncate mt-1">{currentSong.artist?.username || 'Unknown Artist'}</p>
            </div>
            <button className="text-white/40 hover:text-green-500 transition-all mt-1">
              <Heart size={28} />
            </button>
          </div>

          <div className="w-full max-w-[340px] flex flex-col gap-4">
            <div className="relative w-full h-2 group flex items-center">
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
                     className="h-full bg-white rounded-full" 
                     style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                   />
               </div>
            </div>
            <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-between max-w-[340px] mx-auto mt-auto mb-10">
          <button className="text-white/40 hover:text-white transition-colors">
            <Shuffle size={24} />
          </button>
          <button onClick={playPrev} className="text-white transition-all active:scale-90">
            <SkipBack size={40} fill="white" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black shadow-2xl active:scale-95 transition-all"
          >
            {isPlaying ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1" />}
          </button>
          <button onClick={playNext} className="text-white transition-all active:scale-90">
            <SkipForward size={40} fill="white" />
          </button>
          <button className="text-white/40 hover:text-white transition-colors">
            <Repeat size={24} />
          </button>
        </div>
      </div>

      {/* DESKTOP PLAYER (Unchanged logic, improved desktop spacing) */}
      <div className="hidden md:flex fixed bottom-0 left-0 w-full h-24 bg-black/95 backdrop-blur-xl border-t border-white/5 text-white px-6 items-center justify-between z-[60]">
        {/* Left: Song Info */}
        <div className="flex items-center gap-4 w-1/3 min-w-0">
          <div className="w-14 h-14 bg-white/5 flex-shrink-0 flex items-center justify-center rounded overflow-hidden shadow-xl border border-white/5">
              {currentSong.image ? (
                <img src={currentSong.image} alt={currentSong.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 text-xs font-bold">SONG</span>
              )}
          </div>
          <div className="flex flex-col justify-center overflow-hidden">
            <p className="font-bold text-sm truncate hover:underline cursor-pointer">{currentSong.title}</p>
            <p className="text-xs text-gray-400 truncate hover:text-white cursor-pointer transition-colors">{currentSong.artist?.username || 'Unknown Artist'}</p>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors ml-4">
            <Heart size={18} />
          </button>
        </div>
        
        {/* Center: Controls */}
        <div className="flex-1 max-w-[700px] flex flex-col items-center justify-center px-4">
          <div className="flex items-center gap-8 mb-2">
            <button className="text-gray-500 hover:text-white transition-colors">
              <Shuffle size={18} />
            </button>
            <button onClick={playPrev} className="text-gray-300 hover:text-white transition-all active:scale-90">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button 
              onClick={togglePlay} 
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-black shadow-lg"
            >
              {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
            </button>
            <button onClick={playNext} className="text-gray-300 hover:text-white transition-all active:scale-90">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button className="text-gray-500 hover:text-white transition-colors">
              <Repeat size={18} />
            </button>
          </div>
          
          <div className="w-full flex items-center gap-3 text-xs text-gray-400 font-medium">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
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
            </div>
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume */}
        <div className="flex w-1/3 justify-end items-center gap-4">
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
    </>
  );
};

export default Player;
