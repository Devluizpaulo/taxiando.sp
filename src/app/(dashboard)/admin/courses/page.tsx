
import { getAllCourses } from '@/app/actions/course-actions';
import { CoursesClientPage } from './courses-client-page';
import { type Course } from '@/lib/types';

// This is now a Server Component that fetches data and passes it to the client component.
export default async function AdminCoursesPage() {
    const courses: Course[] = await getAllCourses();

    return <CoursesClientPage initialCourses={courses} />;
}
