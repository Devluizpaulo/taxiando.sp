'use server';
console.log('[USER ACTION] File loaded.');

import { revalidatePath } from 'next/cache';
import { db, auth as serverAuth, Timestamp } from '@/lib/firebase-admin';
import { z } from 'zod';

// Base schema for common fields
const baseSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

// Schemas for each role, extending the base
const adminSchema = baseSchema.extend({
  role: z.literal('admin'),
  name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  cpf: z.string().min(11, { message: 'O CPF é obrigatório.' }),
});

const driverSchema = baseSchema.extend({
  role: z.literal('driver'),
  name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
});

const fleetPfSchema = baseSchema.extend({
    role: z.literal('fleet'),
    personType: z.literal('pf'),
    name: z.string().min(3, 'O nome é obrigatório.'),
});
const fleetPjSchema = baseSchema.extend({
    role: z.literal('fleet'),
    personType: z.literal('pj'),
    nomeFantasia: z.string().min(3, 'O nome fantasia é obrigatório.'),
    razaoSocial: z.string().optional(),
    cnpj: z.string().optional(),
});

const providerPfSchema = baseSchema.extend({
    role: z.literal('provider'),
    personType: z.literal('pf'),
    name: z.string().min(3, 'O nome é obrigatório.'),
});

const providerPjSchema = baseSchema.extend({
    role: z.literal('provider'),
    personType: z.literal('pj'),
    nomeFantasia: z.string().min(3, 'O nome fantasia é obrigatório.'),
    razaoSocial: z.string().optional(),
    cnpj: z.string().optional(),
});


// Union of all possible schemas
const registrationSchema = z.discriminatedUnion("role", [
    adminSchema,
    driverSchema,
    fleetPfSchema,
    fleetPjSchema,
    providerPfSchema,
    providerPjSchema,
]);


export async function registerUser(data: any) {
    console.log('[USER ACTION] Received registration data:', data);
    try {
        const validatedData = registrationSchema.parse(data);
        console.log('[USER ACTION] Data validated successfully for role:', validatedData.role);

        if (validatedData.role === 'admin') {
            console.log('[USER ACTION] Admin registration: Checking for existing admin...');
            const usersRef = db.collection('users');
            const adminQuery = await usersRef.where('role', '==', 'admin').limit(1).get();
            if (!adminQuery.empty) {
                console.error('[USER ACTION] ERROR: An admin user already exists.');
                return { success: false, error: 'Um administrador já existe. Não é possível criar outro.' };
            }
            console.log('[USER ACTION] No existing admin found. Proceeding.');
        }

        console.log('[USER ACTION] Creating user in Firebase Auth...');
        const userRecord = await serverAuth.createUser({
            email: validatedData.email,
            password: validatedData.password,
            displayName: 'name' in validatedData ? validatedData.name : validatedData.nomeFantasia,
        });
        console.log(`[USER ACTION] Firebase Auth user created successfully. UID: ${userRecord.uid}`);

        // Base user data object
        const userData: Record<string, any> = {
            uid: userRecord.uid,
            email: validatedData.email,
            role: validatedData.role,
            createdAt: Timestamp.now(),
            profileStatus: validatedData.role === 'admin' ? 'approved' : 'incomplete',
        };

        // Add role-specific fields
        switch (validatedData.role) {
            case 'admin':
                userData.name = validatedData.name;
                userData.cpf = validatedData.cpf;
                break;
            case 'driver':
                userData.name = validatedData.name;
                userData.personType = 'pf';
                break;
            case 'fleet':
            case 'provider':
                 userData.personType = validatedData.personType;
                if (validatedData.personType === 'pf') {
                    userData.name = validatedData.name;
                } else {
                    userData.nomeFantasia = validatedData.nomeFantasia;
                    userData.razaoSocial = validatedData.razaoSocial;
                    userData.cnpj = validatedData.cnpj;
                }
                break;
        }
        
        console.log('[USER ACTION] Preparing to save user profile to Firestore. Data:', userData);
        await db.collection('users').doc(userRecord.uid).set(userData);
        console.log(`[USER ACTION] User profile saved to Firestore for UID: ${userRecord.uid}`);

        revalidatePath('/');
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        let errorMessage = 'Não foi possível criar a conta.';
         if (error instanceof z.ZodError) {
            errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
        } else if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está em uso por outra conta.';
        } else {
             errorMessage = 'Ocorreu um erro inesperado. Por favor, tente novamente.';
        }
        
        console.error("================ REGISTRATION FAILED ================");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Error Object:", error);
        console.error("=====================================================");

        return { success: false, error: errorMessage };
    }
}
