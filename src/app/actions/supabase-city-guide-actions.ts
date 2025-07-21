'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer, convertSupabaseData } from '@/lib/supabaseClient';
import { type CityTip } from '@/lib/types';
import { cityGuideFormSchema, type CityGuideFormValues } from '@/lib/city-guide-schemas';
import { generateCityTip, type GenerateCityTipInput } from '@/ai/flows/generate-city-tip-flow';

export async function generateTipWithAI(input: GenerateCityTipInput) {
    try {
        const result = await generateCityTip(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error generating tip with AI:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function createOrUpdateTip(data: CityGuideFormValues, tipId?: string) {
    const validation = cityGuideFormSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: 'Dados inválidos.' };
    }

    try {
        const tipData = {
            title: validation.data.title,
            category: validation.data.category,
            description: validation.data.description,
            location: validation.data.location,
            image_urls: validation.data.imageUrls || [],
            map_url: validation.data.mapUrl || null,
            target: validation.data.target,
            price_range: validation.data.priceRange || null,
            updated_at: new Date().toISOString(),
        };

        let result;
        
        if (tipId) {
            // Atualizar dica existente
            const { data: updatedTip, error } = await supabaseServer
                .from('city_tips')
                .update(tipData)
                .eq('id', tipId)
                .select()
                .single();

            if (error) throw error;
            result = updatedTip;
        } else {
            // Criar nova dica
            const { data: newTip, error } = await supabaseServer
                .from('city_tips')
                .insert({
                    ...tipData,
                    created_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            result = newTip;
        }

        revalidatePath('/admin/city-guide');
        revalidatePath('/spdicas');
        revalidatePath('/');

        const finalData = convertSupabaseData<CityTip>(result);
        return { success: true, tip: finalData };
    } catch (error) {
        console.error('Error creating/updating tip:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteTip(tipId: string) {
    if (!tipId) return { success: false, error: 'ID da dica não fornecido.' };
    
    try {
        const { error } = await supabaseServer
            .from('city_tips')
            .delete()
            .eq('id', tipId);

        if (error) throw error;

        revalidatePath('/admin/city-guide');
        revalidatePath('/spdicas');
        revalidatePath('/');
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting tip:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getTips(target?: 'driver' | 'client'): Promise<CityTip[]> {
    try {
        let query = supabaseServer
            .from('city_tips')
            .select('*')
            .order('created_at', { ascending: false });

        if (target) {
            query = query.eq('target', target);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data.map(tip => convertSupabaseData<CityTip>(tip));
    } catch (error) {
        // Log detalhado do erro
        console.error("Error fetching city tips:", error, JSON.stringify(error));
        return [];
    }
}

export async function getTipById(tipId: string): Promise<CityTip | null> {
    try {
        const { data, error } = await supabaseServer
            .from('city_tips')
            .select('*')
            .eq('id', tipId)
            .single();

        if (error) throw error;

        return convertSupabaseData<CityTip>(data);
    } catch (error) {
        console.error("Error fetching tip by ID:", error);
        return null;
    }
}

export async function getTipsByCategory(category: string): Promise<CityTip[]> {
    try {
        const { data, error } = await supabaseServer
            .from('city_tips')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(tip => convertSupabaseData<CityTip>(tip));
    } catch (error) {
        console.error("Error fetching tips by category:", error);
        return [];
    }
}

export async function searchTips(searchTerm: string): Promise<CityTip[]> {
    try {
        const { data, error } = await supabaseServer
            .from('city_tips')
            .select('*')
            .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(tip => convertSupabaseData<CityTip>(tip));
    } catch (error) {
        console.error("Error searching tips:", error);
        return [];
    }
} 