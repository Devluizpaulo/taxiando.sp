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
    try {
        const { role, personType } = z.object({ 
            role: z.enum(['driver', 'fleet', 'provider', 'admin']),
            personType: z.enum(['pf', 'pj']).optional()
        }).parse(data);

        let validatedData;
        
        // Server-side validation based on role
        switch (role) {
            case 'admin':
                validatedData = adminSchema.parse(data);
                const usersRef = db.collection('users');
                const adminQuery = await usersRef.where('role', '==', 'admin').limit(1).get();
                if (!adminQuery.empty) {
                    return { success: false, error: 'Um administrador já existe. Não é possível criar outro.' };
                }
                break;
            
            case 'driver':
                 validatedData = driverSchema.parse(data);
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
                break;
            
            default:
                throw new Error("Tipo de perfil inválido.");
        }

        const userRecord = await serverAuth.createUser({
            email: data.email,
            password: data.password,
            displayName: data.name || data.nomeFantasia,
        });

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
        
        await db.collection('users').doc(userRecord.uid).set(userData);

        revalidatePath('/');
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        let errorMessage = 'Não foi possível criar a conta.';
         if (error instanceof z.ZodError) {
            errorMessage = error.errors.map(e => e.message).join(' ');
        } else if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está em uso por outra conta.';
        }
        console.error("Registration failed:", error);
        return { success: false, error: errorMessage };
    }
}
