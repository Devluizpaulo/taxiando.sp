'use client';

import { useEffect, useState } from 'react';
import { useAuth, useAuthProtection } from '@/hooks/use-auth';
import { 
  getPendingDossierPurchases, 
  approveAndProcessDossier, 
  rejectDossier,
  getDossierPackages 
} from '@/app/actions/dossier-actions';
import type { DossierPurchase, DriverDossierPackage } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  Building, 
  DollarSign,
  AlertTriangle,
  Loader2
} from 'lucide-react';
// import { toast } from 'sonner';

export default function AdminDossiersPage() {
  const { user } = useAuth();
  const [pendingPurchases, setPendingPurchases] = useState<DossierPurchase[]>([]);
  const [packages, setPackages] = useState<DriverDossierPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPurchase, setProcessingPurchase] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<DossierPurchase | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useAuthProtection({ requiredRoles: ['admin'] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [purchasesData, packagesData] = await Promise.all([
        getPendingDossierPurchases(),
        getDossierPackages()
      ]);
      setPendingPurchases(purchasesData);
      setPackages(packagesData);
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (purchaseId: string) => {
    try {
      setProcessingPurchase(purchaseId);
      const result = await approveAndProcessDossier(purchaseId);
      
      if (result.success) {
        console.log('Dossiê aprovado e processado com sucesso!');
        await loadData(); // Recarregar dados
      } else {
        console.error(`Erro ao processar dossiê: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving dossier:', error);
      console.error('Erro ao aprovar dossiê');
    } finally {
      setProcessingPurchase(null);
    }
  };

  const handleReject = async () => {
    if (!selectedPurchase || !rejectionReason.trim()) {
      console.error('Por favor, informe o motivo da rejeição');
      return;
    }

    try {
      setProcessingPurchase(selectedPurchase.id);
      const result = await rejectDossier(selectedPurchase.id, rejectionReason);
      
      if (result.success) {
        console.log('Dossiê rejeitado com sucesso!');
        setRejectDialogOpen(false);
        setSelectedPurchase(null);
        setRejectionReason('');
        await loadData(); // Recarregar dados
      } else {
        console.error(`Erro ao rejeitar dossiê: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting dossier:', error);
      console.error('Erro ao rejeitar dossiê');
    } finally {
      setProcessingPurchase(null);
    }
  };

  const openRejectDialog = (purchase: DossierPurchase) => {
    setSelectedPurchase(purchase);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const getPackageName = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg?.name || 'Pacote não encontrado';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_admin_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Aguardando Revisão</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Loader2 className="w-3 h-3 mr-1" />Processando</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Concluído</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Falhou</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Dossiês</h1>
          <p className="text-muted-foreground">
            Aprove ou rejeite solicitações de dossiês de motoristas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {pendingPurchases.length} pendente{pendingPurchases.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <Separator />

      {pendingPurchases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dossiê pendente</h3>
            <p className="text-muted-foreground text-center">
              Todos os dossiês foram processados ou não há solicitações aguardando aprovação.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingPurchases.map((purchase) => (
            <Card key={purchase.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Dossiê - {getPackageName(purchase.packageId)}
                      </CardTitle>
                      <CardDescription>
                        Solicitado em {format(new Date(purchase.createdAt as string), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(purchase.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Motorista</p>
                      <p className="text-sm text-muted-foreground">ID: {purchase.driverId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Frota</p>
                      <p className="text-sm text-muted-foreground">ID: {purchase.fleetId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Valor</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {purchase.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(purchase.id)}
                    disabled={processingPurchase === purchase.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processingPurchase === purchase.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Aprovar e Processar
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => openRejectDialog(purchase)}
                    disabled={processingPurchase === purchase.id}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Rejeição */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Rejeitar Dossiê
            </DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Motivo da Rejeição *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Descreva o motivo da rejeição..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={processingPurchase === selectedPurchase?.id}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processingPurchase === selectedPurchase?.id}
              variant="destructive"
            >
              {processingPurchase === selectedPurchase?.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Rejeitar Dossiê
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 