
import { BookForm } from '../book-form';

export default function CreateBookPage() {
    return (
        <div className="flex flex-col gap-8">
             <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Adicionar Novo Livro</h1>
                <p className="text-muted-foreground">Preencha os detalhes do livro para adicioná-lo à biblioteca.</p>
            </div>
            <BookForm />
        </div>
    );
}
