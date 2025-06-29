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
    try {
        let validatedData;
        
        // --- Step 1: Validate data based on role ---
        switch (data.role) {
            case 'admin':
                validatedData = adminSchema.parse(data);
                break;
            case 'driver':
                validatedData = driverSchema.parse(data);
                break;
            case 'fleet':
                validatedData = fleetSchema.parse(data);
                 if (validatedData.personType === 'pf' && (!validatedData.name || validatedData.name.length < 3)) {
                    throw new Error('O nome completo é obrigatório para Pessoa Física.');
                }
                if (validatedData.personType === 'pj' && (!validatedData.nomeFantasia || validatedData.nomeFantasia.length < 3)) {
                    throw new Error('O nome fantasia é obrigatório para Pessoa Jurídica.');
                }
                break;
            case 'provider':
                validatedData = providerSchema.parse(data);
                 if (validatedData.personType === 'pf' && (!validatedData.name || validatedData.name.length < 3)) {
                    throw new Error('O nome completo é obrigatório para Pessoa Física.');
                }
                if (validatedData.personType === 'pj' && (!validatedData.nomeFantasia || validatedData.nomeFantasia.length < 3)) {
                    throw new Error('O nome fantasia é obrigatório para Pessoa Jurídica.');
                }
                break;
            default:
                throw new Error('Tipo de perfil inválido.');
        }

        // --- Step 2: Check for existing admin if creating one ---
        if (validatedData.role === 'admin') {
            const usersRef = db.collection('users');
            const adminQuery = await usersRef.where('role', '==', 'admin').limit(1).get();
            if (!adminQuery.empty) {
                return { success: false, error: 'Um administrador já existe. Não é possível criar outro.' };
            }
        }
        
        // --- Step 3: Create Auth User ---
        const userRecord = await serverAuth.createUser({
            email: validatedData.email,
            password: validatedData.password,
            displayName: 'name' in validatedData && validatedData.name ? validatedData.name : ('nomeFantasia' in validatedData ? validatedData.nomeFantasia : validatedData.email),
        });
        
        // --- Step 4: Build Firestore Document, including only defined fields ---
        const { password, ...payload } = validatedData;
        const userData: { [key: string]: any } = {
            uid: userRecord.uid,
            email: payload.email,
            role: payload.role,
            createdAt: Timestamp.now(),
            profileStatus: payload.role === 'admin' ? 'approved' : 'incomplete',
        };

        if (payload.name) userData.name = payload.name;
        if ('cpf' in payload && payload.cpf) userData.cpf = payload.cpf;
        if (payload.personType) userData.personType = payload.personType;
        if (payload.nomeFantasia) userData.nomeFantasia = payload.nomeFantasia;
        if (payload.razaoSocial) userData.razaoSocial = payload.razaoSocial;
        if (payload.cnpj) userData.cnpj = payload.cnpj;
        
        // --- Step 5: Save to Firestore ---
        await db.collection('users').doc(userRecord.uid).set(userData);

        revalidatePath('/');
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        let errorMessage = 'Não foi possível criar a conta.';
         if (error instanceof z.ZodError) {
            errorMessage = error.errors.map(e => e.message).join('; ');
        } else if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está em uso por outra conta.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        console.error("REGISTRATION FAILED:", errorMessage, error);

        return { success: false, error: errorMessage };
    }
}
