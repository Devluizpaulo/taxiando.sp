import { getUpcomingEvents } from '@/app/actions/event-actions';
import EventsPageClient from './events-client-page';

export default async function EventsPage() {
    const events = await getUpcomingEvents();
    return <EventsPageClient events={events} tips={[]} />;
}
