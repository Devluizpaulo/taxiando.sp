
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { deleteBlogPost } from '@/app/actions/blog-actions';

export function DeletePostButton({ postId, postTitle }: { postId: string; postTitle: string }) {
    const { toast } = useToast();

    const handleDelete = async () => {
        const result = await deleteBlogPost(postId);
        if (result.success) {
            toast({
                title: 'Post Removido!',
                description: `O post "${postTitle}" foi removido com sucesso.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro ao Remover',
                description: result.error,
            });
        }
    };
    
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive-foreground"
          onSelect={(e) => e.preventDefault()}
        >
          <Trash2 className="mr-2" /> Remover
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso irá remover permanentemente o post "{postTitle}" e todos os dados associados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Sim, remover post
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
