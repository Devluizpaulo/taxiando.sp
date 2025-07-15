
import { Car, ShieldCheck, Fuel, CarIcon, Handshake, Users, Sparkles, Coffee, Wifi, Wrench, CircleHelp } from 'lucide-react';

export const vehiclePerks = [
    { id: 'insurance', label: 'Seguro Passageiro', icon: ShieldCheck },
    { id: 'full_tank', label: 'Tanque Cheio', icon: Fuel },
    { id: 'car_wash', label: 'Lava-rápido', icon: CarIcon },
    { id: 'gvn', label: 'Kit GNV', icon: Fuel },
    { id: 'support', label: 'Suporte 24h', icon: CircleHelp },
    { id: 'tow_truck', label: 'Guincho', icon: Wrench },
];

export const fleetAmenities = [
    { id: 'mechanic', label: 'Mecânica Própria', icon: Wrench },
    { id: 'body_shop', label: 'Funilaria Própria', icon: CarIcon },
    { id: 'coffee', label: 'Espaço para café', icon: Coffee },
    { id: 'wifi', label: 'Wi-Fi para motoristas', icon: Wifi },
    { id: 'lounge', label: 'Sala de descanso', icon: Users },
    { id: 'legal', label: 'Suporte Jurídico', icon: Handshake },
    { id: 'tow_truck', label: 'Guincho 24 horas', icon: Wrench },
];
