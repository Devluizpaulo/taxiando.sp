'use server';

import { revalidatePath } from 'next/cache';
import { db, auth as serverAuth } from '@/lib/firebase-admin';
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

// Schemas for Fleet/Provider (PF and PJ)
const companyPfSchema = baseSchema.extend({
    role: z.union([z.literal('fleet'), z.literal('provider')]),
    personType: z.literal('pf'),
    name: z.string().min(3, 'O nome é obrigatório.'),
});
const companyPjSchema = baseSchema.extend({
    role: z.union([z.literal('fleet'), z.literal('provider')]),
    personType: z.literal('pj'),
    nomeFantasia: z.string().min(3, 'O nome fantasia é obrigatório.'),
    razaoSocial: z.string().optional(),
    cnpj: z.string().optional(),
});


export async function registerUser(data: any) {
    console.log('[USER ACTION] Received registration data:', JSON.stringify(data, null, 2));
    try {
        const { role, personType } = z.object({ 
            role: z.enum(['driver', 'fleet', 'provider', 'admin']),
            personType: z.enum(['pf', 'pj']).optional()
        }).parse(data);

        let validatedData;
        
        console.log(`[USER ACTION] Validating for role: ${role}, personType: ${personType}`);
        // Server-side validation based on role
        switch (role) {
            case 'admin':
                validatedData = adminSchema.parse(data);
                console.log('[USER ACTION] Admin data validated. Checking for existing admin...');
                const usersRef = db.collection('users');
                const adminQuery = await usersRef.where('role', '==', 'admin').limit(1).get();
                if (!adminQuery.empty) {
                    console.error('[USER ACTION] ERROR: An admin user already exists.');
                    return { success: false, error: 'Um administrador já existe. Não é possível criar outro.' };
                }
                console.log('[USER ACTION] No existing admin found. Proceeding.');
                break;
            
            case 'driver':
                 validatedData = driverSchema.parse(data);
                 console.log('[USER ACTION] Driver data validated.');
                break;
            
            case 'fleet':
            case 'provider':
                if (personType === 'pf') {
                    validatedData = companyPfSchema.parse(data);
                } else if (personType === 'pj') {
                    validatedData = companyPjSchema.parse(data);
                } else {
                     throw new Error("Tipo de pessoa (PF/PJ) é obrigatório para frotas e prestadores.");
                }
                console.log('[USER ACTION] Fleet/Provider data validated.');
                break;
            
            default:
                throw new Error("Tipo de perfil inválido.");
        }

        console.log('[USER ACTION] Creating user in Firebase Auth...');
        const userRecord = await serverAuth.createUser({
            email: data.email,
            password: data.password,
            displayName: data.name || data.nomeFantasia,
        });
        console.log(`[USER ACTION] Firebase Auth user created successfully. UID: ${userRecord.uid}`);

        const userData: any = {
            uid: userRecord.uid,
            email: data.email,
            role: role,
            createdAt: new Date(),
            profileStatus: 'incomplete', // Default for all new users except admin
        };
        
        if (role === 'admin') {
            userData.name = validatedData.name;
            userData.cpf = validatedData.cpf;
            userData.profileStatus = 'approved';
        } else if (role === 'driver') {
            userData.name = (validatedData as z.infer<typeof driverSchema>).name;
            userData.personType = 'pf';
        } else { // Fleet or Provider
            userData.personType = personType;
            if (personType === 'pf') {
                userData.name = (validatedData as z.infer<typeof companyPfSchema>).name;
            } else {
                userData.razaoSocial = (validatedData as z.infer<typeof companyPjSchema>).razaoSocial;
                userData.nomeFantasia = (validatedData as z.infer<typeof companyPjSchema>).nomeFantasia;
                userData.cnpj = (validatedData as z.infer<typeof companyPjSchema>).cnpj;
            }
        }
        
        console.log('[USER ACTION] Preparing to save user profile to Firestore. Data:', JSON.stringify(userData, null, 2));
        await db.collection('users').doc(userRecord.uid).set(userData);
        console.log(`[USER ACTION] User profile saved to Firestore for UID: ${userRecord.uid}`);

        revalidatePath('/');
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        let errorMessage = 'Não foi possível criar a conta.';
         if (error instanceof z.ZodError) {
            errorMessage = error.errors.map(e => e.message).join(' ');
        } else if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está em uso por outra conta.';
        }
        
        console.error("================ REGISTRATION FAILED ================");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Full Error Object:", JSON.stringify(error, null, 2));
        console.error("=====================================================");

        return { success: false, error: errorMessage };
    }
}
