
import { getAllBooks } from '@/app/actions/library-actions';
import { LibraryClientPage } from './library-client-page';
import { type LibraryBook } from '@/lib/types';


export default async function LibraryPage() {
    const books: LibraryBook[] = await getAllBooks();
    return <LibraryClientPage initialBooks={books} />;
}
