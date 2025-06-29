'use server';

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
  personType: z.literal('pf').optional(), // Included for consistency
});

const driverSchema = baseSchema.extend({
  role: z.literal('driver'),
  name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  personType: z.literal('pf').optional(), // Included for consistency
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
const fleetSchema = z.discriminatedUnion('personType', [fleetPfSchema, fleetPjSchema]);


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
const providerSchema = z.discriminatedUnion('personType', [providerPfSchema, providerPjSchema]);


// Union of all possible schemas
const registrationSchema = z.discriminatedUnion("role", [
    adminSchema,
    driverSchema,
    fleetSchema,
    providerSchema,
]);


export async function registerUser(data: any) {
    console.log('[USER ACTION] Received registration data:', data);
    try {
        const validatedData = registrationSchema.parse(data);
        console.log('[USER ACTION] Data validated successfully for role:', validatedData.role);

        if (validatedData.role === 'admin') {
            const usersRef = db.collection('users');
            const adminQuery = await usersRef.where('role', '==', 'admin').limit(1).get();
            if (!adminQuery.empty) {
                return { success: false, error: 'Um administrador já existe. Não é possível criar outro.' };
            }
        }

        const userRecord = await serverAuth.createUser({
            email: validatedData.email,
            password: validatedData.password,
            displayName: 'name' in validatedData ? validatedData.name : validatedData.nomeFantasia,
        });
        
        // This is the critical part: build the object safely for Firestore
        const { password, ...payload } = validatedData;
        
        const userData: { [key: string]: any } = {
            uid: userRecord.uid,
            email: payload.email,
            role: payload.role,
            createdAt: Timestamp.now(),
            profileStatus: payload.role === 'admin' ? 'approved' : 'incomplete',
        };

        if ('name' in payload) userData.name = payload.name;
        if ('cpf' in payload) userData.cpf = payload.cpf;

        if ('personType' in payload) {
            userData.personType = payload.personType;
            if (payload.personType === 'pj') {
                if ('nomeFantasia' in payload) userData.nomeFantasia = payload.nomeFantasia;
                if (payload.razaoSocial) userData.razaoSocial = payload.razaoSocial;
                if (payload.cnpj) userData.cnpj = payload.cnpj;
            }
        } else if (payload.role === 'driver') {
            // Ensure driver has personType pf
            userData.personType = 'pf';
        }
        
        console.log('[USER ACTION] Preparing to save user profile to Firestore. Data:', userData);
        await db.collection('users').doc(userRecord.uid).set(userData);
        console.log(`[USER ACTION] User profile saved to Firestore for UID: ${userRecord.uid}`);

        revalidatePath('/');
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        let errorMessage = 'Não foi possível criar a conta.';
         if (error instanceof z.ZodError) {
            console.error("Zod Validation Error:", error.flatten());
            errorMessage = error.errors.map(e => e.message).join('; ');
        } else if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está em uso por outra conta.';
        } else {
             errorMessage = 'Ocorreu um erro inesperado durante o cadastro. Verifique os dados e tente novamente.';
        }
        
        console.error("================ REGISTRATION FAILED ================");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Full Error Object:", error);
        console.error("=====================================================");

        return { success: false, error: errorMessage };
    }
}
