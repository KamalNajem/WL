'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamic import to avoid SSR issues with react-player
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

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

interface ProgressState {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
}

interface PlayerInstance {
    seekTo: (amount: number, type?: 'seconds' | 'fraction') => void;
    getCurrentTime: () => number;
    getDuration: () => number;
}

export default function SmartVideoPlayer({
    contentId,
    url,
    title,
    onComplete,
    onProgressUpdate,
}: SmartVideoPlayerProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState(0);
    const [showControls, setShowControls] = useState(true);
    
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

    // Get player instance with proper methods
    const getPlayer = (): PlayerInstance | null => {
        if (playerRef.current) {
            return playerRef.current as PlayerInstance;
        }
        return null;
    };

    // Fetch initial progress on mount
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await api.get(`courses/progress/?content_id=${contentId}`);
                const { last_timestamp, is_completed } = response.data;
                
                const player = getPlayer();
                if (last_timestamp > 0 && player) {
                    player.seekTo(last_timestamp, 'seconds');
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
    const saveProgress = useCallback(async (timestamp: number, percent: number) => {
        try {
            const response = await api.post('courses/progress/', {
                content_id: contentId,
                timestamp: timestamp,
                percent: Math.round(percent),
            });
            
            setLastSavedTime(timestamp);
            
            // Handle gamification response
            if (response.data.gamification) {
                setIsCompleted(true);
                onComplete?.(response.data.gamification);
            }
            
            onProgressUpdate?.(percent);
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }, [contentId, onComplete, onProgressUpdate]);

    // Heartbeat: save progress every 10 seconds while playing
    useEffect(() => {
        if (playing && isReady) {
            heartbeatInterval.current = setInterval(() => {
                const player = getPlayer();
                if (player) {
                    const currentTime = player.getCurrentTime();
                    const percentPlayed = duration > 0 ? (currentTime / duration) * 100 : 0;
                    
                    // Only save if moved significantly (more than 5 seconds)
                    if (Math.abs(currentTime - lastSavedTime) > 5) {
                        saveProgress(currentTime, percentPlayed);
                    }
                }
            }, 10000); // Every 10 seconds
        }
        
        return () => {
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
            }
        };
    }, [playing, isReady, duration, lastSavedTime, saveProgress]);

    // Handle video end
    const handleEnded = () => {
        setPlaying(false);
        saveProgress(duration, 100);
    };

    // Handle progress updates
    const handleProgress = (state: ProgressState) => {
        if (!seeking) {
            setPlayed(state.played);
        }
    };

    // Handle seek
    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        setSeeking(false);
        const target = e.target as HTMLInputElement;
        const player = getPlayer();
        player?.seekTo(parseFloat(target.value));
    };

    // Skip forward/backward
    const skip = (seconds: number) => {
        const player = getPlayer();
        if (player) {
            const current = player.getCurrentTime();
            player.seekTo(current + seconds, 'seconds');
        }
    };

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Auto-hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
        }
        controlsTimeout.current = setTimeout(() => {
            if (playing) {
                setShowControls(false);
            }
        }, 3000);
    };

    // Handle fullscreen
    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };

    // Toggle mute with volume restore
    const toggleMute = () => {
        if (muted) {
            setMuted(false);
            if (volume === 0) setVolume(0.8);
        } else {
            setMuted(true);
        }
    };

    const currentTime = played * duration;
    const progressPercent = played * 100;

    return (
        <Card className="overflow-hidden bg-black border-border">
            <div 
                ref={containerRef}
                className="relative group"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => playing && setShowControls(false)}
            >
                {/* Video Player */}
                <div className="aspect-video">
                    <ReactPlayer
                        ref={playerRef}
                        url={url}
                        width="100%"
                        height="100%"
                        playing={playing}
                        muted={muted}
                        volume={volume}
                        onReady={() => setIsReady(true)}
                        onDuration={setDuration}
                        // @ts-expect-error - react-player has different onProgress signature than native video
                        onProgress={handleProgress}
                        onEnded={handleEnded}
                    />
                </div>

                {/* Completed Badge */}
                {isCompleted && (
                    <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                    </div>
                )}

                {/* Controls Overlay */}
                <div className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300",
                    showControls ? "opacity-100" : "opacity-0"
                )}>
                    {/* Progress Bar */}
                    <div className="mb-3">
                        <input
                            type="range"
                            min={0}
                            max={0.999999}
                            step="any"
                            value={played}
                            onChange={handleSeekChange}
                            onMouseDown={handleSeekMouseDown}
                            onMouseUp={handleSeekMouseUp}
                            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                                       [&::-webkit-slider-thumb]:appearance-none 
                                       [&::-webkit-slider-thumb]:w-3 
                                       [&::-webkit-slider-thumb]:h-3 
                                       [&::-webkit-slider-thumb]:rounded-full 
                                       [&::-webkit-slider-thumb]:bg-primary"
                            style={{
                                background: `linear-gradient(to right, hsl(var(--primary)) ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%)`
                            }}
                        />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Play/Pause */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPlaying(!playing)}
                                className="text-white hover:bg-white/20"
                            >
                                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>

                            {/* Skip Back */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => skip(-10)}
                                className="text-white hover:bg-white/20"
                            >
                                <SkipBack className="w-4 h-4" />
                            </Button>

                            {/* Skip Forward */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => skip(10)}
                                className="text-white hover:bg-white/20"
                            >
                                <SkipForward className="w-4 h-4" />
                            </Button>

                            {/* Volume */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMute}
                                className="text-white hover:bg-white/20"
                            >
                                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>

                            {/* Time */}
                            <span className="text-white text-sm ml-2">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Progress Percent */}
                            <span className="text-white/70 text-sm">
                                {Math.round(progressPercent)}%
                            </span>

                            {/* Fullscreen */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleFullscreen}
                                className="text-white hover:bg-white/20"
                            >
                                <Maximize className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Click to play overlay (when paused) */}
                {!playing && isReady && (
                    <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={() => setPlaying(true)}
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors">
                            <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                    </div>
                )}
            </div>

            {/* Title Bar */}
            <CardContent className="p-4 bg-card">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <div className="flex items-center gap-4 mt-2">
                    <Progress value={progressPercent} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">
                        {Math.round(progressPercent)}% complete
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
