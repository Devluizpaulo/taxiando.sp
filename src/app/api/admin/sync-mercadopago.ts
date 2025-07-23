import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDB } from '@/lib/firebase-admin';
import { syncCreditPackagesWithMercadoPago } from '@/app/actions/billing-actions';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }
    const idToken = authHeader.replace('Bearer ', '');
    const decoded = await adminAuth.verifyIdToken(idToken);
    const userId = decoded.uid;
    // Busca perfil do usuário
    const userDoc = await adminDB.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 403 });
    }
    const user = userDoc.data();
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
    }
    // Executa sincronização
    const result = await syncCreditPackagesWithMercadoPago();
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error || 'Erro desconhecido.' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 