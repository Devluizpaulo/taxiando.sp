
import { getTips } from '@/app/actions/city-guide-actions';
import { CityGuideClientPage } from './city-guide-client';

export default async function AdminCityGuidePage() {
    const tips = await getTips();
    return <CityGuideClientPage initialTips={tips} />;
}
