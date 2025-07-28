
import { getTips } from '@/app/actions/city-guide-actions';
import { CityGuideCategoriesPage } from './city-guide-categories-page';

export default async function CityGuidePage() {
  const tips = await getTips();
  
  return <CityGuideCategoriesPage initialTips={tips} />;
}
