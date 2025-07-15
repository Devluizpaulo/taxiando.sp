

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { type Vehicle } from '@/lib/types';
import { vehiclePerks as allPerks } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car } from 'lucide-react';

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
    return (
        <Card className="flex flex-col overflow-hidden shadow-md transition-all hover:shadow-xl">
            <CardHeader className="p-0 relative">
                <Link href={`/rentals/${vehicle.id}`}>
                    <Image 
                        src={vehicle.imageUrls[0] || 'https://placehold.co/600x400.png'} 
                        alt={`${vehicle.make} ${vehicle.model}`} 
                        width={600} height={400} 
                        className="w-full object-cover aspect-video" 
                        data-ai-hint="car front view"
                    />
                </Link>
                <Badge className="absolute top-3 right-3 text-lg py-1 px-3 bg-primary/90 text-primary-foreground font-bold border-2 border-primary-foreground/50">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(vehicle.dailyRate)}
                    <span className="text-xs font-normal ml-1">/dia</span>
                </Badge>
            </CardHeader>
            <CardContent className="flex-1 p-4">
                <CardTitle className="font-headline text-xl">{vehicle.make} {vehicle.model}</CardTitle>
                <CardDescription>{vehicle.year} &bull; {vehicle.condition}</CardDescription>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {vehicle.perks.slice(0, 4).map(perk => {
                        const PerkIcon = allPerks.find(p => p.id === perk.id)?.icon || Car;
                        return (
                            <div key={perk.id} className="flex items-center gap-2">
                                <PerkIcon className="h-4 w-4 text-primary" />
                                <span>{perk.label}</span>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/50">
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href={`/rentals/${vehicle.id}`}>Ver Detalhes e Alugar</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
