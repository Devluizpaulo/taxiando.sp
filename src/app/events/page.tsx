import { getUpcomingEvents } from '@/app/actions/event-actions';
import { getTips } from '@/app/actions/city-guide-actions';
import EventsPageClient from './events-client-page';

export default async function EventsPage() {
    const [events, tips] = await Promise.all([
        getUpcomingEvents(),
        getTips()
    ]);
    
    return <EventsPageClient events={events} tips={tips} />;
}
