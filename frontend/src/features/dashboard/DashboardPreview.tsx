import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { Button } from '../../components/ui/Button'
import {
  Users,
  TrendingUp,
  DollarSign,
  Briefcase,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

export const DashboardPreview: React.FC = () => {
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const handleLogout = async () => {
    await logout()
    toast({
      type: 'info',
      title: 'Logged Out',
      description: 'You have been safely signed out.',
    })
  }

  const stats = [
    { label: 'Total Leads', value: '1,420', change: '+12.5%', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Deals Closed', value: '384', change: '+8.2%', icon: Briefcase, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Revenue Pipeline', value: '$248,000', change: '+19.4%', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Conversion Rate', value: '27.4%', change: '+3.1%', icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0b54b8] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              C
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-none">CRM Enterprise</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">Management Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
                <p className="text-[11px] text-slate-400 capitalize flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {user?.role} Role
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4 text-slate-600" />}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0b54b8] to-[#1466dc] text-white shadow-xl shadow-blue-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-200" /> Authenticated Session Active
            </div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
            <p className="text-blue-100 text-sm max-w-xl">
              Your login state and token are securely stored. All CRM modules, customer accounts, and pipeline metrics are ready.
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={handleLogout}
            className="bg-white text-blue-900 hover:bg-blue-50 font-semibold"
          >
            Back to Login View
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {s.label}
                  </span>
                  <div className={`p-2.5 rounded-xl ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900">{s.value}</span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {s.change}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
