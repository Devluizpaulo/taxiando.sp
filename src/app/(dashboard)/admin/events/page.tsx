
import { getAdminEvents } from '@/app/actions/event-actions';
import { EventsClientPage } from './events-client-page';

export default async function AdminEventsPage() {
    const events = await getAdminEvents();
    return <EventsClientPage initialEvents={events} />;
}
