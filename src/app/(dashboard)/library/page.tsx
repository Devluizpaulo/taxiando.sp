
import { getAllBooks } from '@/app/actions/library-actions';
import { LibraryClientPage } from './library-client-page';
import { type LibraryBook } from '@/lib/types';
import { PageViewTracker } from "@/components/page-view-tracker";

export default async function LibraryPage() {
    const books: LibraryBook[] = await getAllBooks();
    return (
        <>
            <PageViewTracker page="library" />
            <LibraryClientPage initialBooks={books} />
        </>
    );
}
