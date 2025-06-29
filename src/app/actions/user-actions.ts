
'use server';

import { db, auth as serverAuth, Timestamp } from '@/lib/firebase-admin';
import { z } from 'zod';

const passwordSchema = z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' });
const baseSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: passwordSchema,
});

const registerSchema = z.discriminatedUnion("role", [
  baseSchema.extend({
    role: z.literal("driver"),
    name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
    cpf: z.string().min(11, { message: 'O CPF é obrigatório e deve conter 11 dígitos.' }),
  }),
  baseSchema.extend({
    role: z.literal("admin"),
    name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
    cpf: z.string().min(11, { message: 'O CPF é obrigatório e deve conter 11 dígitos.' }),
  }),
  baseSchema.extend({
    role: z.literal("fleet"),
    personType: z.enum(['pf', 'pj']),
    name: z.string().optional(),
    cpf: z.string().optional(),
    nomeFantasia: z.string().optional(),
    cnpj: z.string().optional(),
  }),
   baseSchema.extend({
    role: z.literal("provider"),
    personType: z.enum(['pf', 'pj']),
    name: z.string().optional(),
    cpf: z.string().optional(),
    nomeFantasia: z.string().optional(),
    cnpj: z.string().optional(),
  })
]).and(z.object({
    confirmPassword: passwordSchema,
})).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
}).refine(data => {
    if (data.role === 'fleet' || data.role === 'provider') {
        if (data.personType === 'pf') {
             if (!data.name || data.name.length < 3) return false;
             if (!data.cpf || data.cpf.length < 11) return false;
        }
        if (data.personType === 'pj') {
            if (!data.nomeFantasia || data.nomeFantasia.length < 3) return false;
        }
    }
    return true;
}, {
    message: "Preencha os campos obrigatórios para o tipo de pessoa selecionado.",
    path: ["name"],
});


export async function registerUser(data: any) {
    try {
        // Sanitize CPF and CNPJ inputs before validation
        if (data.cpf) {
            data.cpf = data.cpf.replace(/\D/g, '');
        }
        if (data.cnpj) {
            data.cnpj = data.cnpj.replace(/\D/g, '');
        }

        const validatedData = registerSchema.parse(data);
        
        let displayName = validatedData.email;
        const userData: { [key:string]: any } = {
            email: validatedData.email,
            role: validatedData.role,
            createdAt: Timestamp.now(),
            profileStatus: 'incomplete',
            credits: 0,
        }
        if (validatedData.role === 'admin') {
            userData.profileStatus = 'approved';
        }

        switch (validatedData.role) {
            case 'admin':
            case 'driver':
                if (validatedData.name) userData.name = validatedData.name;
                if (validatedData.cpf) userData.cpf = validatedData.cpf;
                displayName = validatedData.name;
                break;
            
            case 'fleet':
            case 'provider':
                if (validatedData.personType) userData.personType = validatedData.personType;
                if (validatedData.personType === 'pf') {
                    if (!validatedData.name || !validatedData.cpf) {
                        throw new Error('Nome e CPF são obrigatórios para Pessoa Física.');
                    }
                    userData.name = validatedData.name;
                    userData.cpf = validatedData.cpf;
                    displayName = validatedData.name;
                } else { // 'pj'
                    if (!validatedData.nomeFantasia) {
                         throw new Error('Nome Fantasia é obrigatório para Pessoa Jurídica.');
                    }
                    if (validatedData.nomeFantasia) userData.nomeFantasia = validatedData.nomeFantasia;
                    if (validatedData.cnpj) userData.cnpj = validatedData.cnpj;
                    displayName = validatedData.nomeFantasia;
                }
                break;
        }

        const userRecord = await serverAuth.createUser({
            email: validatedData.email,
            password: validatedData.password,
            displayName: displayName,
        });
        
        userData.uid = userRecord.uid;

        await db.collection('users').doc(userRecord.uid).set(userData);

        revalidatePath('/');
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        let errorMessage = 'Não foi possível criar a conta. Verifique os dados e tente novamente.';
        
        if (error instanceof z.ZodError) {
             errorMessage = error.errors.map(e => e.message).join('; ');
        } else if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está em uso por outra conta.';
        } else {
            if(error.message) errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}
