'use client';


import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    Maximize, 
    Settings, 
    Clock,
    CheckCircle,
    BookOpen,
    Lightbulb
} from 'lucide-react';
import { type ContentBlock } from '@/lib/types';

interface InteractiveVideoPlayerProps {
    videoBlock: ContentBlock & { type: 'video' };
    onProgress?: (progress: number) => void;
    onComplete?: () => void;
    showObservations?: boolean;
    observations?: string;
}

export function InteractiveVideoPlayer({ 
    videoBlock, 
    onProgress, 
    onComplete,
    showObservations = true,
    observations
}: InteractiveVideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showObservationsPanel, setShowObservationsPanel] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            const progress = (video.currentTime / video.duration) * 100;
            onProgress?.(progress);
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            onComplete?.();
        };

        const handleVolumeChange = () => {
            setVolume(video.volume);
            setIsMuted(video.muted);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('volumechange', handleVolumeChange);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('volumechange', handleVolumeChange);
        };
    }, [onProgress, onComplete]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newTime = (parseFloat(e.target.value) / 100) * duration;
        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const changePlaybackRate = (rate: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.playbackRate = rate;
        setPlaybackRate(rate);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getVideoEmbedUrl = (url: string, platform?: string) => {
        if (platform === 'youtube') {
            const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
            return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
        } else if (platform === 'vimeo') {
            const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
            return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
        }
        return url;
    };

    const isExternalVideo = videoBlock.platform && ['youtube', 'vimeo'].includes(videoBlock.platform);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5" />
                            {videoBlock.title || 'Vídeo'}
                        </CardTitle>
                        {showObservations && observations && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowObservationsPanel(!showObservationsPanel)}
                            >
                                <Lightbulb className="mr-2 h-4 w-4" />
                                Observações
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
                        {isExternalVideo ? (
                            <iframe
                                src={getVideoEmbedUrl(videoBlock.url, videoBlock.platform)}
                                className="w-full aspect-video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                className="w-full aspect-video"
                                controls={false}
                                preload="metadata"
                            >
                                <source src={videoBlock.url} type="video/mp4" />
                                Seu navegador não suporta o elemento de vídeo.
                            </video>
                        )}

                        {!isExternalVideo && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Button
                                    onClick={togglePlay}
                                    size="lg"
                                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                                >
                                    {isPlaying ? (
                                        <Pause className="h-8 w-8" />
                                    ) : (
                                        <Play className="h-8 w-8" />
                                    )}
                                </Button>
                            </div>
                        )}

                        {!isExternalVideo && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <div className="space-y-2">
                                    {/* Progress Bar */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={(currentTime / duration) * 100 || 0}
                                        onChange={handleSeek}
                                        className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    
                                    {/* Controls */}
                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={togglePlay}
                                                className="text-white hover:bg-white/20"
                                            >
                                                {isPlaying ? (
                                                    <Pause className="h-4 w-4" />
                                                ) : (
                                                    <Play className="h-4 w-4" />
                                                )}
                                            </Button>
                                            
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={toggleMute}
                                                    className="text-white hover:bg-white/20"
                                                >
                                                    {isMuted ? (
                                                        <VolumeX className="h-4 w-4" />
                                                    ) : (
                                                        <Volume2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={volume}
                                                    onChange={handleVolumeChange}
                                                    className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                                                />
                                            </div>
                                            
                                            <div className="flex items-center gap-1 text-sm">
                                                <Clock className="h-3 w-3" />
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowSettings(!showSettings)}
                                                className="text-white hover:bg-white/20"
                                            >
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                            
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={toggleFullscreen}
                                                className="text-white hover:bg-white/20"
                                            >
                                                <Maximize className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Playback Rate Settings */}
                                    {showSettings && (
                                        <div className="flex items-center gap-2 text-white text-sm">
                                            <span>Velocidade:</span>
                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                                <Button
                                                    key={rate}
                                                    variant={playbackRate === rate ? "default" : "ghost"}
                                                    size="sm"
                                                    onClick={() => changePlaybackRate(rate)}
                                                    className="text-white hover:bg-white/20"
                                                >
                                                    {rate}x
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Observações Panel */}
            {showObservationsPanel && observations && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-800 mb-2">Observações Importantes</h4>
                                <p className="text-blue-700 text-sm leading-relaxed">{observations}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
                <Progress 
                    value={(currentTime / duration) * 100 || 0} 
                    className="flex-1" 
                />
                <Badge variant="outline" className="text-xs">
                    {Math.round((currentTime / duration) * 100 || 0)}% completo
                </Badge>
            </div>
        </div>
    );
}