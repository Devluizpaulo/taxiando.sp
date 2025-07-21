
import { getAllCourses } from '@/app/actions/course-actions';
import { CoursesAnalyticsClientPage } from './analytics-client-page';
import { type Course } from '@/lib/types';

export default async function AdminCoursesAnalyticsPage() {
    const courses: Course[] = await getAllCourses();
    
    return <CoursesAnalyticsClientPage initialCourses={courses} />;
}
