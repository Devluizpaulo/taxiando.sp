'use server';

import { revalidatePath } from 'next/cache';
import { db, auth as serverAuth } from '@/lib/firebase-admin'; // Use Admin SDK on the server
import { z } from 'zod';

const registerFormSchema = z.object({
  role: z.enum(['driver', 'fleet', 'provider', 'admin']),
  personType: z.enum(['pf', 'pj']).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  cpf: z.string().optional(),
  razaoSocial: z.string().optional(),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export async function registerUser(data: RegisterFormData) {
    try {
        const validatedData = registerFormSchema.parse(data);

        // --- Logic for Admin Creation ---
        if (validatedData.role === 'admin') {
            const usersRef = db.collection('users');
            // Query for any document where the role is 'admin'.
            const adminQuery = await usersRef.where('role', '==', 'admin').limit(1).get();

            // If the query returns any documents, an admin already exists.
            if (!adminQuery.empty) {
                return { success: false, error: 'Um administrador já existe para esta plataforma. Não é possível criar outro.' };
            }
        }
        // --- End Admin Logic ---

        const userRecord = await serverAuth.createUser({
            email: validatedData.email,
            password: validatedData.password,
            displayName: validatedData.name || validatedData.nomeFantasia,
        });

        const userData: any = {
            uid: userRecord.uid,
            email: validatedData.email,
            role: validatedData.role,
            createdAt: new Date(),
        };

        if (validatedData.role === 'admin') {
            userData.name = validatedData.name;
            userData.cpf = validatedData.cpf;
            // Admins are automatically approved.
            userData.profileStatus = 'approved';
        } else if (validatedData.role === 'driver') {
            userData.name = validatedData.name;
            userData.personType = 'pf';
            userData.profileStatus = 'incomplete';
        } else { // Fleet or Provider
            userData.personType = validatedData.personType;
            userData.profileStatus = 'incomplete';
            if (validatedData.personType === 'pf') {
                userData.name = validatedData.name;
            } else {
                userData.razaoSocial = validatedData.razaoSocial;
                userData.nomeFantasia = validatedData.nomeFantasia;
                userData.cnpj = validatedData.cnpj;
            }
        }
        
        // The firestore.rules now allow this operation for the new user.
        await db.collection('users').doc(userRecord.uid).set(userData);

        revalidatePath('/');
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        let errorMessage = 'Não foi possível criar a conta.';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Este email já está em uso por outra conta.';
        } else if (error instanceof z.ZodError) {
            errorMessage = error.errors.map(e => e.message).join(' ');
        }
        console.error("Registration failed:", error);
        return { success: false, error: errorMessage };
    }
}
