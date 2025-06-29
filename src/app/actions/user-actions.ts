
'use server';

import { revalidatePath } from 'next/cache';
import { db, auth as serverAuth, Timestamp } from '@/lib/firebase-admin';
import { z } from 'zod';

// Base schema for common fields
const baseSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

// Schema for Admin
const adminSchema = baseSchema.extend({
  role: z.literal('admin'),
  name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  cpf: z.string().min(11, { message: 'O CPF é obrigatório.' }),
});

// Schema for Driver
const driverSchema = baseSchema.extend({
  role: z.literal('driver'),
  name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
});

// Schema for Fleet (PF or PJ)
const fleetSchema = baseSchema.extend({
  role: z.literal('fleet'),
  personType: z.enum(['pf', 'pj']),
  name: z.string().optional(),
  nomeFantasia: z.string().optional(),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
});

// Schema for Provider (PF or PJ)
const providerSchema = baseSchema.extend({
  role: z.literal('provider'),
  personType: z.enum(['pf', 'pj']),
  name: z.string().optional(),
  nomeFantasia: z.string().optional(),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
});


export async function registerUser(data: any) {
    console.log('[USER ACTION] Received data:', data);
    try {
        let displayName = data.email;
        const userData: { [key: string]: any } = {
            email: data.email,
            role: data.role,
            createdAt: Timestamp.now(),
            profileStatus: data.role === 'admin' ? 'approved' : 'incomplete',
        };

        // --- Step 1: Validate data and build user object based on role ---
        switch (data.role) {
            case 'admin': {
                const validated = adminSchema.parse(data);
                userData.name = validated.name;
                userData.cpf = validated.cpf;
                displayName = validated.name;
                break;
            }
            case 'driver': {
                const validated = driverSchema.parse(data);
                userData.name = validated.name;
                displayName = validated.name;
                break;
            }
            case 'fleet':
            case 'provider': {
                const validated = data.role === 'fleet' ? fleetSchema.parse(data) : providerSchema.parse(data);
                userData.personType = validated.personType;
                if (validated.personType === 'pf') {
                    if (!validated.name || validated.name.length < 3) throw new Error('Nome completo é obrigatório para Pessoa Física.');
                    userData.name = validated.name;
                    displayName = validated.name;
                } else {
                    if (!validated.nomeFantasia || validated.nomeFantasia.length < 3) throw new Error('Nome Fantasia é obrigatório para Pessoa Jurídica.');
                    userData.nomeFantasia = validated.nomeFantasia;
                    displayName = validated.nomeFantasia;
                    if (validated.razaoSocial) userData.razaoSocial = validated.razaoSocial;
                    if (validated.cnpj) userData.cnpj = validated.cnpj;
                }
                break;
            }
            default:
                throw new Error('Tipo de perfil inválido.');
        }

        console.log('[USER ACTION] Data validated. User object to be created:', userData);

        // --- Step 2: Create Auth User ---
        console.log('[USER ACTION] Creating auth user...');
        const userRecord = await serverAuth.createUser({
            email: data.email,
            password: data.password,
            displayName: displayName,
        });
        console.log('[USER ACTION] Auth user created:', userRecord.uid);
        
        userData.uid = userRecord.uid;

        // --- Step 3: Save to Firestore ---
        console.log('[USER ACTION] Saving user profile to Firestore:', userData);
        await db.collection('users').doc(userRecord.uid).set(userData);
        console.log('[USER ACTION] User profile saved successfully.');

        revalidatePath('/');
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        console.error("--- REGISTRATION FAILED ---");
        let errorMessage = 'Não foi possível criar a conta. Verifique os dados e tente novamente.';
        
        if (error instanceof z.ZodError) {
             console.error('Zod Validation Error:', error.errors);
             errorMessage = error.errors.map(e => e.message).join('; ');
        } else if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está em uso por outra conta.';
        } else {
            console.error('Generic Error:', error);
            if(error.message) errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}
