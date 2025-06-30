
'use server';

import { adminDB } from '@/lib/firebase-admin';
import { type Event } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { startOfToday, addDays } from 'date-fns';


export async function getAdminEvents(): Promise<Event[]> {
    try {
        const eventsCollection = adminDB.collection('events');
        const q = eventsCollection.orderBy('startDate', 'desc');
        const querySnapshot = await q.get();
        
        const eventsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const startDate = (data.startDate as Timestamp)?.toDate();
            const endDate = (data.endDate as Timestamp)?.toDate();
            const createdAt = (data.createdAt as Timestamp)?.toDate();

            return {
                ...data,
                id: doc.id,
                startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
                endDate: endDate ? endDate.toISOString() : new Date().toISOString(),
                createdAt: createdAt ? createdAt.toISOString() : new Date().toISOString(),
            } as Event;
        });
        return eventsData;
    } catch (error) {
        console.error("Error fetching events from action: ", error);
        return [];
    }
}

export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const today = startOfToday();
    const nextSevenDays = addDays(today, 7);

    const eventsCollection = adminDB.collection('events');
    const q = eventsCollection
      .where('startDate', '>=', Timestamp.fromDate(today))
      .where('startDate', '<', Timestamp.fromDate(nextSevenDays))
      .orderBy('startDate', 'asc')
      .limit(20);

    const querySnapshot = await q.get();
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const startDate = (data.startDate as Timestamp)?.toDate();
        const endDate = (data.endDate as Timestamp)?.toDate();
        return { 
            id: doc.id,
            ...data,
            startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
            endDate: endDate ? endDate.toISOString() : new Date().toISOString(),
        } as Event;
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching upcoming events: ", errorMessage);
    return [];
  }
}

// Using native Date for startDate/endDate as they come from the client form.
type EventFormInput = Omit<Event, 'id' | 'createdAt' | 'startDate' | 'endDate'> & {
    startDate: Date;
    endDate: Date;
};


export async function createEvent(eventData: EventFormInput) {
    try {
        const eventId = nanoid();

        const dataToSave = {
            ...eventData,
            id: eventId,
            startDate: Timestamp.fromDate(new Date(eventData.startDate)),
            endDate: Timestamp.fromDate(new Date(eventData.endDate)),
            createdAt: Timestamp.now(),
        };

        await adminDB.collection('events').doc(eventId).set(dataToSave);

        revalidatePath('/admin/events');
        revalidatePath('/'); // Revalidate home page to show new event
        return { success: true, eventId: eventId };

    } catch (error) {
        console.error("Error creating event:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getEventById(eventId: string): Promise<Event | null> {
    try {
        const eventDoc = await adminDB.collection('events').doc(eventId).get();
        if (!eventDoc.exists) {
            return null;
        }
        const data = eventDoc.data()!;
        
        return {
            ...data,
            id: eventDoc.id,
            startDate: (data.startDate as Timestamp).toDate().toISOString(),
            endDate: (data.endDate as Timestamp).toDate().toISOString(),
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        } as Event;

    } catch (error) {
        console.error("Error fetching event by ID:", error);
        return null;
    }
}

export async function updateEvent(eventId: string, eventData: EventFormInput) {
    try {
        const dataToSave = {
            ...eventData,
            startDate: Timestamp.fromDate(new Date(eventData.startDate)),
            endDate: Timestamp.fromDate(new Date(eventData.endDate)),
        };

        await adminDB.collection('events').doc(eventId).update(dataToSave);
        
        revalidatePath('/admin/events');
        revalidatePath(`/admin/events/${eventId}/edit`);
        revalidatePath('/'); // Revalidate home page
        revalidatePath('/events'); // Revalidate events page
        return { success: true };

    } catch (error) {
        console.error("Error updating event:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteEvent(eventId: string) {
     try {
        await adminDB.collection('events').doc(eventId).delete();
        
        revalidatePath('/admin/events');
        revalidatePath('/'); // Revalidate home page
        revalidatePath('/events'); // Revalidate events page
        return { success: true };

    } catch (error) {
        console.error("Error deleting event:", error);
        return { success: false, error: (error as Error).message };
    }
}
