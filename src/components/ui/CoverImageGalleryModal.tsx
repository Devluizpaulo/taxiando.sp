import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './dialog';
import { Button } from './button';
import { FirebaseImageUpload } from './firebase-image-upload';
import { listImagesInFolder } from '@/lib/firebase-storage';

interface CoverImageGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export const CoverImageGalleryModal: React.FC<CoverImageGalleryModalProps> = ({ open, onOpenChange, onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      listImagesInFolder('covers/').then(urls => {
        setImages(urls);
        setLoading(false);
      });
    }
  }, [open]);

  const handleUpload = (url: string) => {
    if (url) {
      setImages([url, ...images]);
      setSelected(url);
      setShowUpload(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escolha uma imagem da biblioteca</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4 mb-4">
          <Button type="button" variant="outline" onClick={() => setShowUpload((v) => !v)}>
            Fazer upload
          </Button>
          {showUpload && (
            <FirebaseImageUpload
              pathPrefix="covers/"
              onChange={handleUpload}
              label=""
            />
          )}
        </div>
        {loading ? (
          <div className="text-center py-8">Carregando imagens...</div>
        ) : (
          <div className="grid grid-cols-3 gap-4 py-4">
            {images.map((url) => (
              <button
                key={url}
                type="button"
                className={`rounded-lg border-2 ${selected === url ? 'border-blue-600' : 'border-transparent'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                onClick={() => setSelected(url)}
              >
                <img src={url} alt="Capa" className="w-full h-28 object-cover rounded-lg" />
              </button>
            ))}
            {images.length === 0 && !loading && (
              <div className="col-span-3 text-center text-muted-foreground">Nenhuma imagem encontrada.</div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => selected && onSelect(selected)} disabled={!selected}>
            Selecionar imagem
          </Button>
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 