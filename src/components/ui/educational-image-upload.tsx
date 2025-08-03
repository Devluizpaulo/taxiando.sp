'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';
import { uploadEducationalImage } from '@/app/actions/educational-elements-actions';
import { useToast } from '@/hooks/use-toast';

interface EducationalImageUploadProps {
  courseId: string;
  elementType: string;
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
  description?: string;
  required?: boolean;
  maxSize?: number; // em MB
  allowedTypes?: string[];
}

export function EducationalImageUpload({
  courseId,
  elementType,
  onImageUploaded,
  currentImageUrl,
  label = "Imagem",
  description,
  required = false,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}: EducationalImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!allowedTypes.includes(file.type)) {
      setError(`Tipo de arquivo não suportado. Tipos permitidos: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validar tamanho
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Arquivo muito grande. Máximo ${maxSize}MB.`);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await uploadEducationalImage(file, elementType, courseId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.url) {
        onImageUploaded(result.url);
        setPreviewUrl(result.url);
        toast({
          title: "Upload realizado com sucesso!",
          description: "A imagem foi salva e está pronta para uso.",
        });
      } else {
        setError(result.error || 'Erro no upload');
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: result.error || "Não foi possível fazer o upload da imagem.",
        });
      }
    } catch (err) {
      setError('Erro interno no servidor');
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = `educational-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Preview da imagem atual */}
      {previewUrl && (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownload}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveImage}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Área de upload */}
      {!previewUrl && (
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Upload de Imagem</h3>
                <p className="text-sm text-muted-foreground">
                  Arraste uma imagem ou clique para selecionar
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {allowedTypes.map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type.split('/')[1].toUpperCase()}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs">
                  Máx {maxSize}MB
                </Badge>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Imagem
                  </>
                )}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barra de progresso */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Enviando imagem...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Mensagens de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mensagem de sucesso */}
      {previewUrl && !isUploading && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Imagem carregada com sucesso! Clique em "Salvar" para confirmar.
          </AlertDescription>
        </Alert>
      )}

      {/* Botão para trocar imagem */}
      {previewUrl && !isUploading && (
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Trocar Imagem
        </Button>
      )}
    </div>
  );
} 