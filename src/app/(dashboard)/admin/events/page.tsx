
import { adminDB } from '@/lib/firebase-admin';
import { type Event } from '@/lib/types';
import EventsClientPage from './client-page';
import { Timestamp } from 'firebase-admin/firestore';

// This is a React Server Component (RSC)
// It fetches data on the server and passes it to a Client Component.
async function getEvents(): Promise<Event[]> {
    try {
        const eventsCollection = adminDB.collection('events');
        const q = eventsCollection.orderBy('startDate', 'desc');
        const querySnapshot = await q.get();
        
        // Important: Convert Firestore Timestamps to serializable format (ISO string) for the client
        const eventsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Using Firebase Admin SDK Timestamp
            const startDate = (data.startDate as Timestamp)?.toDate();
            const endDate = (data.endDate as Timestamp)?.toDate();
            const createdAt = (data.createdAt as Timestamp)?.toDate();

            return {
                ...data,
                id: doc.id,
                // Ensure dates exist before converting
                startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
                endDate: endDate ? endDate.toISOString() : new Date().toISOString(),
                createdAt: createdAt ? createdAt.toISOString() : new Date().toISOString(),
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
