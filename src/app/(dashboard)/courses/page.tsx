
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Course } from '@/lib/types';
import { CoursesList } from './courses-list';

async function getCourses(): Promise<Course[]> {
    try {
        const coursesCollection = collection(db, 'courses');
        const q = query(coursesCollection, where('status', '==', 'Published'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        return coursesData;
    } catch (error) {
        console.error("Error fetching courses: ", error);
        return [];
    }
}

export default async function CoursesPage() {
    const courses = await getCourses();
    return <CoursesList courses={courses} />;
}
