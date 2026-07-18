import { useState } from 'react';
import { supabase } from '../lib/supabase';
import AdminCopyInner from '../components/admin/AdminCopyInner';
import AdminPricingInner from '../components/admin/AdminPricingInner';
import AdminAddQuestion from '../components/admin/AdminAddQuestion';
import AdminCatalogInner from '../components/admin/AdminCatalogInner';
import ErrorBoundary from '../components/ErrorBoundary';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'questions' | 'pricing' | 'custom_questions' | 'catalog'>('pricing');

  return (
    <ErrorBoundary fallback={<div className="p-8 text-center text-red-600">Admin panel failed to load.</div>}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 shrink-0 bg-[#12294A] text-white flex flex-col">
          <div className="p-6 border-b border-[#1C3A64]">
            <h1 className="text-xl font-bold tracking-tight">FCD Admin</h1>
            <p className="text-xs text-slate-400 mt-1">Dashboard</p>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {([
              { id: 'pricing', label: 'Pricing Rules', icon: '💲' },
              { id: 'catalog', label: 'Baseboard/Casing', icon: '📏' },
              { id: 'questions', label: 'Edit Questions', icon: '✏️' },
              { id: 'custom_questions', label: 'Custom Questions', icon: '➕' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'bg-[#2F9BF0] text-white' : 'text-slate-300 hover:bg-[#1C3A64] hover:text-white'
                  }`}
              >
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-[#1C3A64]">
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              🚪 Sign out
            </button>
          </div>
        </div>


        {/* Main Content — fills remaining height; inner panels handle their own scroll */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === 'questions' && (
            <div className="flex-1 overflow-y-auto">
              <AdminCopyInner />
            </div>
          )}
          {activeTab === 'catalog' && (
            <div className="flex-1 overflow-y-auto">
              <AdminCatalogInner />
            </div>
          )}
          {activeTab === 'pricing' && (
            // AdminPricingInner is itself flex-row so we just let it fill
            <div className="flex-1 flex min-h-0">
              <AdminPricingInner />
            </div>
          )}
          {activeTab === 'custom_questions' && (
            <div className="flex-1 overflow-y-auto">
              <AdminAddQuestion />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
