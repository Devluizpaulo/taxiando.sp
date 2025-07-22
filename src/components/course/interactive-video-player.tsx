'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface VideoInteraction {
  id: string;
  type: 'question' | 'note' | 'link';
  timeInSeconds: number;
  content: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
  linkUrl?: string;
  linkText?: string;
}

interface InteractiveVideoPlayerProps {
  videoId: string;
  interactions: VideoInteraction[];
  onProgress?: (progress: number) => void;
  onInteractionComplete?: (interactionId: string, wasCorrect?: boolean) => void;
}

export function InteractiveVideoPlayer({ 
  videoId, 
  interactions,
  onProgress,
  onInteractionComplete 
}: InteractiveVideoPlayerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeInteraction, setActiveInteraction] = useState<VideoInteraction | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedInteractions, setCompletedInteractions] = useState<Set<string>>(new Set());
  const playerRef = useRef<HTMLDivElement>(null);

  // Carregar a API do YouTube
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      // @ts-ignore
      const newPlayer = new YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          controls: 1,
          rel: 0,
        },
        events: {
          onStateChange: (event: any) => {
            setIsPlaying(event.data === 1);
          },
          onReady: (event: any) => {
            setPlayer(event.target);
          },
        },
      });
    };

    return () => {
      // @ts-ignore
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, [videoId]);

  // Monitorar o tempo do vídeo
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      const time = player.getCurrentTime();
      setCurrentTime(time);

      if (onProgress) {
        const duration = player.getDuration();
        onProgress(Math.round((time / duration) * 100));
      }

      // Verificar interações no tempo atual
      if (!activeInteraction) {
        const interaction = interactions.find(i => 
          Math.abs(i.timeInSeconds - time) < 0.5 && !completedInteractions.has(i.id)
        );

        if (interaction) {
          setActiveInteraction(interaction);
          player.pauseVideo();
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player, isPlaying, interactions, activeInteraction, completedInteractions, onProgress]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!activeInteraction || !selectedOption) return;

    const correctOption = activeInteraction.options?.find(o => o.isCorrect);
    const selectedOptionObj = activeInteraction.options?.find(o => o.id === selectedOption);
    const correct = selectedOptionObj?.isCorrect || false;

    setIsCorrect(correct);
    setShowResult(true);

    if (onInteractionComplete) {
      onInteractionComplete(activeInteraction.id, correct);
    }
  };

  const handleContinue = () => {
    if (activeInteraction) {
      setCompletedInteractions(prev => new Set([...prev, activeInteraction.id]));
    }
    setActiveInteraction(null);
    setSelectedOption(null);
    setShowResult(false);
    player.playVideo();
  };

  const renderInteraction = () => {
    if (!activeInteraction) return null;

    switch (activeInteraction.type) {
      case 'question':
        return (
          <Card className="absolute inset-0 bg-white/95 z-10 flex flex-col">
            <CardContent className="flex-1 flex flex-col p-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2" 
                onClick={handleContinue}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Pergunta</h3>
                <p>{activeInteraction.content}</p>
              </div>

              {!showResult ? (
                <>
                  <div className="space-y-2 mb-6">
                    {activeInteraction.options?.map(option => (
                      <div 
                        key={option.id}
                        className={`p-3 border rounded-md cursor-pointer ${selectedOption === option.id ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                        onClick={() => handleOptionSelect(option.id)}
                      >
                        {option.text}
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={handleSubmitAnswer} 
                    disabled={!selectedOption}
                    className="mt-auto self-end"
                  >
                    Responder
                  </Button>
                </>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className={`p-4 rounded-md mb-4 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      <span className="font-medium">
                        {isCorrect ? 'Correto!' : 'Incorreto!'}
                      </span>
                    </div>
                  </div>
                  <Button onClick={handleContinue} className="mt-auto self-end">
                    Continuar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'note':
        return (
          <Card className="absolute inset-0 bg-white/95 z-10 flex flex-col">
            <CardContent className="flex-1 flex flex-col p-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2" 
                onClick={handleContinue}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Nota</h3>
                <p>{activeInteraction.content}</p>
              </div>
              
              <Button onClick={handleContinue} className="mt-auto self-end">
                Continuar
              </Button>
            </CardContent>
          </Card>
        );

      case 'link':
        return (
          <Card className="absolute inset-0 bg-white/95 z-10 flex flex-col">
            <CardContent className="flex-1 flex flex-col p-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2" 
                onClick={handleContinue}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Link Relacionado</h3>
                <p>{activeInteraction.content}</p>
                <a 
                  href={activeInteraction.linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline mt-2 inline-block"
                >
                  {activeInteraction.linkText || 'Abrir link'}
                </a>
              </div>
              
              <Button onClick={handleContinue} className="mt-auto self-end">
                Continuar
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full aspect-video">
      <div ref={playerRef} className="w-full h-full"></div>
      {renderInteraction()}
    </div>
  );
}