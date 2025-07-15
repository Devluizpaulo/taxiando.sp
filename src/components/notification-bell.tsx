
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Gift, Award, Info, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getNotificationsForUser, markNotificationsAsRead } from '@/app/actions/marketing-actions';
import { type Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import * as icons from 'lucide-react';
import { toDate } from '@/lib/date-utils';

const getIcon = (iconName?: string): React.ElementType => {
    if (!iconName) return Sparkles;
    const LucideIcon = (icons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
    return LucideIcon || Sparkles;
};

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [newNotificationCount, setNewNotificationCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            const { notifications, newNotificationCount } = await getNotificationsForUser();
            setNotifications(notifications);
            setNewNotificationCount(newNotificationCount);
        };
        fetchNotifications();
    }, []);

    const handleOpenChange = async (open: boolean) => {
        setIsOpen(open);
        if (open && newNotificationCount > 0) {
            await markNotificationsAsRead();
            setNewNotificationCount(0); // Optimistically update UI
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell />
                    {newNotificationCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                 <Card className="border-none shadow-none">
                    <CardHeader className="border-b">
                        <CardTitle>Notificações</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                <Bell className="mx-auto h-8 w-8 mb-2" />
                                Nenhuma notificação por aqui.
                            </div>
                        ) : (
                            <ul className="space-y-1">
                                {notifications.map(notification => {
                                    const Icon = getIcon(notification.icon);
                                    const NotificationContent = () => (
                                         <li className={cn(
                                            "flex items-start gap-4 p-3 rounded-lg",
                                            notification.link && "hover:bg-muted/50"
                                        )}>
                                            <Icon className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
                                            <div className="flex-1">
                                                <p className="font-semibold">{notification.title}</p>
                                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                                <p className="text-xs text-muted-foreground/80 mt-1">
                                                    {formatDistanceToNow(toDate(notification.createdAt) ?? new Date(), { addSuffix: true, locale: ptBR })}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                    
                                    return (
                                        <li key={notification.id}>
                                            {notification.link ? (
                                                <Link href={notification.link} target="_blank" rel="noopener noreferrer">
                                                    <NotificationContent />
                                                </Link>
                                            ) : (
                                                <NotificationContent />
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}
