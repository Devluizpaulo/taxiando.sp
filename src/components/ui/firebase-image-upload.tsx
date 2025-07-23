import React, { useRef, useState } from 'react';
import { uploadImage, deleteImage } from '@/lib/firebase-storage';
import { Button } from './button';

interface FirebaseImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  pathPrefix?: string; // ex: 'avatars/'
  label?: string;
}

export const FirebaseImageUpload: React.FC<FirebaseImageUploadProps> = ({ value, onChange, pathPrefix = '', label = 'Enviar imagem' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Gera um nome único para o arquivo
      const ext = file.name.split('.').pop();
      const fileName = `${pathPrefix}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const url = await uploadImage(file, fileName);
      setPreview(url);
      onChange?.(url);
    } catch (err) {
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (preview) {
      try {
        // Remove do storage
        const path = preview.split('/o/')[1]?.split('?')[0].replace(/%2F/g, '/');
        if (path) await deleteImage(path);
      } catch {}
    }
    setPreview(undefined);
    onChange?.('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      {label && <label className="font-medium text-sm mb-1">{label}</label>}
      {preview ? (
        <div className="flex flex-col gap-2 items-start">
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded shadow" />
          <Button type="button" variant="destructive" onClick={handleRemove} disabled={uploading}>Remover</Button>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
            className="block"
          />
        </>
      )}
      {uploading && <span className="text-xs text-muted-foreground">Enviando imagem...</span>}
    </div>
  );
}; 