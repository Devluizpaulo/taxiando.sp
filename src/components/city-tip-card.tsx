
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MapPin, Lightbulb, Share2 } from 'lucide-react';
import { type CityTip } from '@/lib/types';
import { SharePopover } from './share-buttons';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from './ui/badge';

export const CityTipCard = ({ tip }: { tip: CityTip }) => {
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const tipUrl = `${window.location.origin}/events#tip-${tip.id}`;
            setCurrentUrl(tipUrl);
        }
    }, [tip.id]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card id={`tip-${tip.id}`} className="group w-full overflow-hidden rounded-xl border-2 border-transparent bg-card shadow-lg transition-all duration-300 ease-in-out hover:border-primary hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
                    <CardHeader className="p-0">
                         <Image src={tip.imageUrls?.[0] || 'https://placehold.co/600x400.png'} alt={tip.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="restaurant city food" />
                    </CardHeader>
                    <CardContent className="p-4">
                        <Badge variant="secondary" className="mb-2">{tip.category}</Badge>
                        <CardTitle className="font-headline text-lg leading-tight line-clamp-2">{tip.title}</CardTitle>
                        <CardDescription className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" /> {tip.location}
                        </CardDescription>
                        {tip.priceRange && (
                            <p className="font-bold text-lg text-primary mt-2">{tip.priceRange}</p>
                        )}
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
                 <DialogHeader className="p-6 pb-4 border-b bg-background/90 backdrop-blur-sm z-10">
                    <Badge variant="secondary" className="w-fit mb-2">{tip.category}</Badge>
                    <DialogTitle className="font-headline text-2xl">{tip.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> {tip.location}
                    </DialogDescription>
                 </DialogHeader>
                 <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10">
                     {tip.imageUrls?.[0] && <Image src={tip.imageUrls[0]} alt={tip.title} width={600} height={400} className="w-full rounded-lg object-cover aspect-video"/>}
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                 </div>
                 <DialogFooter className="p-6 pt-4 border-t bg-background/90 backdrop-blur-sm flex-row justify-between items-center w-full z-10">
                    <div>
                         {tip.priceRange && (
                            <p className="font-bold text-xl text-primary">{tip.priceRange}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                         {tip.mapUrl && (
                            <Button asChild variant="outline">
                                <a href={tip.mapUrl} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="mr-2 h-4 w-4"/> Ver no Mapa
                                </a>
                            </Button>
                        )}
                        {currentUrl && <SharePopover title={tip.title} url={currentUrl} />}
                    </div>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
