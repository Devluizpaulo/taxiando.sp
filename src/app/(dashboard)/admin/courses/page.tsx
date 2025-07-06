
import { getAllCourses } from '@/app/actions/course-actions';
import { CoursesClientPage } from './courses-client-page';
import { type Course } from '@/lib/types';

export default async function AdminCoursesPage() {
    // Fetch data on the server
    const initialCourses: Course[] = await getAllCourses();
    
    // Pass data to the client component as a prop
    return <CoursesClientPage initialCourses={initialCourses} />;
}
