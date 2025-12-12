'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useGamification } from '@/contexts/GamificationContext';
import { 
    CheckCircle2, 
    AlertCircle, 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    Maximize, 
    Minimize,
    SkipBack,
    SkipForward
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GamificationResponse {
    xp_gained?: number;
    new_badges?: Array<{ id: number; name: string; icon: string }>;
    level_up?: boolean;
    new_level?: number;
}

interface SmartVideoPlayerProps {
    contentId: number;
    url: string;
    title: string;
    onComplete?: (gamification: GamificationResponse) => void;
    onProgressUpdate?: (percent: number) => void;
}

export default function SmartVideoPlayer({
    contentId,
    url,
    title,
    onComplete,
    onProgressUpdate,
}: SmartVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { refreshGamification } = useGamification();
    
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [initialTimestamp, setInitialTimestamp] = useState(0);
    const [lastSavedTime, setLastSavedTime] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Custom controls state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch initial progress on mount
    useEffect(() => {
        if (!contentId) return;
        
        const fetchProgress = async () => {
            try {
                const response = await api.get(`courses/progress/?content_id=${contentId}`);
                const { last_timestamp, is_completed } = response.data;
                
                if (last_timestamp > 0) {
                    setInitialTimestamp(last_timestamp);
                    setLastSavedTime(last_timestamp);
                }
                
                if (is_completed) {
                    setIsCompleted(true);
                }
            } catch (error) {
                console.error('Error fetching progress:', error);
            }
        };
        
        fetchProgress();
    }, [contentId]);

    // Save progress to backend
    const saveProgress = useCallback(async (timestamp: number, percent: number, duration: number = 10) => {
        console.log("💓 Sending Heartbeat:", { contentId, timestamp: Math.round(timestamp), percent: Math.round(percent), duration });
        
        try {
            const response = await api.post('courses/progress/', {
                content_id: contentId,
                timestamp: timestamp,
                percent: Math.round(percent),
                duration: duration, // Time spent since last heartbeat
            });
            
            console.log("✅ Heartbeat Response:", response.data);
            
            setLastSavedTime(timestamp);
            
            if (response.data.gamification) {
                console.log("🎮 Gamification earned:", response.data.gamification);
                setIsCompleted(true);
                onComplete?.(response.data.gamification);
                
                // Refresh gamification context to update UI
                console.log("🔄 Triggering gamification refresh...");
                await refreshGamification();
            }
            
            onProgressUpdate?.(percent);
        } catch (error) {
            console.error('❌ Error saving progress:', error);
        }
    }, [contentId, onComplete, onProgressUpdate, refreshGamification]);

    // Auto-resume: seek to saved position when video metadata loads
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsLoaded(true);
            
            // Auto-resume to saved position
            if (initialTimestamp > 0) {
                videoRef.current.currentTime = initialTimestamp;
            }
        }
    };

    // Update current time as video plays
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    // Heartbeat: save progress every 10 seconds while playing
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isLoaded) return;

        const handlePlay = () => {
            setIsPlaying(true);
            // Start heartbeat when video plays
            heartbeatInterval.current = setInterval(() => {
                if (video && !video.paused && duration > 0) {
                    const currentT = video.currentTime;
                    const percentPlayed = (currentT / duration) * 100;
                    
                    // Calculate actual time since last save
                    const timeSinceLastSave = Math.abs(currentT - lastSavedTime);
                    
                    // Only save if we've moved at least 5 seconds since last save
                    if (timeSinceLastSave > 5) {
                        saveProgress(currentT, percentPlayed, timeSinceLastSave);
                    }
                }
            }, 10000);
        };

        const handlePause = () => {
            setIsPlaying(false);
            // Clear heartbeat when video pauses
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
                heartbeatInterval.current = null;
            }
            
            // Save current progress on pause
            if (video && duration > 0) {
                const currentT = video.currentTime;
                const percentPlayed = (currentT / duration) * 100;
                const timeSinceLastSave = Math.abs(currentT - lastSavedTime);
                saveProgress(currentT, percentPlayed, Math.max(timeSinceLastSave, 1));
            }
        };

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        
        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
            }
        };
    }, [isLoaded, duration, lastSavedTime, saveProgress]);

    // Handle video ended
    const handleEnded = () => {
        console.log("✅ Video Completed! Duration:", duration, "seconds");
        setIsPlaying(false);
        const timeSinceLastSave = Math.abs(duration - lastSavedTime);
        saveProgress(duration, 100, Math.max(timeSinceLastSave, 1));
    };

    // Skip forward/backward
    const skip = useCallback((seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
        }
    }, [duration]);

    // Toggle play/pause
    const togglePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    }, []);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle if this player is focused or no specific element is focused
            if (e.code === 'Space' && (e.target === document.body || containerRef.current?.contains(e.target as Node))) {
                e.preventDefault();
                togglePlayPause();
            }
            if (e.code === 'ArrowLeft' && containerRef.current?.contains(e.target as Node)) {
                e.preventDefault();
                skip(-10);
            }
            if (e.code === 'ArrowRight' && containerRef.current?.contains(e.target as Node)) {
                e.preventDefault();
                skip(10);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [togglePlayPause, skip]);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Auto-hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
        }
        controlsTimeout.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    // Seek to position
    const handleSeek = (value: number[]) => {
        if (videoRef.current && duration > 0) {
            const newTime = (value[0] / 100) * duration;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // Toggle mute
    const toggleMute = () => {
        if (videoRef.current) {
            if (isMuted) {
                videoRef.current.muted = false;
                videoRef.current.volume = volume || 0.5;
                setIsMuted(false);
            } else {
                videoRef.current.muted = true;
                setIsMuted(true);
            }
        }
    };

    // Handle volume change
    const handleVolumeChange = (value: number[]) => {
        if (videoRef.current) {
            const newVolume = value[0] / 100;
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };

    // Format time for display
    function formatTime(seconds: number) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    // No URL state
    if (!url) {
        return (
            <Card className="overflow-hidden border-border">
                <div className="aspect-video bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-destructive" />
                        <p>No video URL provided</p>
                    </div>
                </div>
                <CardContent className="p-4 bg-card">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden bg-black border-border">
            {/* Video Container with Custom Controls */}
            <div 
                ref={containerRef}
                className="relative group aspect-video bg-black"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
                tabIndex={0}
            >
                {/* Video Element - No native controls */}
                <video
                    ref={videoRef}
                    src={url}
                    className="w-full h-full object-contain"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    onClick={togglePlayPause}
                    playsInline
                />

                {/* Completed Badge */}
                {isCompleted && (
                    <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 z-20 backdrop-blur-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                    </div>
                )}

                {/* Big Center Play Button (when paused) */}
                {!isPlaying && isLoaded && (
                    <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                        onClick={togglePlayPause}
                    >
                        <div className="w-20 h-20 rounded-full bg-purple-600/90 hover:bg-purple-500 flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm shadow-2xl">
                            <Play className="w-10 h-10 text-white ml-1" fill="white" />
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <div className="text-white/70">Loading video...</div>
                    </div>
                )}

                {/* Custom Control Bar */}
                <div className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-16 transition-opacity duration-300 z-10",
                    showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
                )}>
                    {/* Progress Bar */}
                    <div className="mb-3 group/progress">
                        <Slider
                            value={[progressPercent]}
                            onValueChange={handleSeek}
                            max={100}
                            step={0.1}
                            className="cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_.bg-primary]:bg-purple-500 [&_[data-orientation=horizontal]]:h-1.5 group-hover/progress:[&_[data-orientation=horizontal]]:h-2 transition-all"
                        />
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Left Controls */}
                        <div className="flex items-center gap-1">
                            {/* Play/Pause */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePlayPause}
                                className="text-white hover:bg-white/20 h-9 w-9"
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5" fill="white" />
                                ) : (
                                    <Play className="w-5 h-5 ml-0.5" fill="white" />
                                )}
                            </Button>

                            {/* Skip Back */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => skip(-10)}
                                className="text-white hover:bg-white/20 h-9 w-9"
                                title="Skip back 10s"
                            >
                                <SkipBack className="w-4 h-4" />
                            </Button>

                            {/* Skip Forward */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => skip(10)}
                                className="text-white hover:bg-white/20 h-9 w-9"
                                title="Skip forward 10s"
                            >
                                <SkipForward className="w-4 h-4" />
                            </Button>

                            {/* Volume */}
                            <div className="flex items-center gap-1 group/volume">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleMute}
                                    className="text-white hover:bg-white/20 h-9 w-9"
                                >
                                    {isMuted || volume === 0 ? (
                                        <VolumeX className="w-5 h-5" />
                                    ) : (
                                        <Volume2 className="w-5 h-5" />
                                    )}
                                </Button>
                                <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-200">
                                    <Slider
                                        value={[isMuted ? 0 : volume * 100]}
                                        onValueChange={handleVolumeChange}
                                        max={100}
                                        step={1}
                                        className="cursor-pointer [&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_.bg-primary]:bg-white [&_[data-orientation=horizontal]]:h-1"
                                    />
                                </div>
                            </div>

                            {/* Time Display */}
                            <span className="text-white/90 text-sm font-mono ml-2 tabular-nums">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-1">
                            {/* Progress Percentage */}
                            <span className="text-purple-400 text-sm font-medium mr-2">
                                {Math.round(progressPercent)}%
                            </span>

                            {/* Fullscreen */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleFullscreen}
                                className="text-white hover:bg-white/20 h-9 w-9"
                            >
                                {isFullscreen ? (
                                    <Minimize className="w-5 h-5" />
                                ) : (
                                    <Maximize className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title Bar */}
            <CardContent className="p-4 bg-card border-t border-border">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <div className="flex items-center gap-4 mt-2">
                    <Progress 
                        value={progressPercent} 
                        className="flex-1 h-2 [&>div]:bg-purple-500" 
                    />
                    <span className="text-sm text-muted-foreground tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(progressPercent)}% complete
                </div>
            </CardContent>
        </Card>
    );
}
