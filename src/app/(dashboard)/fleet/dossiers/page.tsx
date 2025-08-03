'use client';

import { useEffect, useState } from 'react';
import { useAuth, useAuthProtection } from '@/hooks/use-auth';
import { getFleetDossiers, getDriverDossier } from '@/app/actions/dossier-actions';
import type { DriverDossier } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Eye, Calendar, Shield, TrendingUp, TrendingDown, 
  CheckCircle, XCircle, AlertTriangle, MapPin, Phone, Mail,
  CreditCard, Building, Users, Star, Clock, Download,
  Loader2, Search, Filter
} from 'lucide-react';
import { LoadingScreen } from '@/components/loading-screen';

export default function FleetDossiersPage() {
  const { user, userProfile, loading } = useAuthProtection({ requiredRoles: ['fleet', 'admin'] });
  const [dossiers, setDossiers] = useState<DriverDossier[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState<DriverDossier | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');

  useEffect(() => {
    if (user) {
      loadDossiers();
    }
  }, [user]);

  const loadDossiers = async () => {
    if (!user) return;
    
    setPageLoading(true);
    try {
      const dossiersData = await getFleetDossiers(user.uid);
      setDossiers(dossiersData);
    } catch (error) {
      console.error('Error loading dossiers:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleViewDossier = async (dossierId: string) => {
    try {
      const dossier = await getDriverDossier(dossierId);
      if (dossier) {
        setSelectedDossier(dossier);
        setIsDossierModalOpen(true);
      }
    } catch (error) {
      console.error('Error loading dossier:', error);
    }
  };

  const filteredDossiers = dossiers.filter(dossier => {
    const matchesSearch = dossier.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dossier.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || dossier.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'processing': return 'Processando';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading || pageLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Dossiês dos Motoristas</h1>
        <p className="text-muted-foreground">
          Visualize todos os dossiês completos que você comprou para análise detalhada dos motoristas.
        </p>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por motorista ou pacote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                Concluídos
              </Button>
              <Button
                variant={filterStatus === 'processing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('processing')}
              >
                Processando
              </Button>
              <Button
                variant={filterStatus === 'failed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('failed')}
              >
                Falharam
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Dossiês */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDossiers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dossiê encontrado</h3>
            <p className="text-gray-500">
              {dossiers.length === 0 
                ? 'Você ainda não comprou nenhum dossiê. Vá até a página de candidaturas para comprar seu primeiro dossiê.'
                : 'Nenhum dossiê corresponde aos filtros aplicados.'
              }
            </p>
          </div>
        ) : (
          filteredDossiers.map((dossier) => (
            <Card key={dossier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{dossier.driverName}</CardTitle>
                  </div>
                  <Badge variant={getStatusVariant(dossier.status)}>
                    {getStatusDisplayName(dossier.status)}
                  </Badge>
                </div>
                <CardDescription>
                  {dossier.packageName} • R$ {dossier.price.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Comprado em:</span>
                  <span>{format(new Date(dossier.createdAt as string), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
                
                {dossier.riskAssessment && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Score de Risco:</span>
                      <span className="font-medium">{dossier.riskAssessment.overallScore}/100</span>
                    </div>
                    <Progress value={dossier.riskAssessment.overallScore} className="h-2" />
                    <Badge className={getRiskLevelColor(dossier.riskAssessment.riskLevel)}>
                      Risco {dossier.riskAssessment.riskLevel === 'low' ? 'Baixo' : 
                             dossier.riskAssessment.riskLevel === 'medium' ? 'Médio' : 'Alto'}
                    </Badge>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDossier(dossier.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Dossiê
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Visualização do Dossiê */}
      <Dialog open={isDossierModalOpen} onOpenChange={setIsDossierModalOpen}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Dossiê Completo - {selectedDossier?.driverName}
            </DialogTitle>
            <DialogDescription>
              Análise detalhada do motorista com informações financeiras, documentação e avaliação de risco.
            </DialogDescription>
          </DialogHeader>

          {selectedDossier && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="financial">Financeiro</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="work">Trabalho</TabsTrigger>
                <TabsTrigger value="risk">Risco</TabsTrigger>
                <TabsTrigger value="report">Relatório</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <DossierOverviewSection dossier={selectedDossier} />
              </TabsContent>

              <TabsContent value="financial" className="space-y-6">
                <DossierFinancialSection dossier={selectedDossier} />
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <DossierDocumentsSection dossier={selectedDossier} />
              </TabsContent>

              <TabsContent value="work" className="space-y-6">
                <DossierWorkSection dossier={selectedDossier} />
              </TabsContent>

              <TabsContent value="risk" className="space-y-6">
                <DossierRiskSection dossier={selectedDossier} />
              </TabsContent>

              <TabsContent value="report" className="space-y-6">
                <DossierReportSection dossier={selectedDossier} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componentes das seções do dossiê
function DossierOverviewSection({ dossier }: { dossier: DriverDossier }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Nome:</span>
              <span>{dossier.basicProfile.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Email:</span>
              <span>{dossier.basicProfile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Telefone:</span>
              <span>{dossier.basicProfile.phone}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="font-medium">CPF:</span>
              <span>{dossier.basicProfile.cpf}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Endereço:</span>
              <span>{dossier.basicProfile.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Cidade:</span>
              <span>{dossier.basicProfile.city}, {dossier.basicProfile.state}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {dossier.riskAssessment && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliação de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Score Geral</span>
                <div className="text-2xl font-bold text-blue-600">
                  {dossier.riskAssessment.overallScore}/100
                </div>
              </div>
              <Progress value={dossier.riskAssessment.overallScore} className="h-3" />
              <Badge className={`text-sm ${getRiskLevelColor(dossier.riskAssessment.riskLevel)}`}>
                Risco {dossier.riskAssessment.riskLevel === 'low' ? 'Baixo' : 
                       dossier.riskAssessment.riskLevel === 'medium' ? 'Médio' : 'Alto'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DossierFinancialSection({ dossier }: { dossier: DriverDossier }) {
  if (!dossier.financialAnalysis) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <CreditCard className="h-12 w-12 mx-auto mb-4" />
          <p>Análise financeira não disponível neste pacote.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise Financeira</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dossier.financialAnalysis.creditScore}</div>
              <div className="text-sm text-gray-600">Score de Crédito</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                R$ {dossier.financialAnalysis.creditLimit.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Limite de Crédito</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                R$ {dossier.financialAnalysis.outstandingDebts.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Dívidas Pendentes</div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Histórico de Pagamentos</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No prazo: {dossier.financialAnalysis.paymentHistory.onTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Atrasados: {dossier.financialAnalysis.paymentHistory.late}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Inadimplentes: {dossier.financialAnalysis.paymentHistory.defaulted}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Fontes de Renda</h4>
            <div className="space-y-2">
              {dossier.financialAnalysis.incomeSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{source.type}</div>
                    <div className="text-sm text-gray-600">
                      {source.frequency === 'monthly' ? 'Mensal' : 
                       source.frequency === 'weekly' ? 'Semanal' : 'Diário'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">R$ {source.amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">
                      {source.verified ? 'Verificado' : 'Não verificado'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {dossier.serasaCheck && (
        <Card>
          <CardHeader>
            <CardTitle>Verificação Serasa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={dossier.serasaCheck.hasRestrictions ? 'destructive' : 'default'}>
                  {dossier.serasaCheck.hasRestrictions ? 'Com Restrições' : 'Sem Restrições'}
                </Badge>
              </div>
              {dossier.serasaCheck.hasRestrictions && (
                <div className="space-y-2">
                  <div>Total de dívidas: R$ {dossier.serasaCheck.totalDebt.toLocaleString()}</div>
                  <div>Número de restrições: {dossier.serasaCheck.restrictionCount}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DossierDocumentsSection({ dossier }: { dossier: DriverDossier }) {
  if (!dossier.documentVerification) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <p>Verificação de documentos não disponível neste pacote.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verificação de Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">CNH</span>
                <Badge variant={dossier.documentVerification.cnh.valid ? 'default' : 'destructive'}>
                  {dossier.documentVerification.cnh.status === 'valid' ? 'Válida' : 'Inválida'}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Número: {dossier.documentVerification.cnh.number}</div>
                <div>Categoria: {dossier.documentVerification.cnh.category}</div>
                <div>Pontos: {dossier.documentVerification.cnh.points}</div>
                <div>Expira: {dossier.documentVerification.cnh.expiration}</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Condutax</span>
                <Badge variant={dossier.documentVerification.condutax.valid ? 'default' : 'destructive'}>
                  {dossier.documentVerification.condutax.status === 'valid' ? 'Válido' : 'Inválido'}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Número: {dossier.documentVerification.condutax.number}</div>
                <div>Expira: {dossier.documentVerification.condutax.expiration}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DossierWorkSection({ dossier }: { dossier: DriverDossier }) {
  if (!dossier.workHistory) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <Building className="h-12 w-12 mx-auto mb-4" />
          <p>Histórico de trabalho não disponível neste pacote.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Trabalho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Trabalho Atual</h4>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Empresa:</span> {dossier.workHistory.currentJob.company}</div>
              <div><span className="font-medium">Cargo:</span> {dossier.workHistory.currentJob.position}</div>
              <div><span className="font-medium">Desde:</span> {dossier.workHistory.currentJob.startDate}</div>
              <div><span className="font-medium">Salário:</span> R$ {dossier.workHistory.currentJob.salary.toLocaleString()}</div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Empregos Anteriores</h4>
            <div className="space-y-3">
              {dossier.workHistory.previousJobs.map((job, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{job.company}</span>
                    <span className="text-sm text-gray-600">{job.startDate} - {job.endDate}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Cargo: {job.position}</div>
                    <div>Motivo da saída: {job.reason}</div>
                    <div>Referência: {job.reference}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{dossier.workHistory.totalExperience}</div>
              <div className="text-sm text-gray-600">Anos de Experiência</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dossier.workHistory.stabilityScore}/10</div>
              <div className="text-sm text-gray-600">Score de Estabilidade</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DossierRiskSection({ dossier }: { dossier: DriverDossier }) {
  if (!dossier.riskAssessment) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <Shield className="h-12 w-12 mx-auto mb-4" />
          <p>Avaliação de risco não disponível neste pacote.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Avaliação de Risco</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {dossier.riskAssessment.overallScore}/100
            </div>
            <Progress value={dossier.riskAssessment.overallScore} className="h-3 mb-4" />
            <Badge className={`text-lg ${getRiskLevelColor(dossier.riskAssessment.riskLevel)}`}>
              Risco {dossier.riskAssessment.riskLevel === 'low' ? 'Baixo' : 
                     dossier.riskAssessment.riskLevel === 'medium' ? 'Médio' : 'Alto'}
            </Badge>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Fatores de Risco</h4>
            <div className="space-y-3">
              {dossier.riskAssessment.factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{factor.factor}</div>
                    <div className="text-sm text-gray-600">{factor.description}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={factor.impact === 'positive' ? 'default' : 
                                   factor.impact === 'negative' ? 'destructive' : 'secondary'}>
                      {factor.impact === 'positive' ? 'Positivo' : 
                       factor.impact === 'negative' ? 'Negativo' : 'Neutro'}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">Peso: {factor.weight}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Recomendações</h4>
            <div className="space-y-2">
              {dossier.riskAssessment.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="font-medium mb-2">Risco para Seguro</div>
            <Badge className={`text-lg ${getRiskLevelColor(dossier.riskAssessment.insuranceRisk)}`}>
              {dossier.riskAssessment.insuranceRisk === 'low' ? 'Baixo' : 
               dossier.riskAssessment.insuranceRisk === 'medium' ? 'Médio' : 'Alto'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DossierReportSection({ dossier }: { dossier: DriverDossier }) {
  if (!dossier.comprehensiveReport) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <p>Relatório abrangente não disponível neste pacote.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relatório Abrangente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Resumo Executivo</h4>
            <p className="text-gray-700">{dossier.comprehensiveReport.summary}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-700">Pontos Positivos</h4>
              <div className="space-y-2">
                {dossier.comprehensiveReport.greenFlags.map((flag, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{flag}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-red-700">Pontos de Atenção</h4>
              <div className="space-y-2">
                {dossier.comprehensiveReport.redFlags.map((flag, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Principais Descobertas</h4>
            <div className="space-y-2">
              {dossier.comprehensiveReport.keyFindings.map((finding, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Star className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm">{finding}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Recomendações</h4>
            <div className="space-y-2">
              {dossier.comprehensiveReport.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Conclusão</h4>
            <p className="text-gray-700">{dossier.comprehensiveReport.conclusion}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Gerado em: {format(new Date(dossier.comprehensiveReport.generatedAt as string), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                <span>Válido até: {format(new Date(dossier.comprehensiveReport.validUntil as string), 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getRiskLevelColor(level: string) {
  switch (level) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
} 