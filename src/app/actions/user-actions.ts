'use server';

import { db, adminAuth } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';

const passwordSchema = z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' });

const registerSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("driver"),
    name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
    cpf: z.string().transform(v => v.replace(/\D/g, '')).refine(v => v.length === 11, { message: 'O CPF é obrigatório e deve conter 11 dígitos.' }),
    email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  }),
  z.object({
    role: z.literal("admin"),
    name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
    cpf: z.string().transform(v => v.replace(/\D/g, '')).refine(v => v.length === 11, { message: 'O CPF é obrigatório e deve conter 11 dígitos.' }),
    email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  }),
  z.object({
    role: z.literal("fleet"),
    personType: z.enum(['pf', 'pj']),
    name: z.string().optional(),
    cpf: z.string().optional().transform(v => v?.replace(/\D/g, '') || ''),
    nomeFantasia: z.string().optional(),
    cnpj: z.string().optional().transform(v => v?.replace(/\D/g, '') || ''),
    email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  }),
  z.object({
    role: z.literal("provider"),
    personType: z.enum(['pf', 'pj']),
    name: z.string().optional(),
    cpf: z.string().optional().transform(v => v?.replace(/\D/g, '') || ''),
    nomeFantasia: z.string().optional(),
    cnpj: z.string().optional().transform(v => v?.replace(/\D/g, '') || ''),
    email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  })
]).and(z.object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
})).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
}).refine(data => {
    if (data.role === 'fleet' || data.role === 'provider') {
        if (data.personType === 'pf') {
             return data.name && data.name.length >= 3 && data.cpf && data.cpf.length >= 11;
        }
        if (data.personType === 'pj') {
            return data.nomeFantasia && data.nomeFantasia.length >= 3;
        }
    }
    return true;
}, {
    message: "Preencha os campos obrigatórios para o tipo de pessoa selecionado.",
    path: ["name"],
});


export async function registerUser(data: any) {
    try {
        const validatedData = registerSchema.parse(data);
        
        let displayName = validatedData.email;
        const userData: { [key:string]: any } = {
            email: validatedData.email,
            role: validatedData.role,
            createdAt: Timestamp.now(),
            profileStatus: 'incomplete',
            credits: 0,
        };

        switch (validatedData.role) {
            case 'admin':
            case 'driver':
                displayName = validatedData.name;
                userData.name = validatedData.name;
                userData.cpf = validatedData.cpf;
                if (validatedData.role === 'admin') {
                    userData.profileStatus = 'approved';
                }
                break;
            
            case 'fleet':
            case 'provider':
                userData.personType = validatedData.personType;
                if (validatedData.personType === 'pf') {
                    displayName = validatedData.name!;
                    userData.name = validatedData.name!;
                    userData.cpf = validatedData.cpf!;
                } else { // 'pj'
                    displayName = validatedData.nomeFantasia!;
                    userData.nomeFantasia = validatedData.nomeFantasia!;
                    if (validatedData.cnpj) {
                        userData.cnpj = validatedData.cnpj;
                    }
                }
                break;
        }

        const userRecord = await adminAuth.createUser({
            email: validatedData.email,
            password: validatedData.password,
            displayName: displayName,
        });
        
        await db.collection('users').doc(userRecord.uid).set(userData);

        revalidatePath('/');
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        let errorMessage = 'Não foi possível criar a conta. Verifique os dados e tente novamente.';
        
        if (error instanceof z.ZodError) {
             errorMessage = error.errors.map(e => e.message).join('; ');
        } else if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está em uso por outra conta.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        console.error("REGISTRATION ERROR: ", JSON.stringify(error, null, 2));

        return { success: false, error: errorMessage };
    }
}
