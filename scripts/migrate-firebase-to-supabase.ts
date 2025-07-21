import { adminDB } from '../src/lib/firebase-admin';
import { supabaseServer } from '../src/lib/supabaseClient';

interface FirebaseCityTip {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  imageUrls: string[];
  mapUrl?: string;
  target: 'driver' | 'client';
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  createdAt: any;
  updatedAt?: any;
}

async function migrateCityTips() {
  try {
    console.log('🚀 Iniciando migração de city tips...');

    // Buscar dados do Firebase
    const snapshot = await adminDB.collection('city_tips').get();
    const firebaseTips = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseCityTip[];

    console.log(`📊 Encontrados ${firebaseTips.length} dicas no Firebase`);

    // Migrar para Supabase
    for (const tip of firebaseTips) {
      try {
        const supabaseData = {
          id: tip.id,
          title: tip.title,
          category: tip.category,
          description: tip.description,
          location: tip.location,
          image_urls: tip.imageUrls || [],
          map_url: tip.mapUrl || null,
          target: tip.target,
          price_range: tip.priceRange || null,
          created_at: tip.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: tip.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };

        const { error } = await supabaseServer
          .from('city_tips')
          .upsert(supabaseData, { onConflict: 'id' });

        if (error) {
          console.error(`❌ Erro ao migrar dica ${tip.id}:`, error);
        } else {
          console.log(`✅ Dica migrada: ${tip.title}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar dica ${tip.id}:`, error);
      }
    }

    console.log('🎉 Migração concluída!');

    // Verificar dados migrados
    const { data: migratedTips, error } = await supabaseServer
      .from('city_tips')
      .select('*');

    if (error) {
      console.error('❌ Erro ao verificar dados migrados:', error);
    } else {
      console.log(`📈 Total de dicas no Supabase: ${migratedTips?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Executar migração
migrateCityTips()
  .then(() => {
    console.log('✅ Script de migração finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  }); 