
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

// Omitting id and createdAt, as they will be generated on the server.
// Using native Date for startDate/endDate as they come from the client form.
type CreateEventInput = Omit<Event, 'id' | 'createdAt' | 'startDate' | 'endDate'> & {
    startDate: Date;
    endDate: Date;
};


export async function createEventWithImageUpload(eventData: CreateEventInput) {
    try {
        const eventId = nanoid();
        let finalImageUrl = eventData.imageUrl;

        // Check if imageUrl is a Base64 data URI from the AI
        if (finalImageUrl && finalImageUrl.startsWith('data:image')) {
            const bucket = adminStorage.bucket();
            const filePath = `events/${eventId}.png`;
            const file = bucket.file(filePath);

            const match = finalImageUrl.match(/^data:(image\/[a-z]+);base64,(.*)$/);
            if (!match) {
                return { success: false, error: 'Formato de imagem Base64 inválido.' };
            }
            
            const contentType = match[1];
            const base64Data = match[2];
            const buffer = Buffer.from(base64Data, 'base64');

            // Upload the image buffer to the bucket
            await file.save(buffer, {
                metadata: {
                    contentType: contentType,
                },
                public: true, // Make the file publicly accessible
            });

            // Use the public URL for storage
            finalImageUrl = file.publicUrl();
        }

        const dataToSave = {
            ...eventData,
            id: eventId,
            imageUrl: finalImageUrl,
            startDate: Timestamp.fromDate(new Date(eventData.startDate)),
            endDate: Timestamp.fromDate(new Date(eventData.endDate)),
            createdAt: Timestamp.now(),
        };

        await adminDB.collection('events').doc(eventId).set(dataToSave);

        revalidatePath('/admin/events');
        return { success: true, eventId: eventId };

    } catch (error) {
        console.error("Error creating event with image upload:", error);
        return { success: false, error: (error as Error).message };
    }
}
