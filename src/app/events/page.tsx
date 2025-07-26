import { getUpcomingEvents } from '@/app/actions/event-actions';
import EventsPageClient from './events-client-page';
import { PageViewTracker } from "@/components/page-view-tracker";

export default async function EventsPage() {
    const events = await getUpcomingEvents();
    return (
        <>
            <PageViewTracker page="events" />
            <EventsPageClient events={events} tips={[]} />
        </>
    );
}
