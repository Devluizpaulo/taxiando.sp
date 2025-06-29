import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Event } from '@/lib/types';
import EventsClientPage from './client-page';

// This is a React Server Component (RSC)
// It fetches data on the server and passes it to a Client Component.
async function getEvents(): Promise<Event[]> {
    try {
        const eventsCollection = collection(db, 'events');
        const q = query(eventsCollection, orderBy('startDate', 'desc'));
        const querySnapshot = await getDocs(q);
        // Important: Convert Firestore Timestamps to serializable format (ISO string) for the client
        const eventsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                startDate: (data.startDate as any).toDate().toISOString(),
                endDate: (data.endDate as any).toDate().toISOString(),
                createdAt: (data.createdAt as any).toDate().toISOString(),
            } as Event;
        });
        return eventsData;
    } catch (error) {
        console.error("Error fetching events: ", error);
        return [];
    }
}

export default async function AdminEventsPage() {
    const initialEvents = await getEvents();

    return <EventsClientPage initialEvents={initialEvents} />;
}
