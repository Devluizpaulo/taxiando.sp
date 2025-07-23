
import { CityGuideClientPage } from './city-guide-client';

export default async function AdminCityGuidePage() {
    const tips: any[] = [];
    return <CityGuideClientPage initialTips={tips} />;
}
