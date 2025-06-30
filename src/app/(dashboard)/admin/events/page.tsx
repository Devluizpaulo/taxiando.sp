
import EventsClientPage from './client-page';

// This is now a simple wrapper component.
// The actual logic and data fetching happens in the client component.
export default function AdminEventsPage() {
    return <EventsClientPage />;
}
