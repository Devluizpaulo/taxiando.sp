
'use server';

import { revalidatePath } from 'next/cache';
import { db, auth as serverAuth, Timestamp } from '@/lib/firebase-admin';
import { z } from 'zod';

// This schema should match the one on the client, but it's the definitive source of truth.
const passwordSchema = z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' });
const baseSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: passwordSchema,
});
const registerSchema = z.discriminatedUnion("role", [
  baseSchema.extend({
    role: z.literal("driver"),
    name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
    cpf: z.string().min(11, { message: 'O CPF é obrigatório.' }),
  }),
  baseSchema.extend({
    role: z.literal("admin"),
    name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
    cpf: z.string().min(11, { message: 'O CPF é obrigatório.' }),
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
]);


export async function registerUser(data: any) {
    try {
        const validatedData = registerSchema.parse(data);
        
        let displayName = validatedData.email;
        const userData: { [key: string]: any } = {
            email: validatedData.email,
            role: validatedData.role,
            createdAt: Timestamp.now(),
            profileStatus: validatedData.role === 'admin' ? 'approved' : 'incomplete',
            credits: 0,
        };

        // --- Step 1: Build user object based on role ---
        switch (validatedData.role) {
            case 'admin':
            case 'driver':
                userData.name = validatedData.name;
                userData.cpf = validatedData.cpf;
                displayName = validatedData.name;
                break;
            
            case 'fleet':
            case 'provider':
                userData.personType = validatedData.personType;
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
                    userData.nomeFantasia = validatedData.nomeFantasia;
                    displayName = validatedData.nomeFantasia;
                    if (validatedData.razaoSocial) userData.razaoSocial = validatedData.razaoSocial;
                    if (validatedData.cnpj) userData.cnpj = validatedData.cnpj;
                }
                break;
        }

        // --- Step 2: Create Auth User ---
        const userRecord = await serverAuth.createUser({
            email: validatedData.email,
            password: validatedData.password,
            displayName: displayName,
        });
        
        userData.uid = userRecord.uid;

        // --- Step 3: Save to Firestore ---
        await db.collection('users').doc(userRecord.uid).set(userData);

        revalidatePath('/');
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        let errorMessage = 'Não foi possível criar a conta. Verifique os dados e tente novamente.';
        
        if (error instanceof z.ZodError) {
             console.error('Zod Validation Error:', error.errors);
             errorMessage = error.errors.map(e => e.message).join('; ');
        } else if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está em uso por outra conta.';
        } else {
            console.error('Generic Registration Error:', error);
            if(error.message) errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}
