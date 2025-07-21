'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Switch } from './switch';
import { Upload, X, Image as ImageIcon, Loader2, Eye, EyeOff, Lock, Globe, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { uploadSecureImage } from '@/lib/supabase-storage-secure';
import { CONFIG } from '@/lib/config';
import { canUserUpload } from '@/app/actions/secure-storage-actions';
import Image from 'next/image';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Separator } from './separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from './progress';

interface CreditAwareImageUploadProps {
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
  isAdmin?: boolean;
}

export function CreditAwareImageUpload({
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
  defaultPublic = false,
  isAdmin = false
}: CreditAwareImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [isPublic, setIsPublic] = useState(defaultPublic);
  const [creditInfo, setCreditInfo] = useState<{
    canUpload: boolean;
    creditsRequired: number;
    currentCredits: number;
    freeLimit: number;
    currentCount: number;
  } | null>(null);
  const [uploadResults, setUploadResults] = useState<Array<{
    success: boolean;
    url?: string;
    error?: string;
    creditsUsed?: number;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buscar informações de créditos
  useEffect(() => {
    if (!isAdmin && ownerId) {
      canUserUpload(ownerId, category, bucketType).then(setCreditInfo);
    }
  }, [ownerId, category, bucketType, isAdmin]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (value.length + files.length > maxImages) {
      alert(`Você pode fazer upload de no máximo ${maxImages} imagens.`);
      return;
    }

    // Verificar créditos antes do upload
    if (!isAdmin && creditInfo && !creditInfo.canUpload) {
      alert(`Créditos insuficientes. Você tem ${creditInfo.currentCredits} créditos, mas precisa de ${creditInfo.creditsRequired}.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress('Iniciando upload...');
    setUploadResults([]);

    try {
      const newUrls: string[] = [];
      const results: typeof uploadResults = [];
      
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
          name: file.name,
          isAdmin
        });
        
        results.push(result);
        
        if (result.success && result.url) {
          newUrls.push(result.url);
        }
      }

      setUploadResults(results);
      onChange([...value, ...newUrls]);
      setUploadProgress('Upload concluído!');
      
      // Atualizar informações de créditos
      if (!isAdmin) {
        canUserUpload(ownerId, category, bucketType).then(setCreditInfo);
      }
      
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
    const creditConfig = CONFIG.credits.limits[category as keyof typeof CONFIG.credits.limits];
          return {
        name: bucketConfig.bucket,
        description: `${bucketConfig.access === 'public' ? 'Público' : bucketConfig.access === 'private' ? 'Privado' : 'Configurável'}`,
        maxSize: uploadConfig.maxFileSize / 1024 / 1024,
        allowedTypes: uploadConfig.allowedTypes,
        creditsRequired: creditConfig?.cost || 0
      };
  };

  const bucketInfo = getBucketInfo();
  const freeLimit = CONFIG.credits.limits[category as keyof typeof CONFIG.credits.limits]?.free || 0;
  const isWithinFreeLimit = creditInfo ? creditInfo.currentCount < creditInfo.freeLimit : true;
  const willUseCredits = !isAdmin && !isWithinFreeLimit;

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

      {/* Informações de Créditos */}
      {!isAdmin && creditInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4" />
              Informações de Créditos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Créditos atuais:</span>
              <Badge variant="outline">{creditInfo.currentCredits}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Imagens nesta categoria:</span>
              <Badge variant="outline">{creditInfo.currentCount}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Limite gratuito:</span>
              <Badge variant="outline">{creditInfo.freeLimit}</Badge>
            </div>

            {willUseCredits && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Créditos necessários:</span>
                <Badge variant="destructive">{creditInfo.creditsRequired}</Badge>
              </div>
            )}

            {/* Status do upload */}
            <div className="flex items-center gap-2">
              {creditInfo.canUpload ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">
                {creditInfo.canUpload 
                  ? (isWithinFreeLimit ? 'Upload gratuito disponível' : 'Créditos suficientes')
                  : 'Créditos insuficientes para upload'
                }
              </span>
            </div>

            {/* Progresso do uso gratuito */}
            {freeLimit > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Uso gratuito</span>
                  <span>{creditInfo.currentCount}/{creditInfo.freeLimit}</span>
                </div>
                <Progress 
                  value={(creditInfo.currentCount / creditInfo.freeLimit) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload de arquivos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept={bucketInfo.allowedTypes.join(',')}
            multiple
            onChange={handleFileSelect}
            disabled={disabled || isUploading || value.length >= maxImages || (!isAdmin && creditInfo && !creditInfo.canUpload) || false}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading || value.length >= maxImages || (!isAdmin && creditInfo && !creditInfo.canUpload) || false}
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
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>{uploadProgress}</AlertDescription>
          </Alert>
        )}

        {/* Resultados do upload */}
        {uploadResults.length > 0 && (
          <div className="space-y-2">
            {uploadResults.map((result, index) => (
              <Alert key={index} variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {result.success 
                    ? `Upload bem-sucedido${result.creditsUsed ? ` (${result.creditsUsed} crédito${result.creditsUsed > 1 ? 's' : ''} usado${result.creditsUsed > 1 ? 's' : ''})` : ''}`
                    : result.error
                  }
                </AlertDescription>
              </Alert>
            ))}
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
        {!isAdmin && (
          <>
            <p>• Limite gratuito: {freeLimit} imagem{freeLimit !== 1 ? 's' : ''} por categoria</p>
            <p>• Créditos necessários após limite: {bucketInfo.creditsRequired} por imagem</p>
          </>
        )}
        <p>• Você pode fazer upload de arquivos ou adicionar URLs</p>
      </div>
    </div>
  );
} 