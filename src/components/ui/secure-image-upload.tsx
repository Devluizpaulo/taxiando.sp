'use client';

import { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Switch } from './switch';
import { Upload, X, Image as ImageIcon, Loader2, Eye, EyeOff, Lock, Globe } from 'lucide-react';
import { uploadSecureImage } from '@/lib/supabase-storage-secure';
import { CONFIG } from '@/lib/config';
import Image from 'next/image';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Separator } from './separator';

interface SecureImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucketType: 'public' | 'private' | 'gallery';
  folder: string;
  ownerId: string;
  ownerName: string;
  category: string;
  maxImages?: number;
  disabled?: boolean;
  showVisibilityToggle?: boolean;
  defaultPublic?: boolean;
}

export function SecureImageUpload({
  value = [],
  onChange,
  bucketType,
  folder,
  ownerId,
  ownerName,
  category,
  maxImages = 5,
  disabled = false,
  showVisibilityToggle = true,
  defaultPublic = false
}: SecureImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [isPublic, setIsPublic] = useState(defaultPublic);
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
        
        const result = await uploadSecureImage(file, {
          bucketType,
          folder,
          ownerId,
          ownerName,
          category,
          isPublic,
          name: file.name
        });
        
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

  const handleRemoveImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleManualUrlAdd = (url: string) => {
    if (url.trim() && !value.includes(url)) {
      onChange([...value, url.trim()]);
    }
  };

  const getBucketInfo = () => {
    const bucketConfig = {
      public: { bucket: CONFIG.supabase.buckets.public, access: 'public' },
      private: { bucket: CONFIG.supabase.buckets.private, access: 'private' },
      gallery: { bucket: CONFIG.supabase.buckets.gallery, access: 'mixed' }
    }[bucketType];
    
    const uploadConfig = CONFIG.upload;
          return {
        name: bucketConfig.bucket,
        description: `${bucketConfig.access === 'public' ? 'Público' : bucketConfig.access === 'private' ? 'Privado' : 'Configurável'}`,
        maxSize: uploadConfig.maxFileSize / 1024 / 1024,
        allowedTypes: uploadConfig.allowedTypes
      };
  };

  const bucketInfo = getBucketInfo();

  return (
    <div className="space-y-6">
      {/* Informações do Bucket */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {isPublic ? <Globe className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-orange-600" />}
            {bucketInfo.name}
          </CardTitle>
          <CardDescription className="text-xs">
            {bucketInfo.description} • Máx: {bucketInfo.maxSize}MB
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isPublic ? "default" : "secondary"}>
                {isPublic ? "Público" : "Privado"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {value.length}/{maxImages} imagens
              </span>
            </div>
            
            {showVisibilityToggle && (
              <div className="flex items-center gap-2">
                <Label htmlFor="visibility-toggle" className="text-xs">Público</Label>
                <Switch
                  id="visibility-toggle"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  disabled={disabled || isUploading}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload de arquivos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept={bucketInfo.allowedTypes.join(',')}
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
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
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
      </div>

      {/* Preview das imagens */}
      {value.length > 0 && (
        <div className="space-y-4">
          <Separator />
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
                <div className="absolute top-1 right-1 flex gap-1">
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Badge>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem de ajuda */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Formatos aceitos: {bucketInfo.allowedTypes.map((t: string) => t.split('/')[1].toUpperCase()).join(', ')}</p>
        <p>• Tamanho máximo: {bucketInfo.maxSize}MB por imagem</p>
        <p>• {isPublic ? 'Imagens públicas são acessíveis a todos' : 'Imagens privadas são acessíveis apenas a você'}</p>
        <p>• Você pode fazer upload de arquivos ou adicionar URLs</p>
      </div>
    </div>
  );
} 