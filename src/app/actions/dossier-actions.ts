'use server';

import { adminDB } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { 
  DriverDossierPackage, 
  DriverDossier, 
  DossierPurchase,
  UserProfile,
  VehicleApplication,
  DossierFeature
} from '@/lib/types';

// ===== PACOTES DE DOSSIÊ =====

export async function canUserPurchaseDossierPackage(
  driverId: string, 
  packageId: string
): Promise<{ canPurchase: boolean; error?: string; requiresConsent?: boolean }> {
  try {
    // Verificar se o motorista existe
    const driverSnap = await adminDB.collection('users').doc(driverId).get();
    if (!driverSnap.exists) {
      return { canPurchase: false, error: 'Motorista não encontrado' };
    }

    const driver = driverSnap.data() as UserProfile;
    
    // Buscar o pacote
    const packageSnap = await adminDB.collection('dossier_packages').doc(packageId).get();
    if (!packageSnap.exists) {
      return { canPurchase: false, error: 'Pacote não encontrado' };
    }

    const packageData = packageSnap.data() as DriverDossierPackage;
    
    // Verificar se o pacote requer análise financeira
    const requiresFinancialAnalysis = packageData.features.includes('financial_analysis') || 
                                     packageData.features.includes('serasa_check') ||
                                     packageData.features.includes('credit_score') ||
                                     packageData.features.includes('income_verification');
    
    if (requiresFinancialAnalysis && !driver.financialConsent) {
      return { 
        canPurchase: false, 
        error: 'Este pacote requer autorização financeira. O motorista deve concordar com a análise financeira em seu perfil.',
        requiresConsent: true
      };
    }

    return { canPurchase: true };
  } catch (error) {
    console.error('Error checking dossier purchase eligibility:', error);
    return { canPurchase: false, error: (error as Error).message };
  }
}

export async function getDossierPackages(): Promise<DriverDossierPackage[]> {
  try {
    const packagesSnap = await adminDB.collection('dossier_packages')
      .where('isActive', '==', true)
      .orderBy('price', 'asc')
      .get();

    return packagesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DriverDossierPackage[];
  } catch (error) {
    console.error('Error fetching dossier packages:', error);
    return [];
  }
}

export async function createDossierPackage(packageData: Omit<DriverDossierPackage, 'id' | 'createdAt'>): Promise<{ success: boolean; packageId?: string; error?: string }> {
  try {
    const docRef = await adminDB.collection('dossier_packages').add({
      ...packageData,
      createdAt: Timestamp.now(),
      isActive: true
    });

    return { success: true, packageId: docRef.id };
  } catch (error) {
    console.error('Error creating dossier package:', error);
    return { success: false, error: (error as Error).message };
  }
}

// ===== COMPRA DE DOSSIÊ =====

export async function createDossierPurchase(
  fleetId: string, 
  driverId: string, 
  packageId: string,
  price: number
): Promise<{ success: boolean; purchaseId?: string; error?: string }> {
  try {
    // Verificar se o motorista existe e tem autorização financeira
    const driverSnap = await adminDB.collection('users').doc(driverId).get();
    if (!driverSnap.exists) {
      return { success: false, error: 'Motorista não encontrado' };
    }

    const driver = driverSnap.data() as UserProfile;
    
    // Buscar o pacote para verificar se requer análise financeira
    const packageSnap = await adminDB.collection('dossier_packages').doc(packageId).get();
    if (!packageSnap.exists) {
      return { success: false, error: 'Pacote não encontrado' };
    }

    const packageData = packageSnap.data() as DriverDossierPackage;
    
    // Verificar se o pacote requer análise financeira
    const requiresFinancialAnalysis = packageData.features.includes('financial_analysis') || 
                                     packageData.features.includes('serasa_check') ||
                                     packageData.features.includes('credit_score') ||
                                     packageData.features.includes('income_verification');
    
    if (requiresFinancialAnalysis && !driver.financialConsent) {
      return { 
        success: false, 
        error: 'Este pacote de dossiê requer autorização financeira. O motorista deve concordar com a análise financeira em seu perfil antes de prosseguir.' 
      };
    }

    const purchaseRef = await adminDB.collection('dossier_purchases').add({
      fleetId,
      driverId,
      packageId,
      status: 'pending',
      price,
      createdAt: Timestamp.now()
    });

    return { success: true, purchaseId: purchaseRef.id };
  } catch (error) {
    console.error('Error creating dossier purchase:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function processDossierPayment(purchaseId: string, paymentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const purchaseRef = adminDB.collection('dossier_purchases').doc(purchaseId);
    const purchaseSnap = await purchaseRef.get();
    
    if (!purchaseSnap.exists) {
      return { success: false, error: 'Compra não encontrada' };
    }

    const purchase = purchaseSnap.data() as DossierPurchase;
    
    // Atualizar status para aguardando revisão do admin
    await purchaseRef.update({
      status: 'pending_admin_review',
      paymentId,
      updatedAt: Timestamp.now()
    });

    return { success: true };
  } catch (error) {
    console.error('Error processing dossier payment:', error);
    return { success: false, error: (error as Error).message };
  }
}

// ===== GERAÇÃO DE DOSSIÊ =====

async function generateDriverDossier(purchase: DossierPurchase): Promise<{ success: boolean; dossierId?: string; error?: string }> {
  try {
    // Buscar dados do motorista
    const driverSnap = await adminDB.collection('users').doc(purchase.driverId).get();
    if (!driverSnap.exists) {
      return { success: false, error: 'Motorista não encontrado' };
    }

    const driver = driverSnap.data() as UserProfile;
    
    // Buscar dados da frota
    const fleetSnap = await adminDB.collection('users').doc(purchase.fleetId).get();
    if (!fleetSnap.exists) {
      return { success: false, error: 'Frota não encontrada' };
    }

    const fleet = fleetSnap.data() as UserProfile;
    
    // Buscar pacote
    const packageSnap = await adminDB.collection('dossier_packages').doc(purchase.packageId).get();
    if (!packageSnap.exists) {
      return { success: false, error: 'Pacote não encontrado' };
    }

    const packageData = packageSnap.data() as DriverDossierPackage;

    // Verificar se o usuário deu autorização financeira para análises financeiras
    const requiresFinancialAnalysis = packageData.features.includes('financial_analysis') || 
                                     packageData.features.includes('serasa_check') ||
                                     packageData.features.includes('credit_score') ||
                                     packageData.features.includes('income_verification');
    
    if (requiresFinancialAnalysis && !driver.financialConsent) {
      return { 
        success: false, 
        error: 'Autorização financeira é obrigatória para este tipo de dossiê. O motorista deve concordar com a análise financeira em seu perfil.' 
      };
    }

    // Gerar dados do dossiê baseado no pacote
    const dossierData = await generateDossierData(driver, packageData.features);

    // Criar documento do dossiê
    const dossierRef = await adminDB.collection('driver_dossiers').add({
      driverId: purchase.driverId,
      driverName: driver.name || 'Nome não informado',
      fleetId: purchase.fleetId,
      fleetName: fleet.name || 'Frota não informada',
      packageId: purchase.packageId,
      packageName: packageData.name,
      status: 'completed',
      price: purchase.price,
      paymentId: purchase.paymentId || '',
      ...dossierData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      expiresAt: new Timestamp(Timestamp.now().seconds + (90 * 24 * 60 * 60), 0) // 90 dias
    });

    return { success: true, dossierId: dossierRef.id };
  } catch (error) {
    console.error('Error generating driver dossier:', error);
    return { success: false, error: (error as Error).message };
  }
}

async function generateDossierData(driver: UserProfile, features: DossierFeature[]): Promise<Partial<DriverDossier>> {
  const dossierData: Partial<DriverDossier> = {};

  // Dados básicos sempre incluídos
  dossierData.basicProfile = {
    name: driver.name || '',
    email: driver.email || '',
    phone: driver.phone || '',
    cpf: driver.cpf || '',
    birthDate: '', // Seria calculado do CPF
    photoUrl: driver.photoUrl,
    address: driver.address || '',
    city: driver.city || '',
    state: driver.state || '',
    zipCode: driver.zipCode || ''
  };

  // Adicionar recursos baseado no pacote
  if (features.includes('financial_analysis')) {
    dossierData.financialAnalysis = await generateFinancialAnalysis(driver);
  }

  if (features.includes('serasa_check')) {
    dossierData.serasaCheck = await generateSerasaCheck(driver);
  }

  if (features.includes('contact_validation')) {
    dossierData.contactValidation = await generateContactValidation(driver);
  }

  if (features.includes('address_validation')) {
    dossierData.addressValidation = await generateAddressValidation(driver);
  }

  if (features.includes('work_history')) {
    dossierData.workHistory = await generateWorkHistory(driver);
  }

  if (features.includes('document_verification')) {
    dossierData.documentVerification = await generateDocumentVerification(driver);
  }

  if (features.includes('social_media_analysis')) {
    dossierData.socialMediaAnalysis = await generateSocialMediaAnalysis(driver);
  }

  if (features.includes('criminal_record')) {
    dossierData.criminalRecord = await generateCriminalRecord(driver);
  }

  if (features.includes('vehicle_preferences')) {
    dossierData.vehiclePreferences = await generateVehiclePreferences(driver);
  }

  if (features.includes('risk_assessment')) {
    dossierData.riskAssessment = await generateRiskAssessment(dossierData);
  }

  if (features.includes('comprehensive_report')) {
    dossierData.comprehensiveReport = await generateComprehensiveReport(dossierData);
  }

  return dossierData;
}

// ===== GERADORES DE DADOS ESPECÍFICOS =====

async function generateFinancialAnalysis(driver: UserProfile) {
  // Simulação de dados financeiros (em produção, integraria com APIs reais)
  return {
    creditScore: Math.floor(Math.random() * 300) + 300, // 300-600
    creditLimit: Math.floor(Math.random() * 50000) + 1000,
    outstandingDebts: Math.floor(Math.random() * 10000),
    paymentHistory: {
      onTime: Math.floor(Math.random() * 50) + 30,
      late: Math.floor(Math.random() * 10),
      defaulted: Math.floor(Math.random() * 3)
    },
    bankAccounts: [
      {
        bank: 'Banco do Brasil',
        accountType: 'Conta Corrente',
        balance: Math.floor(Math.random() * 5000) + 500,
        status: 'active' as const
      }
    ],
    incomeSources: [
      {
        type: 'salary' as const,
        amount: Math.floor(Math.random() * 3000) + 1500,
        frequency: 'monthly' as const,
        verified: true
      }
    ],
    riskLevel: (Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low') as 'low' | 'medium' | 'high'
  };
}

async function generateSerasaCheck(driver: UserProfile) {
  // Simulação de verificação Serasa
  const hasRestrictions = Math.random() > 0.8;
  
  return {
    hasRestrictions,
    restrictionCount: hasRestrictions ? Math.floor(Math.random() * 5) + 1 : 0,
    totalDebt: hasRestrictions ? Math.floor(Math.random() * 5000) + 100 : 0,
    lastUpdate: new Date().toISOString(),
    restrictions: hasRestrictions ? [
      {
        creditor: 'Cartão de Crédito',
        amount: Math.floor(Math.random() * 2000) + 100,
        type: 'Cartão',
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    ] : [],
    score: Math.floor(Math.random() * 1000) + 1
  };
}

async function generateContactValidation(driver: UserProfile) {
  return {
    phone: {
      valid: true,
      carrier: 'Vivo',
      type: 'mobile' as const,
      lastSeen: new Date().toISOString()
    },
    email: {
      valid: true,
      domain: driver.email?.split('@')[1] || 'gmail.com',
      lastActivity: new Date().toISOString()
    },
    whatsapp: {
      hasWhatsApp: driver.hasWhatsApp || false,
      lastSeen: new Date().toISOString()
    },
    emergencyContacts: driver.reference ? [
      {
        name: driver.reference.name,
        relationship: driver.reference.relationship,
        phone: driver.reference.phone,
        verified: true
      }
    ] : []
  };
}

async function generateAddressValidation(driver: UserProfile) {
  return {
    valid: true,
    coordinates: {
      lat: -23.5505 + (Math.random() - 0.5) * 0.1,
      lng: -46.6333 + (Math.random() - 0.5) * 0.1
    },
    neighborhood: driver.neighborhood || 'Centro',
    city: driver.city || 'São Paulo',
    state: driver.state || 'SP',
    zipCode: driver.zipCode || '01000-000',
    addressType: 'residential' as const,
    timeAtAddress: `${Math.floor(Math.random() * 10) + 1} anos`,
    previousAddresses: [],
    mapUrl: `https://maps.google.com/?q=${driver.address},${driver.city},${driver.state}`
  };
}

async function generateWorkHistory(driver: UserProfile) {
  return {
    currentJob: {
      company: 'Motorista Autônomo',
      position: 'Motorista',
      startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      salary: Math.floor(Math.random() * 3000) + 2000,
      verified: true
    },
    previousJobs: driver.workHistory?.map(job => ({
      company: job.fleetName,
      position: 'Motorista',
      startDate: job.period.split('-')[0],
      endDate: job.period.split('-')[1] || 'Atual',
      reason: job.reasonForLeaving || 'Término de contrato',
      reference: 'Ex-empregador',
      verified: true
    })) || [],
    totalExperience: Math.floor(Math.random() * 15) + 1,
    stabilityScore: Math.floor(Math.random() * 10) + 1
  };
}

async function generateDocumentVerification(driver: UserProfile) {
  return {
    cnh: {
      valid: true,
      number: driver.cnhNumber || '',
      category: driver.cnhCategory || 'B',
      expiration: driver.cnhExpiration ? new Date(driver.cnhExpiration.toDate()).toISOString() : '',
      points: driver.cnhPoints || 0,
      restrictions: [],
      status: 'valid' as const
    },
    condutax: {
      valid: true,
      number: driver.condutaxNumber || '',
      expiration: driver.condutaxExpiration ? new Date(driver.condutaxExpiration.toDate()).toISOString() : '',
      status: 'valid' as const
    },
    cpf: {
      valid: true,
      status: 'active' as const,
      lastUpdate: new Date().toISOString()
    },
    rg: {
      valid: true,
      number: '',
      issuingAuthority: 'SSP',
      issueDate: ''
    }
  };
}

async function generateSocialMediaAnalysis(driver: UserProfile) {
  return {
    linkedin: {
      exists: Math.random() > 0.5,
      profileUrl: Math.random() > 0.5 ? 'https://linkedin.com/in/motorista' : undefined,
      connections: Math.floor(Math.random() * 500) + 50,
      lastActivity: new Date().toISOString(),
      professionalScore: Math.floor(Math.random() * 100) + 1
    },
    facebook: {
      exists: Math.random() > 0.3,
      profileUrl: Math.random() > 0.3 ? 'https://facebook.com/motorista' : undefined,
      friends: Math.floor(Math.random() * 1000) + 100,
      lastActivity: new Date().toISOString()
    },
    instagram: {
      exists: Math.random() > 0.4,
      profileUrl: Math.random() > 0.4 ? 'https://instagram.com/motorista' : undefined,
      followers: Math.floor(Math.random() * 500) + 50,
      lastActivity: new Date().toISOString()
    },
    overallSocialScore: Math.floor(Math.random() * 100) + 1
  };
}

async function generateCriminalRecord(driver: UserProfile) {
  return {
    hasRecord: Math.random() > 0.95, // 5% de chance de ter antecedentes
    records: [],
    riskLevel: 'low' as const,
    lastCheck: new Date().toISOString()
  };
}

async function generateVehiclePreferences(driver: UserProfile) {
  return {
    preferredTypes: ['sedan', 'hatch'],
    preferredTransmission: 'automatic' as const,
    preferredFuelTypes: ['flex'],
    maxDailyRate: Math.floor(Math.random() * 100) + 50,
    preferredFeatures: ['ar-condicionado', 'direção-hidráulica'],
    drivingStyle: 'moderate' as const,
    experienceLevel: 'intermediate' as const
  };
}

async function generateRiskAssessment(dossierData: Partial<DriverDossier>) {
  let score = 50; // Score base

  // Ajustar baseado nos dados disponíveis
  if (dossierData.financialAnalysis) {
    if (dossierData.financialAnalysis.riskLevel === 'high') score -= 20;
    if (dossierData.financialAnalysis.riskLevel === 'low') score += 20;
  }

  if (dossierData.serasaCheck?.hasRestrictions) {
    score -= 15;
  }

  if (dossierData.criminalRecord?.hasRecord) {
    score -= 25;
  }

  score = Math.max(1, Math.min(100, score));

  return {
    overallScore: score,
    riskLevel: (score < 30 ? 'high' : score < 70 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
          factors: [
        {
          factor: 'Histórico Financeiro',
          impact: dossierData.financialAnalysis?.riskLevel === 'high' ? 'negative' as const : 'positive' as const,
          weight: 30,
          description: 'Análise de crédito e pagamentos'
        }
      ],
    recommendations: [
      'Monitorar pagamentos regularmente',
      'Manter documentação atualizada'
    ],
    insuranceRisk: (score < 30 ? 'high' : score < 70 ? 'medium' : 'low') as 'low' | 'medium' | 'high'
  };
}

async function generateComprehensiveReport(dossierData: Partial<DriverDossier>) {
  const keyFindings: string[] = [];
  const redFlags: string[] = [];
  const greenFlags: string[] = [];

  if (dossierData.financialAnalysis) {
    if (dossierData.financialAnalysis.riskLevel === 'low') {
      greenFlags.push('Bom histórico financeiro');
    } else if (dossierData.financialAnalysis.riskLevel === 'high') {
      redFlags.push('Risco financeiro elevado');
    }
  }

  if (dossierData.serasaCheck?.hasRestrictions) {
    redFlags.push('Restrições no Serasa');
  } else {
    greenFlags.push('Sem restrições no Serasa');
  }

  if (dossierData.criminalRecord?.hasRecord) {
    redFlags.push('Antecedentes criminais');
  } else {
    greenFlags.push('Sem antecedentes criminais');
  }

  return {
    summary: `Relatório completo do motorista ${dossierData.basicProfile?.name}`,
    keyFindings,
    redFlags,
    greenFlags,
    recommendations: [
      'Manter monitoramento regular',
      'Atualizar documentação periodicamente'
    ],
    conclusion: redFlags.length > greenFlags.length ? 'Candidato com riscos' : 'Candidato aprovado',
    generatedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  };
}

// ===== CONSULTA DE DOSSIÊS =====

export async function getFleetDossiers(fleetId: string): Promise<DriverDossier[]> {
  try {
    const dossiersSnap = await adminDB.collection('driver_dossiers')
      .where('fleetId', '==', fleetId)
      .where('status', '==', 'completed')
      .orderBy('createdAt', 'desc')
      .get();

    return dossiersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DriverDossier[];
  } catch (error) {
    console.error('Error fetching fleet dossiers:', error);
    return [];
  }
}

export async function getDriverDossier(dossierId: string): Promise<DriverDossier | null> {
  try {
    const dossierSnap = await adminDB.collection('driver_dossiers').doc(dossierId).get();
    
    if (!dossierSnap.exists) {
      return null;
    }

    return {
      id: dossierSnap.id,
      ...dossierSnap.data()
    } as DriverDossier;
  } catch (error) {
    console.error('Error fetching driver dossier:', error);
    return null;
  }
}

export async function getDossierPurchases(fleetId: string): Promise<DossierPurchase[]> {
  try {
    const purchasesSnap = await adminDB.collection('dossier_purchases')
      .where('fleetId', '==', fleetId)
      .orderBy('createdAt', 'desc')
      .get();

    return purchasesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DossierPurchase[];
  } catch (error) {
    console.error('Error fetching dossier purchases:', error);
    return [];
  }
}

// ===== FUNÇÕES ADMINISTRATIVAS =====

export async function getPendingDossierPurchases(): Promise<DossierPurchase[]> {
  try {
    const snapshot = await adminDB.collection('dossier_purchases')
      .where('status', '==', 'pending_admin_review')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DossierPurchase[];
  } catch (error) {
    console.error('Error getting pending dossier purchases:', error);
    return [];
  }
}

export async function approveAndProcessDossier(purchaseId: string): Promise<{ success: boolean; dossierId?: string; error?: string }> {
  try {
    const purchaseRef = adminDB.collection('dossier_purchases').doc(purchaseId);
    const purchaseSnap = await purchaseRef.get();
    
    if (!purchaseSnap.exists) {
      return { success: false, error: 'Compra não encontrada' };
    }

    const purchase = purchaseSnap.data() as DossierPurchase;
    
    if (purchase.status !== 'pending_admin_review') {
      return { success: false, error: 'Dossiê não está aguardando aprovação' };
    }

    // Atualizar status para processando
    await purchaseRef.update({
      status: 'processing',
      adminApprovedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Gerar o dossiê
    const dossierResult = await generateDriverDossier(purchase);
    
    if (dossierResult.success && dossierResult.dossierId) {
      // Atualizar status para concluído
      await purchaseRef.update({
        status: 'completed',
        dossierId: dossierResult.dossierId,
        completedAt: Timestamp.now()
      });
      
      return { success: true, dossierId: dossierResult.dossierId };
    } else {
      // Atualizar status para falha
      await purchaseRef.update({
        status: 'failed',
        error: dossierResult.error,
        updatedAt: Timestamp.now()
      });
      
      return { success: false, error: dossierResult.error };
    }
  } catch (error) {
    console.error('Error approving and processing dossier:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function rejectDossier(purchaseId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  try {
    const purchaseRef = adminDB.collection('dossier_purchases').doc(purchaseId);
    const purchaseSnap = await purchaseRef.get();
    
    if (!purchaseSnap.exists) {
      return { success: false, error: 'Compra não encontrada' };
    }

    const purchase = purchaseSnap.data() as DossierPurchase;
    
    if (purchase.status !== 'pending_admin_review') {
      return { success: false, error: 'Dossiê não está aguardando aprovação' };
    }

    // Atualizar status para rejeitado
    await purchaseRef.update({
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting dossier:', error);
    return { success: false, error: (error as Error).message };
  }
}