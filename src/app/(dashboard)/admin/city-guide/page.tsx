
import { CityGuideClientPage } from './city-guide-client';
import { getAllTips } from '@/app/actions/city-guide-actions';

export default async function AdminCityGuidePage() {
    let tips = await getAllTips();
    return <CityGuideClientPage initialTips={tips} />;
}
