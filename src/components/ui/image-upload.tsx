'use client';

import { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage, deleteImage } from '@/lib/supabase-storage';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  bucket?: string;
  folder?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  bucket = 'images',
  folder = 'city-tips',
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (value.length + files.length > maxImages) {
      alert(`Você pode fazer upload de no máximo ${maxImages} imagens.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress('Iniciando upload...');

    try {
      const newUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Fazendo upload de ${file.name}...`);
        
        const result = await uploadImage(file, bucket, folder);
        
        if (result.success && result.url) {
          newUrls.push(result.url);
        } else {
          console.error('Erro no upload:', result.error);
          alert(`Erro ao fazer upload de ${file.name}: ${result.error}`);
        }
      }

      onChange([...value, ...newUrls]);
      setUploadProgress('Upload concluído!');
      
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload das imagens.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleRemoveImage = async (index: number) => {
    const urlToRemove = value[index];
    const newUrls = value.filter((_, i) => i !== index);
    
    // Tentar deletar do Supabase se for uma URL do Supabase
    if (urlToRemove.includes('supabase.co')) {
      try {
        await deleteImage(urlToRemove, bucket);
      } catch (error) {
        console.error('Erro ao deletar imagem:', error);
      }
    }
    
    onChange(newUrls);
  };

  const handleManualUrlAdd = (url: string) => {
    if (url.trim() && !value.includes(url)) {
      onChange([...value, url.trim()]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label>Imagens</Label>
        <span className="text-sm text-muted-foreground">
          ({value.length}/{maxImages})
        </span>
      </div>

      {/* Upload de arquivos */}
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || isUploading || value.length >= maxImages}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading || value.length >= maxImages}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Progresso do upload */}
      {isUploading && uploadProgress && (
        <div className="text-sm text-muted-foreground">
          {uploadProgress}
        </div>
      )}

      {/* Adicionar URL manualmente */}
      <div className="flex items-center gap-2">
        <Input
          type="url"
          placeholder="Ou adicione uma URL de imagem"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleManualUrlAdd((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            }
          }}
          disabled={disabled || value.length >= maxImages}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const input = document.querySelector('input[type="url"]') as HTMLInputElement;
            if (input) {
              handleManualUrlAdd(input.value);
              input.value = '';
            }
          }}
          disabled={disabled || value.length >= maxImages}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview das imagens */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border">
                <Image
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Mensagem de ajuda */}
      <div className="text-sm text-muted-foreground">
        <p>• Formatos aceitos: JPG, PNG, GIF, WebP</p>
        <p>• Tamanho máximo: 5MB por imagem</p>
        <p>• Você pode fazer upload de arquivos ou adicionar URLs</p>
      </div>
    </div>
  );
} 