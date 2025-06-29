'use server';

import { revalidatePath } from 'next/cache';
import { db, auth as serverAuth } from '@/lib/firebase-admin';
import { z } from 'zod';

// Base schema for common fields
const baseSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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
    name: z.string().min(3, 'O nome é obrigatório.'),
});
const companyPjSchema = baseSchema.extend({
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
        let finalRole = role;

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
                } else {
                    validatedData = companyPjSchema.parse(data);
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
            role: finalRole,
            createdAt: new Date(),
            profileStatus: 'incomplete', // Default for all new users except admin
        };
        
        if (finalRole === 'admin') {
            userData.name = data.name;
            userData.cpf = data.cpf;
            userData.profileStatus = 'approved';
        } else if (finalRole === 'driver') {
            userData.name = data.name;
            userData.personType = 'pf';
        } else { // Fleet or Provider
            userData.personType = personType;
            if (personType === 'pf') {
                userData.name = data.name;
            } else {
                userData.razaoSocial = data.razaoSocial;
                userData.nomeFantasia = data.nomeFantasia;
                userData.cnpj = data.cnpj;
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
