
'use server';

import { adminDB, adminStorage } from '@/lib/firebase-admin';
import { type Event } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';


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

// Omitting id, createdAt, imageUrl as they will be generated on the server or not used.
// Using native Date for startDate/endDate as they come from the client form.
type CreateEventInput = Omit<Event, 'id' | 'createdAt' | 'startDate' | 'endDate' | 'imageUrl'> & {
    startDate: Date;
    endDate: Date;
};


export async function createEvent(eventData: CreateEventInput) {
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
        return { success: true, eventId: eventId };

    } catch (error) {
        console.error("Error creating event:", error);
        return { success: false, error: (error as Error).message };
    }
}
