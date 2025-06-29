'use server';

import { adminAuth, db } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';

const registerSchema = z.object({
    role: z.enum(['driver', 'fleet', 'provider', 'admin']),
    email: z.string().email({ message: "O e-mail é obrigatório."}),
    password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
    confirmPassword: z.string(),
    name: z.string().optional(),
    cpf: z.string().optional(),
    personType: z.enum(['pf', 'pj']).optional(),
    nomeFantasia: z.string().optional(),
    cnpj: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
}).superRefine((data, ctx) => {
    const cleanCpf = data.cpf?.replace(/\D/g, '') || '';
    const cleanCnpj = data.cnpj?.replace(/\D/g, '') || '';

    if (data.role === 'driver' || data.role === 'admin') {
        if (!data.name || data.name.trim().length < 3) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O nome completo é obrigatório.', path: ['name'] });
        }
        if (cleanCpf.length !== 11) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O CPF é obrigatório e deve conter 11 dígitos.', path: ['cpf'] });
        }
    }
    if (data.role === 'fleet' || data.role === 'provider') {
        if (data.personType === 'pf') {
            if (!data.name || data.name.trim().length < 3) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O nome completo é obrigatório.', path: ['name'] });
            }
            if (cleanCpf.length !== 11) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O CPF é obrigatório e deve conter 11 dígitos.', path: ['cpf'] });
            }
        } else if (data.personType === 'pj') {
            if (!data.nomeFantasia || data.nomeFantasia.trim().length < 3) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O nome fantasia é obrigatório.', path: ['nomeFantasia'] });
            }
            if (cleanCnpj && cleanCnpj.length !== 14) {
                 ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Se preenchido, o CNPJ deve ter 14 dígitos.', path: ['cnpj'] });
            }
        }
    }
});

export async function registerUser(data: any) {
    try {
        const validatedData = registerSchema.parse(data);

        const { email, role, password, personType, name, cpf, nomeFantasia, cnpj } = validatedData;
        const cleanCpf = cpf?.replace(/\D/g, '');
        const cleanCnpj = cnpj?.replace(/\D/g, '');

        let displayName = email;
        const userData: { [key: string]: any } = {
            email: email,
            role: role,
            createdAt: Timestamp.now(),
            profileStatus: 'incomplete',
            credits: 0,
        };

        if (role === 'admin') {
            userData.profileStatus = 'approved';
        }

        if (name && name.trim()) {
            userData.name = name.trim();
            if (role === 'driver' || role === 'admin' || personType === 'pf') {
                displayName = name.trim();
            }
        }
        if (cleanCpf) userData.cpf = cleanCpf;
        if (personType) userData.personType = personType;

        if (nomeFantasia && nomeFantasia.trim()) {
            userData.nomeFantasia = nomeFantasia.trim();
            if (personType === 'pj') {
                displayName = nomeFantasia.trim();
            }
        }
        if (cleanCnpj) userData.cnpj = cleanCnpj;
        
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
             console.error("Zod Validation Error:", JSON.stringify(error.errors, null, 2));
             errorMessage = error.errors.map(e => e.message).join('; ');
        } else if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está em uso por outra conta.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        console.error("REGISTRATION ERROR:", error);
        return { success: false, error: errorMessage };
    }
}
