'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Users, Target } from 'lucide-react';

interface FinancialCalculatorProps {
    darkMode?: boolean;
}

export default function FinancialCalculator({ darkMode = false }: FinancialCalculatorProps) {
    const [activeTab, setActiveTab] = useState<'revenue' | 'cac' | 'ltv' | 'runway'>('revenue');

    // Revenue Calculator
    const [monthlyCustomers, setMonthlyCustomers] = useState(100);
    const [avgRevenue, setAvgRevenue] = useState(50);
    const [growthRate, setGrowthRate] = useState(10);

    // CAC Calculator
    const [marketingSpend, setMarketingSpend] = useState(10000);
    const [newCustomers, setNewCustomers] = useState(50);

    // LTV Calculator
    const [avgOrderValue, setAvgOrderValue] = useState(100);
    const [purchaseFrequency, setPurchaseFrequency] = useState(12);
    const [customerLifespan, setCustomerLifespan] = useState(3);

    // Runway Calculator
    const [currentCash, setCurrentCash] = useState(100000);
    const [monthlyBurn, setMonthlyBurn] = useState(15000);

    const calculateRevenue = () => {
        const monthly = monthlyCustomers * avgRevenue;
        const yearly = monthly * 12;
        const yearlyWithGrowth = yearly * (1 + growthRate / 100);
        return { monthly, yearly, yearlyWithGrowth };
    };

    const calculateCAC = () => {
        return newCustomers > 0 ? marketingSpend / newCustomers : 0;
    };

    const calculateLTV = () => {
        return avgOrderValue * purchaseFrequency * customerLifespan;
    };

    const calculateRunway = () => {
        return monthlyBurn > 0 ? currentCash / monthlyBurn : 0;
    };

    const revenue = calculateRevenue();
    const cac = calculateCAC();
    const ltv = calculateLTV();
    const runway = calculateRunway();
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    const cardBg = darkMode ? 'bg-slate-800' : 'bg-white';
    const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
    const mutedText = darkMode ? 'text-slate-400' : 'text-slate-600';
    const borderClass = darkMode ? 'border-slate-700' : 'border-slate-200';

    const tabs = [
        { id: 'revenue', label: 'Revenue', icon: DollarSign },
        { id: 'cac', label: 'CAC', icon: Users },
        { id: 'ltv', label: 'LTV', icon: Target },
        { id: 'runway', label: 'Runway', icon: TrendingUp }
    ];

    return (
        <div className={`${cardBg} rounded-xl border ${borderClass} p-6 shadow-sm`}>
            <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-blue-500" />
                <h3 className={`text-lg font-bold ${textClass}`}>Financial Calculator</h3>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-blue-500 text-white'
                                    : `${mutedText} hover:bg-slate-100 ${darkMode ? 'hover:bg-slate-700' : ''}`
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Revenue Calculator */}
            {activeTab === 'revenue' && (
                <div className="space-y-4">
                    <div>
                        <label className={`text-sm font-medium ${textClass} block mb-2`}>
                            Monthly Customers
                        </label>
                        <input
                            type="number"
                            value={monthlyCustomers}
                            onChange={(e) => setMonthlyCustomers(Number(e.target.value))}
                            className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-700' : ''}`}
                        />
                    </div>
                    <div>
                        <label className={`text-sm font-medium ${textClass} block mb-2`}>
                            Average Revenue per Customer ($)
                        </label>
                        <input
                            type="number"
                            value={avgRevenue}
                            onChange={(e) => setAvgRevenue(Number(e.target.value))}
                            className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-700' : ''}`}
                        />
                    </div>
                    <div>
                        <label className={`text-sm font-medium ${textClass} block mb-2`}>
                            Annual Growth Rate (%)
                        </label>
                        <input
                            type="number"
                            value={growthRate}
                            onChange={(e) => setGrowthRate(Number(e.target.value))}
                            className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-700' : ''}`}
                        />
                    </div>
                    <div className={`p-4 bg-blue-50 ${darkMode ? 'bg-blue-900/20' : ''} rounded-lg space-y-2`}>
                        <div className="flex justify-between">
                            <span className={mutedText}>Monthly Revenue:</span>
                            <span className={`font-bold ${textClass}`}>${revenue.monthly.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className={mutedText}>Yearly Revenue:</span>
                            <span className={`font-bold ${textClass}`}>${revenue.yearly.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className={mutedText}>With Growth:</span>
                            <span className="font-bold text-green-600">${revenue.yearlyWithGrowth.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* CAC Calculator */}
            {activeTab === 'cac' && (
                <div className="space-y-4">
                    <div>
                        <label className={`text-sm font-medium ${textClass} block mb-2`}>
                            Monthly Marketing Spend ($)
                        </label>
                        <input
                            type="number"
                            value={marketingSpend}
                            onChange={(e) => setMarketingSpend(Number(e.target.value))}
                            className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-700' : ''}`}
                        />
                    </div>
                    <div>
                        <label className={`text-sm font-medium ${textClass} block mb-2`}>
                            New Customers Acquired
                        </label>
                        <input
                            type="number"
                            value={newCustomers}
                            onChange={(e) => setNewCustomers(Number(e.target.value))}
                            className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-700' : ''}`}
                        />
                    </div>
                    <div className={`p-4 bg-purple-50 ${darkMode ? 'bg-purple-900/20' : ''} rounded-lg space-y-2`}>
                        <div className="flex justify-between">
                            <span className={mutedText}>Customer Acquisition Cost:</span>
                            <span className={`font-bold text-2xl ${textClass}`}>${cac.toFixed(2)}</span>
                        </div>
                        <p className={`text-xs ${mutedText} mt-2`}>
                            {cac < 100 ? '✅ Excellent CAC' : cac < 300 ? '⚠️ Moderate CAC' : '❌ High CAC - optimize marketing'}
                        </p>
                    </div>
                </div>
            )}

            {/* LTV Calculator */}
            {activeTab === 'ltv' && (
                <div className="space-y-4">
                    <div>
                        <label className={`text-sm font-medium ${textClass} block mb-2`}>
                            Average Order Value ($)
                        </label>
                        <input
                            type="number"
                            value={avgOrderValue}
                            onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                            className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-700' : ''}`}
                        />
                    </div>
                    <div>
                        <label className={`text-sm font-medium ${textClass} block mb-2`}>
                            Purchase Frequency (per year)
                        </label>
                        <input
                            type="number"
                            value={purchaseFrequency}
                            onChange={(e) => setPurchaseFrequency(Number(e.target.value))}
                            className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-700' : ''}`}
                        />
                    </div>
                    <div>
                        <label className={`text-sm font-medium ${textClass} block mb-2`}>
                            Customer Lifespan (years)
                        </label>
                        <input
                            type="number"
                            value={customerLifespan}
                            onChange={(e) => setCustomerLifespan(Number(e.target.value))}
                            className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-700' : ''}`}
                        />
                    </div>
                    <div className={`p-4 bg-green-50 ${darkMode ? 'bg-green-900/20' : ''} rounded-lg space-y-2`}>
                        <div className="flex justify-between">
                            <span className={mutedText}>Customer Lifetime Value:</span>
                            <span className={`font-bold text-2xl ${textClass}`}>${ltv.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className={mutedText}>LTV:CAC Ratio:</span>
                            <span className={`font-bold ${ltvCacRatio >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                                {ltvCacRatio.toFixed(1)}:1
                            </span>
                        </div>
                        <p className={`text-xs ${mutedText} mt-2`}>
                            {ltvCacRatio >= 3 ? '✅ Healthy ratio (3:1 or better)' : '⚠️ Aim for 3:1 or higher'}
                        </p>
                    </div>
                </div>
            )}

            {/* Runway Calculator */}
            {activeTab === 'runway' && (
                <div className="space-y-4">
                    <div>
                        <label className={`text-sm font-medium ${textClass} block mb-2`}>
                            Current Cash ($)
                        </label>
                        <input
                            type="number"
                            value={currentCash}
                            onChange={(e) => setCurrentCash(Number(e.target.value))}
                            className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-700' : ''}`}
                        />
                    </div>
                    <div>
                        <label className={`text-sm font-medium ${textClass} block mb-2`}>
                            Monthly Burn Rate ($)
                        </label>
                        <input
                            type="number"
                            value={monthlyBurn}
                            onChange={(e) => setMonthlyBurn(Number(e.target.value))}
                            className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-700' : ''}`}
                        />
                    </div>
                    <div className={`p-4 bg-orange-50 ${darkMode ? 'bg-orange-900/20' : ''} rounded-lg space-y-2`}>
                        <div className="flex justify-between">
                            <span className={mutedText}>Runway:</span>
                            <span className={`font-bold text-2xl ${textClass}`}>{runway.toFixed(1)} months</span>
                        </div>
                        <p className={`text-xs ${mutedText} mt-2`}>
                            {runway >= 18 ? '✅ Healthy runway' : runway >= 12 ? '⚠️ Consider fundraising soon' : '❌ Critical - fundraise immediately'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
