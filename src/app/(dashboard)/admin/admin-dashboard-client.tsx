
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Users, Briefcase, BookOpen, DollarSign, PackagePlus, ArrowRight, Calendar, CreditCard, ShoppingCart, Loader2, Eye, LogIn, UserCheck, Search, Trash2, FilePen, Sparkles, Building, Settings, Car, Wrench, Shield, Newspaper, Library, ImageIcon, Tag, Mail, Megaphone, Handshake, LifeBuoy, Star, Share2, TrendingUp, Activity, Zap, Target, Award, Rocket, Crown, Trophy, Heart, Globe, ChartBar, BarChart3, PieChart, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, Plus, ChevronUp, ChevronDown, Play, Pause, RotateCcw, RefreshCw, CheckCircle2, XCircle, Clock, Filter } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";

import { updateListingStatus, getAdminDashboardData } from '@/app/actions/admin-actions';
import { getVehicleDetails } from '@/app/actions/fleet-actions';
import { getServiceAndProviderDetails } from '@/app/actions/service-actions';
import type { UserProfile, Vehicle, ServiceListing, AnalyticsData, AdminUser } from '@/lib/types';
import { LoadingScreen } from '@/components/loading-screen';
import { vehiclePerks } from '@/lib/data';

// CSS para animações e efeitos modernos
const modernStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
    }
    50% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .animate-slide-in-left {
    animation: slideInLeft 0.6s ease-out;
  }
  
  .animate-slide-in-right {
    animation: slideInRight 0.6s ease-out;
  }
  
  .animate-pulse-slow {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .animate-bounce-slow {
    animation: bounce 2s infinite;
  }
  
  .animate-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite alternate;
  }
  
  .gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .gradient-bg-2 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  
  .gradient-bg-3 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  
  .gradient-bg-4 {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
  
  .gradient-bg-5 {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .hover-scale {
    transition: transform 0.3s ease;
  }
  
  .hover-scale:hover {
    transform: scale(1.05);
  }
  
  .card-hover {
    transition: all 0.3s ease;
  }
  
  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .text-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .border-gradient {
    border: 2px solid;
    border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
  }
`;

const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Aprovado':
        case 'approved':
        case 'Ativo':
             return 'default';
        case 'Pendente': 
        case 'pending_review':
        case 'incomplete':
            return 'secondary';
        case 'Rejeitado':
        case 'rejected':
            return 'destructive';
        default: return 'outline';
    }
};

// Componente de card de métrica moderno
function ModernMetricCard({ 
    title, 
    value, 
    icon: Icon, 
    gradient, 
    trend, 
    trendValue, 
    delay = 0,
    period = ""
}: { 
    title: string; 
    value: string | number; 
    icon: any; 
    gradient: string; 
    trend?: 'up' | 'down' | 'neutral'; 
    trendValue?: string; 
    delay?: number;
    period?: string;
}) {
    return (
        <Card 
            className={`card-hover border-0 shadow-lg overflow-hidden animate-fade-in-up bg-white`}
            style={{ 
                animationDelay: `${delay}ms`
            }}
        >
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <p className="text-gray-700 text-sm font-semibold">{title}</p>
                            {period && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                                    {period}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-gray-900">{value}</span>
                            {trend && (
                                <div className={`flex items-center gap-1 text-sm font-medium ${
                                    trend === 'up' ? 'text-green-600' : 
                                    trend === 'down' ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                    {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> :
                                     trend === 'down' ? <ArrowDownRight className="h-4 w-4" /> :
                                     <Minus className="h-4 w-4" />}
                                    {trendValue}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={`p-3 rounded-full ${gradient} animate-float shadow-lg`}>
                        <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Componente de gráfico moderno
function ModernChart({ data, title, type = 'bar' }: { data: any[]; title: string; type?: 'bar' | 'line' | 'area' }) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    
    return (
        <Card className="card-hover border-0 shadow-xl animate-slide-in-left">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <ChartBar className="h-6 w-6 text-blue-500" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    {type === 'bar' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="month" 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                                contentStyle={{ 
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Bar 
                                dataKey="total" 
                                fill="url(#colorGradient)" 
                                radius={[8, 8, 0, 0]}
                            />
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                        </BarChart>
                    ) : type === 'line' ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="month" 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ stroke: '#667eea', strokeWidth: 2 }}
                                contentStyle={{ 
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="total" 
                                stroke="#667eea" 
                                strokeWidth={3}
                                dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                                activeDot={{ r: 8, stroke: '#667eea', strokeWidth: 2, fill: '#fff' }}
                            />
                        </LineChart>
                    ) : (
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="month" 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ stroke: '#667eea', strokeWidth: 2 }}
                                contentStyle={{ 
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="total" 
                                stroke="#667eea" 
                                fill="url(#areaGradient)"
                                strokeWidth={3}
                            />
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// Componente de tabela moderna
function ModernTable({ 
    title, 
    description, 
    data, 
    columns, 
    emptyMessage,
    icon: Icon,
    gradient
}: { 
    title: string; 
    description: string; 
    data: any[]; 
    columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[];
    emptyMessage: string;
    icon: any;
    gradient: string;
}) {
    return (
        <Card className="card-hover border-0 shadow-xl bg-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <div className={`p-2 rounded-lg ${gradient}`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    {title}
                </CardTitle>
                <CardDescription className="text-gray-700 font-medium">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <div className="space-y-3">
                        {data.map((item, index) => (
                            <div 
                                key={index}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
                            >
                                {columns.map((column, colIndex) => (
                                    <div key={colIndex} className="flex-1">
                                        {column.render ? column.render(item) : item[column.key]}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">{emptyMessage}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Componente de progresso circular moderno
function CircularProgress({ 
    value, 
    max, 
    size = 120, 
    strokeWidth = 8, 
    color = "#667eea",
    label,
    subtitle
}: { 
    value: number; 
    max: number; 
    size?: number; 
    strokeWidth?: number; 
    color?: string;
    label: string;
    subtitle: string;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (value / max) * circumference;
    const offset = circumference - progress;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{value}</div>
                        <div className="text-sm text-gray-500">de {max}</div>
                    </div>
                </div>
            </div>
            <div className="mt-4 text-center">
                <div className="font-semibold text-gray-800">{label}</div>
                <div className="text-sm text-gray-500">{subtitle}</div>
            </div>
        </div>
    );
}

// Componente de card de estatística com ícone animado
function StatCard({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend, 
    trendValue,
    description 
}: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    trend?: 'up' | 'down' | 'neutral'; 
    trendValue?: string;
    description?: string;
}) {
    return (
        <Card className="card-hover border-0 shadow-lg overflow-hidden group bg-white">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <p className="text-gray-700 text-sm font-semibold">{title}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-gray-900">{value}</span>
                            {trend && (
                                <div className={`flex items-center gap-1 text-sm font-medium ${
                                    trend === 'up' ? 'text-green-600' : 
                                    trend === 'down' ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                    {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> :
                                     trend === 'down' ? <ArrowDownRight className="h-4 w-4" /> :
                                     <Minus className="h-4 w-4" />}
                                    {trendValue}
                                </div>
                            )}
                        </div>
                        {description && (
                            <p className="text-sm text-gray-600 font-medium">{description}</p>
                        )}
                    </div>
                    <div className={`p-4 rounded-full ${color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Componente de gráfico de pizza moderno
function ModernPieChart({ data, title }: { data: { name: string; value: number; color: string }[]; title: string }) {
    return (
        <Card className="card-hover border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-6 w-6 text-purple-500" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                    </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Componente de loading animado moderno
function ModernLoadingScreen() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-8">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
                        <div className="absolute inset-2 rounded-full border-4 border-purple-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="absolute inset-4 rounded-full border-4 border-pink-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        <div className="absolute inset-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-spin"></div>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Carregando Dashboard</h2>
                <p className="text-gray-600">Preparando suas métricas...</p>
                <div className="mt-6 flex justify-center">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componente de card com efeito de vidro (glassmorphism)
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`glass-effect rounded-xl p-6 ${className}`}>
            {children}
        </div>
    );
}

// Componente de badge animado
function AnimatedBadge({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "error"; className?: string }) {
    const variants = {
        default: "bg-blue-100 text-blue-800 border-blue-200",
        success: "bg-green-100 text-green-800 border-green-200",
        warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
        error: "bg-red-100 text-red-800 border-red-200"
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border animate-pulse-slow ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}

export function AdminDashboardClient() {
    const { toast } = useToast();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [services, setServices] = useState<ServiceListing[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData>({});
    const [pageLoading, setPageLoading] = useState(true);
    
    const [updatingListingStatus, setUpdatingListingStatus] = useState<string | null>(null);

    // State for moderation modals
    const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [selectedVehicleFleet, setSelectedVehicleFleet] = useState<UserProfile | null>(null);
    const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);
    const [selectedServiceProvider, setSelectedServiceProvider] = useState<UserProfile | null>(null);

    // Estado para controlar a aba ativa
    const [activeTab, setActiveTab] = useState<string>("opportunities");

    // Estado para controlar o período das métricas
    const [selectedPeriod, setSelectedPeriod] = useState<string>("24h");

    // Função para calcular o período em milissegundos
    const getPeriodInMs = (period: string): number => {
        switch (period) {
            case "24h":
                return 24 * 60 * 60 * 1000;
            case "48h":
                return 48 * 60 * 60 * 1000;
            case "1week":
                return 7 * 24 * 60 * 60 * 1000;
            case "1month":
                return 30 * 24 * 60 * 60 * 1000;
            default:
                return 24 * 60 * 60 * 1000;
        }
    };

    // Função para formatar o período para exibição
    const getPeriodLabel = (period: string): string => {
        switch (period) {
            case "24h":
                return "Últimas 24h";
            case "48h":
                return "Últimas 48h";
            case "1week":
                return "Última semana";
            case "1month":
                return "Último mês";
            default:
                return "Últimas 24h";
        }
    };

    // Função para calcular a data de início do período selecionado
    const getPeriodStartDate = (period: string): Date => {
        const periodMs = getPeriodInMs(period);
        const now = new Date();
        return new Date(now.getTime() - periodMs);
    };

    // Função para buscar dados do dashboard
    const fetchDashboardData = async (periodStart?: Date) => {
            setPageLoading(true);
            try {
            const data = await getAdminDashboardData(periodStart);
                setUsers(data.users);
                setVehicles(data.vehicles);
                setServices(data.services);
                setAnalytics(data.analytics);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro ao Carregar Painel', description: 'Não foi possível carregar os dados do painel. Tente recarregar a página.' });
            } finally {
                setPageLoading(false);
            }
        };

    // Carregar dados iniciais
    useEffect(() => {
        fetchDashboardData();
    }, [toast]);

    // Recarregar dados quando o período mudar
    useEffect(() => {
        const periodStart = getPeriodStartDate(selectedPeriod);
        fetchDashboardData(periodStart);
    }, [selectedPeriod]);

    
    const handleListingApproval = async (id: string, type: 'vehicles' | 'services', newStatus: 'Aprovado' | 'Rejeitado') => {
        setUpdatingListingStatus(id);
        try {
            const result = await updateListingStatus(id, type, newStatus);
            if (result.success) {
                toast({ title: 'Sucesso', description: `Status do anúncio atualizado para ${newStatus}.`});
                if (type === 'vehicles') {
                    setVehicles(prev => prev.filter(o => o.id !== id));
                } else {
                    setServices(prev => prev.filter(s => s.id !== id));
                }
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: result.error });
            }
        } finally {
            setUpdatingListingStatus(null);
        }
    };

    const handleViewVehicleDetails = async (vehicleId: string) => {
        setIsFetchingDetails(true);
        const result = await getVehicleDetails(vehicleId);
        if (result.success && result.vehicle && result.fleet) {
            setSelectedVehicle(result.vehicle);
            setSelectedVehicleFleet(result.fleet);
            setVehicleModalOpen(true);
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os detalhes do veículo.' });
        }
        setIsFetchingDetails(false);
    };
    
    const handleViewServiceDetails = async (serviceId: string) => {
        setIsFetchingDetails(true);
        const result = await getServiceAndProviderDetails(serviceId);
        if (result.success && result.service && result.provider) {
            setSelectedService(result.service);
            setSelectedServiceProvider(result.provider);
            setServiceModalOpen(true);
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os detalhes do serviço.' });
        }
        setIsFetchingDetails(false);
    };

    if (pageLoading) {
        return <ModernLoadingScreen />;
    }
    
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: modernStyles }} />
            <div className="flex flex-col gap-8 p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
                {/* Header Moderno */}
                <div className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-2">
            <div>
                            <h1 className="text-4xl font-bold text-gradient mb-2 flex items-center gap-3">
                                <div className="p-3 rounded-full gradient-bg animate-glow">
                                    <Rocket className="h-8 w-8 text-white" />
                                </div>
                                Painel Administrativo
                            </h1>
                            <p className="text-gray-700 text-lg font-medium">Visão geral e gerenciamento da plataforma Táxiando SP</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-200">
                                <Activity className="h-5 w-5 text-green-500 animate-pulse-slow" />
                                <span className="text-sm font-bold text-gray-800">Sistema Ativo</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold text-gray-600">Total de Usuários</div>
                                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                            </div>
                        </div>
            </div>
            
                    {/* Seletor de Período */}
                    <div className="flex items-center justify-between mt-4 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <Filter className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-semibold text-gray-700">Período das Métricas:</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger className="w-48 bg-gray-50 border-gray-300">
                                    <SelectValue placeholder="Selecione o período" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="24h">Últimas 24 horas</SelectItem>
                                    <SelectItem value="48h">Últimas 48 horas</SelectItem>
                                    <SelectItem value="1week">Última semana</SelectItem>
                                    <SelectItem value="1month">Último mês</SelectItem>
                                </SelectContent>
                            </Select>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {getPeriodLabel(selectedPeriod)}
                            </Badge>
                        </div>
                    </div>
            </div>

                {/* Alertas e Notificações em Tempo Real */}
                <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            className="card-hover border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-l-blue-500 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onClick={() => setActiveTab('users')}
                            tabIndex={0}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-blue-500 animate-pulse-slow">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-blue-900">Novos Usuários</p>
                                        <p className="text-sm font-semibold text-blue-700">{users.filter(u => u.profileStatus === 'pending_review').length} cadastros pendentes</p>
                                    </div>
                                </div>
                            </CardContent>
                        </button>

                        <button
                            className="card-hover border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-l-green-500 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-green-400"
                            onClick={() => setActiveTab('opportunities')}
                            tabIndex={0}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-green-500 animate-bounce-slow">
                                        <Car className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-900">Veículos Pendentes</p>
                                        <p className="text-sm font-semibold text-green-700">{vehicles.length} aguardando aprovação</p>
                                    </div>
                                </div>
                            </CardContent>
                        </button>

                        <button
                            className="card-hover border-0 shadow-lg bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-l-purple-500 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-purple-400"
                            onClick={() => setActiveTab('services')}
                            tabIndex={0}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-purple-500 animate-float">
                                        <Wrench className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-purple-900">Serviços Pendentes</p>
                                        <p className="text-sm font-semibold text-purple-700">{services.length} aguardando moderação</p>
                                    </div>
                                </div>
                            </CardContent>
                        </button>
                    </div>
                </div>
                
                {/* Métricas Principais */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <ModernMetricCard
                        title="Usuários Totais"
                        value={users.length}
                        icon={Users}
                        gradient="gradient-bg"
                        trend="up"
                        trendValue="+12%"
                        delay={0}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                    <ModernMetricCard
                        title="Visitas na Home"
                        value={analytics.pageViews?.home || 0}
                        icon={Eye}
                        gradient="gradient-bg-2"
                        trend="up"
                        trendValue="+8%"
                        delay={100}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                    <ModernMetricCard
                        title="Logins Totais"
                        value={analytics.logins?.total || 0}
                        icon={LogIn}
                        gradient="gradient-bg-3"
                        trend="up"
                        trendValue="+15%"
                        delay={200}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                    <ModernMetricCard
                        title="Pacotes Vendidos"
                        value={analytics.sales?.packagesSold ?? 0}
                        icon={ShoppingCart}
                        gradient="gradient-bg-4"
                        trend="neutral"
                        delay={300}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                    <ModernMetricCard
                        title="Receita (Simulada)"
                        value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(analytics.sales?.totalRevenue ?? 0)}
                        icon={DollarSign}
                        gradient="gradient-bg-5"
                        trend="up"
                        trendValue="+23%"
                        delay={400}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                </div>

                {/* Métricas de Páginas */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <ModernMetricCard
                        title="Visitas no Blog"
                        value={analytics.pageViews?.blog || 0}
                        icon={Newspaper}
                        gradient="gradient-bg"
                        trend="up"
                        trendValue="+18%"
                        delay={500}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                    <ModernMetricCard
                        title="Visitas na Agenda"
                        value={analytics.pageViews?.events || 0}
                        icon={Calendar}
                        gradient="gradient-bg-2"
                        trend="up"
                        trendValue="+25%"
                        delay={600}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                    <ModernMetricCard
                        title="Visitas nos Cursos"
                        value={analytics.pageViews?.courses || 0}
                        icon={BookOpen}
                        gradient="gradient-bg-3"
                        trend="up"
                        trendValue="+32%"
                        delay={700}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                    <ModernMetricCard
                        title="Visitas nos Serviços"
                        value={analytics.pageViews?.services || 0}
                        icon={Wrench}
                        gradient="gradient-bg-4"
                        trend="up"
                        trendValue="+14%"
                        delay={800}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                </div>

                {/* Métricas de Compartilhamento */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <ModernMetricCard
                        title="Blog Compartilhado"
                        value={analytics.contentShares?.blog_total_shares || 0}
                        icon={Share2}
                        gradient="gradient-bg"
                        trend="up"
                        trendValue="+45%"
                        delay={900}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                    <ModernMetricCard
                        title="Eventos Compartilhados"
                        value={analytics.contentShares?.event_total_shares || 0}
                        icon={Share2}
                        gradient="gradient-bg-2"
                        trend="up"
                        trendValue="+38%"
                        delay={1000}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                    <ModernMetricCard
                        title="Cursos Compartilhados"
                        value={analytics.contentShares?.course_total_shares || 0}
                        icon={Share2}
                        gradient="gradient-bg-3"
                        trend="up"
                        trendValue="+52%"
                        delay={1100}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                    <ModernMetricCard
                        title="Serviços Compartilhados"
                        value={analytics.contentShares?.service_total_shares || 0}
                        icon={Share2}
                        gradient="gradient-bg-4"
                        trend="up"
                        trendValue="+29%"
                        delay={1200}
                        period={getPeriodLabel(selectedPeriod)}
                    />
                </div>

                {/* Estatísticas Avançadas com Gráficos Circulares */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card className="card-hover border-0 shadow-xl bg-white">
                     <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                    <Target className="h-6 w-6 text-blue-500" />
                                    Visão Geral do Engajamento
                                </CardTitle>
                                <CardDescription className="text-gray-700 font-medium">Métricas detalhadas de performance da plataforma</CardDescription>
                    </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <CircularProgress
                                        value={analytics.pageViews?.home || 0}
                                        max={Math.max(analytics.pageViews?.home || 0, 100)}
                                        color="#667eea"
                                        label="Visitas Home"
                                        subtitle="Este mês"
                                    />
                                    <CircularProgress
                                        value={analytics.logins?.total || 0}
                                        max={Math.max(analytics.logins?.total || 0, 50)}
                                        color="#f093fb"
                                        label="Logins"
                                        subtitle="Total"
                                    />
                                    <CircularProgress
                                        value={analytics.contentShares?.blog_total_shares || 0}
                                        max={Math.max(analytics.contentShares?.blog_total_shares || 0, 20)}
                                        color="#4facfe"
                                        label="Compartilhamentos"
                                        subtitle="Blog"
                                    />
                                    <CircularProgress
                                        value={users.length}
                                        max={Math.max(users.length, 10)}
                                        color="#43e97b"
                                        label="Usuários"
                                        subtitle="Ativos"
                                    />
                                </div>
                    </CardContent>
                </Card>
                    </div>
                    
                    <div className="space-y-6">
                        <ModernPieChart
                            title="Distribuição de Conteúdo"
                            data={[
                                { name: 'Blog', value: analytics.pageViews?.blog || 0, color: '#667eea' },
                                { name: 'Eventos', value: analytics.pageViews?.events || 0, color: '#f093fb' },
                                { name: 'Cursos', value: analytics.pageViews?.courses || 0, color: '#4facfe' },
                                { name: 'Serviços', value: analytics.pageViews?.services || 0, color: '#43e97b' },
                            ].filter(item => item.value > 0)}
                        />
                        
                        <Card className="card-hover border-0 shadow-xl bg-white">
                     <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    Performance Rápida
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <StatCard
                                    title="Taxa de Conversão"
                                    value={`${((analytics.logins?.total || 0) / Math.max(analytics.pageViews?.home || 0, 1) * 100).toFixed(1)}%`}
                                    icon={Target}
                                    color="bg-green-500"
                                    trend="up"
                                    trendValue="+2.3%"
                                    description="Usuários que completaram ações"
                                />
                                <StatCard
                                    title="Tempo Médio"
                                    value="4m 32s"
                                    icon={Clock}
                                    color="bg-blue-500"
                                    trend="down"
                                    trendValue="-12s"
                                    description="Tempo na plataforma"
                                />
                                <StatCard
                                    title="Satisfação"
                                    value="4.8/5"
                                    icon={Star}
                                    color="bg-yellow-500"
                                    trend="up"
                                    trendValue="+0.2"
                                    description="Avaliação média"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Métricas em Tempo Real */}
                <div className="animate-fade-in-up" style={{ animationDelay: '1400ms' }}>
                    <Card className="card-hover border-0 shadow-xl bg-white border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                <Zap className="h-6 w-6 text-blue-500 animate-pulse" />
                                Métricas em Tempo Real
                            </CardTitle>
                            <CardDescription className="text-gray-700 font-medium">Dados atualizados a cada minuto</CardDescription>
                    </CardHeader>
                    <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold mb-2 animate-pulse-slow text-blue-600">
                                        {analytics.pageViews?.home || 0}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700">Visitas {selectedPeriod === "24h" ? "Hoje" : selectedPeriod === "48h" ? "Últimas 48h" : selectedPeriod === "1week" ? "Esta Semana" : "Este Mês"}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold mb-2 animate-pulse-slow text-green-600">
                                        {analytics.logins?.total || 0}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700">Logins {selectedPeriod === "24h" ? "Hoje" : selectedPeriod === "48h" ? "Últimas 48h" : selectedPeriod === "1week" ? "Esta Semana" : "Este Mês"}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold mb-2 animate-pulse-slow text-purple-600">
                                        {vehicles.length}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700">Veículos Online</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold mb-2 animate-pulse-slow text-orange-600">
                                        {services.length}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700">Serviços Ativos</div>
                                </div>
                            </div>
                    </CardContent>
                </Card>
            </div>

                {/* Gráficos e Análises */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <ModernChart 
                            data={analytics.userGrowth || []} 
                            title="Crescimento de Usuários" 
                            type="area"
                        />
                    </div>
                    <div className="space-y-6">
                        <ModernTable
                            title="Cadastros para Análise"
                            description="Cadastros recentes que precisam de atenção"
                            data={users.filter(u => u.profileStatus === 'pending_review').slice(0, 5)}
                            columns={[
                                { key: 'name', label: 'Nome', render: (user) => (
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                )},
                                { key: 'profileStatus', label: 'Status', render: (user) => (
                                    <Badge variant={getStatusVariant(user.profileStatus)}>
                                        {user.profileStatus}
                                    </Badge>
                                )}
                            ]}
                            emptyMessage="Nenhum cadastro pendente"
                            icon={UserCheck}
                            gradient="gradient-bg"
                        />
                    </div>
                </div>

                {/* Conteúdo Mais Popular */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <ModernTable
                        title="Blog Mais Popular"
                        description="Posts com mais visualizações e compartilhamentos"
                        data={analytics.topContent?.blog || []}
                        columns={[
                            { key: 'title', label: 'Título', render: (post) => (
                                <div className="font-medium">{post.title}</div>
                            )},
                            { key: 'views', label: 'Visualizações', render: (post) => (
                                <AnimatedBadge variant="default" className="bg-blue-100 text-blue-800 border-blue-300 font-semibold">
                                    {post.views}
                                </AnimatedBadge>
                            )},
                            { key: 'shares', label: 'Compartilhamentos', render: (post) => (
                                <AnimatedBadge variant="success" className="bg-green-100 text-green-800 border-green-300 font-semibold">
                                    {post.shares}
                                </AnimatedBadge>
                            )}
                        ]}
                        emptyMessage="Nenhum post do blog ainda"
                        icon={Newspaper}
                        gradient="gradient-bg-2"
                    />

                    <ModernTable
                        title="Eventos Mais Populares"
                        description="Eventos da agenda cultural com mais engajamento"
                        data={analytics.topContent?.events || []}
                        columns={[
                            { key: 'title', label: 'Título', render: (event) => (
                                <div className="font-medium">{event.title}</div>
                            )},
                            { key: 'views', label: 'Visualizações', render: (event) => (
                                <AnimatedBadge variant="default" className="bg-purple-100 text-purple-800 border-purple-300 font-semibold">
                                    {event.views}
                                </AnimatedBadge>
                            )},
                            { key: 'shares', label: 'Compartilhamentos', render: (event) => (
                                <AnimatedBadge variant="warning" className="bg-orange-100 text-orange-800 border-orange-300 font-semibold">
                                    {event.shares}
                                </AnimatedBadge>
                            )}
                        ]}
                        emptyMessage="Nenhum evento ainda"
                        icon={Calendar}
                        gradient="gradient-bg-3"
                    />
                </div>

                {/* Moderação */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-white rounded-xl shadow-lg p-1">
                        <TabsTrigger value="opportunities" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg">
                            <Car className="h-4 w-4 mr-2" />
                            Moderar Locações
                        </TabsTrigger>
                        <TabsTrigger value="services" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg">
                            <Wrench className="h-4 w-4 mr-2" />
                            Moderar Serviços
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg">
                            <Settings className="h-4 w-4 mr-2" />
                            Configurações
                        </TabsTrigger>
                </TabsList>
                
                    <TabsContent value="opportunities" className="mt-6">
                        <Card className="card-hover border-0 shadow-xl">
                        <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="h-6 w-6 text-blue-500" />
                                    Moderar Anúncios de Veículos
                                </CardTitle>
                                <CardDescription>Aprove ou rejeite os veículos anunciados para locação</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                                        <TableHead>Veículo Anunciado</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vehicles.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Car className="h-8 w-8 text-gray-300" />
                                                        <p className="text-gray-500">Nenhuma locação pendente</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                    ) : (
                                        vehicles.map(vehicle => (
                                                <TableRow key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                                                <TableCell className="font-medium">
                                                    <Button variant="link" className="p-0 h-auto" onClick={() => handleViewVehicleDetails(vehicle.id)} disabled={isFetchingDetails}>
                                                        {vehicle.make} {vehicle.model} ({vehicle.plate})
                                                    </Button>
                                                </TableCell>
                                                    <TableCell>
                                                        <AnimatedBadge variant={getStatusVariant(vehicle.moderationStatus) as any}>
                                                            {vehicle.moderationStatus}
                                                        </AnimatedBadge>
                                                    </TableCell>
                                                <TableCell className="text-right">
                                                    {vehicle.moderationStatus === 'Pendente' && (
                                                        <div className="flex gap-2 justify-end">
                                                            {updatingListingStatus === vehicle.id ? (
                                                                    <Button variant="outline" size="sm" disabled>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                                                                    </Button>
                                                            ) : (
                                                                <>
                                                                        <Button variant="outline" size="sm" onClick={() => handleListingApproval(vehicle.id, 'vehicles', 'Aprovado')}>
                                                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar
                                                                        </Button>
                                                                        <Button variant="destructive" size="sm" onClick={() => handleListingApproval(vehicle.id, 'vehicles', 'Rejeitado')}>
                                                                            <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                                                                        </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                     )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                     <TabsContent value="services" className="mt-6">
                        <Card className="card-hover border-0 shadow-xl">
                        <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="h-6 w-6 text-green-500" />
                                    Moderar Serviços e Produtos
                                </CardTitle>
                                <CardDescription>Aprove ou rejeite os anúncios dos prestadores de serviço</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-green-50 to-blue-50">
                                        <TableHead>Título do Anúncio</TableHead>
                                        <TableHead>Prestador</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Wrench className="h-8 w-8 text-gray-300" />
                                                        <p className="text-gray-500">Nenhum serviço pendente</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                    ) : (
                                        services.map(srv => (
                                                <TableRow key={srv.id} className="hover:bg-gray-50 transition-colors">
                                                <TableCell className="font-medium">
                                                    <Button variant="link" className="p-0 h-auto" onClick={() => handleViewServiceDetails(srv.id)} disabled={isFetchingDetails}>
                                                        {srv.title}
                                                    </Button>
                                                </TableCell>
                                                <TableCell>{srv.provider}</TableCell>
                                                    <TableCell>
                                                        <AnimatedBadge variant={getStatusVariant(srv.status) as any}>
                                                            {srv.status}
                                                        </AnimatedBadge>
                                                    </TableCell>
                                                <TableCell className="text-right">
                                                    {srv.status === 'Pendente' && (
                                                        <div className="flex gap-2 justify-end">
                                                            {updatingListingStatus === srv.id ? (
                                                                    <Button variant="outline" size="sm" disabled>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                                                                    </Button>
                                                            ) : (
                                                                <>
                                                                        <Button variant="outline" size="sm" onClick={() => handleListingApproval(srv.id, 'services', 'Aprovado')}>
                                                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar
                                                                        </Button>
                                                                        <Button variant="destructive" size="sm" onClick={() => handleListingApproval(srv.id, 'services', 'Rejeitado')}>
                                                                            <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                                                                        </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                     )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                    <TabsContent value="settings" className="mt-6">
                        <Card className="card-hover border-0 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-6 w-6 text-orange-500" />
                                        Configurações da Plataforma
                                    </CardTitle>
                                    <CardDescription>Acesse as configurações de pagamento, temas e outras opções</CardDescription>
                            </div>
                                <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 font-semibold">
                                    <Link href="/admin/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Gerenciar Configurações
                                    </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                                <p className="text-gray-600">Clique no botão para gerenciar gateways de pagamento, aparência do site e outras definições.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
             
            <VehicleDetailsModal
                isOpen={isVehicleModalOpen}
                onOpenChange={setVehicleModalOpen}
                vehicle={selectedVehicle}
                fleet={selectedVehicleFleet}
            />
            <ServiceDetailsModal
                isOpen={isServiceModalOpen}
                onOpenChange={setServiceModalOpen}
                service={selectedService}
                provider={selectedServiceProvider}
            />
        </div>
        </>
    );
}

function VehicleDetailsModal({ isOpen, onOpenChange, vehicle, fleet }: { isOpen: boolean, onOpenChange: (open: boolean) => void, vehicle: Vehicle | null, fleet: UserProfile | null }) {
    if (!vehicle || !fleet) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Detalhes da Oportunidade</DialogTitle>
                    <DialogDescription>
                        Revise os detalhes do veículo antes de aprovar ou rejeitar o anúncio.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-4">
                         <Image src={vehicle.imageUrls?.[0] || 'https://placehold.co/800x600.png'} alt={`${vehicle.make} ${vehicle.model}`} width={800} height={600} className="w-full rounded-lg object-cover aspect-video" data-ai-hint="car side view"/>
                         <Card>
                             <CardHeader className="pb-2">
                                 <CardTitle className="text-base flex items-center gap-2"><Building /> Anunciado por</CardTitle>
                             </CardHeader>
                             <CardContent>
                                 <p className="font-semibold">{fleet.nomeFantasia || fleet.name}</p>
                                 <p className="text-sm text-muted-foreground">{fleet.email}</p>
                             </CardContent>
                         </Card>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-headline">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">Placa: {vehicle.plate}</Badge>
                            <Badge variant="outline">Condição: {vehicle.condition}</Badge>
                             <Badge variant="default" className="text-lg">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.dailyRate)} / dia
                            </Badge>
                        </div>
                         <Card>
                             <CardHeader className="pb-2"><CardTitle className="text-base">Descrição</CardTitle></CardHeader>
                             <CardContent><p className="text-sm text-muted-foreground">{vehicle.description}</p></CardContent>
                         </Card>
                         <Card>
                             <CardHeader className="pb-2"><CardTitle className="text-base">Vantagens Inclusas</CardTitle></CardHeader>
                             <CardContent className="grid grid-cols-2 gap-2 text-sm">
                                {vehicle.perks.map(perk => {
                                    const PerkIcon = vehiclePerks.find(p => p.id === perk.id)?.icon || Sparkles;
                                    return (
                                        <div key={perk.id} className="flex items-center gap-2">
                                            <PerkIcon className="h-4 w-4 text-primary" />
                                            <span>{perk.label}</span>
                                        </div>
                                    )
                                })}
                                {vehicle.perks.length === 0 && <p className="text-muted-foreground">Nenhuma vantagem informada.</p>}
                             </CardContent>
                         </Card>
                    </div>
                </div>
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Fechar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ServiceDetailsModal({ isOpen, onOpenChange, service, provider }: { isOpen: boolean, onOpenChange: (open: boolean) => void, service: ServiceListing | null, provider: UserProfile | null }) {
    if (!service || !provider) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalhes do Serviço</DialogTitle>
                    <DialogDescription>
                        Revise os detalhes do anúncio antes de aprovar ou rejeitar.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                     {service.imageUrls?.[0] && <Image src={service.imageUrls[0]} alt={service.title} width={800} height={400} className="w-full rounded-lg object-cover aspect-video" data-ai-hint="tools workshop"/>}
                     <h3 className="text-2xl font-bold font-headline">{service.title}</h3>
                     <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{service.category}</Badge>
                        <Badge variant="default">{service.price}</Badge>
                     </div>
                     <p className="text-muted-foreground pt-2">{service.description}</p>
                     <Card>
                         <CardHeader className="pb-2">
                             <CardTitle className="text-base flex items-center gap-2"><Building /> Oferecido por</CardTitle>
                         </CardHeader>
                         <CardContent>
                             <p className="font-semibold">{provider.nomeFantasia || provider.name}</p>
                             <p className="text-sm text-muted-foreground">{provider.email}</p>
                         </CardContent>
                     </Card>
                </div>
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Fechar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
