import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from '../lib/auth'
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Thermometer, 
  CheckCircle, 
  History, 
  Settings, 
  LogOut, 
  Bell,
  Menu,
  X,
  BarChart3,
  TrendingUp,
  Shield,
  Activity,
  Gauge
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleSignOut = async () => {
    console.log('Signing out...')
    localStorage.removeItem('auth_session')
    await signOut()
    console.log('Navigating to login')
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { section: 'Production' },
    { name: 'Batch Management', href: '/batches', icon: Package },
    { name: 'Incoming Receipt', href: '/incoming-receipt', icon: ClipboardList, requiresBatch: true },
    { name: 'Sortex Checklist', href: '/sortex-checklist', icon: ClipboardList, requiresBatch: true },
    { name: 'Sorting Efficiency', href: '/sorting-efficiency', icon: ClipboardList, requiresBatch: true },
    { name: 'Roasting Temperature', href: '/roasting-temperature', icon: Thermometer, requiresBatch: true },
    { name: 'Finished Goods', href: '/finished-goods', icon: CheckCircle, requiresBatch: true },
    { section: 'Sortex QC' },
    { name: 'Daily Summary', href: '/sortex/daily-summary', icon: BarChart3 },
    { name: 'Weekly Summary', href: '/sortex/weekly-summary', icon: TrendingUp },
    { section: 'Quality Monitoring' },
    { name: 'Overall Overview', href: '/monitoring/overall', icon: Activity },
    { name: 'Batch Comparison', href: '/monitoring/batch-comparison', icon: Activity },
    { name: 'Sortex Live Monitor', href: '/monitoring/sortex-live', icon: Gauge, requiresBatch: true },
    { name: 'Roasting Monitor', href: '/monitoring/roasting', icon: Thermometer, requiresBatch: true },
    { name: 'Manager Dashboard', href: '/monitoring/manager', icon: Shield },
    { section: 'Traceability' },
    { name: 'Batch Traceability', href: '/traceability', icon: History, requiresBatch: true },
    { section: 'System' },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path === '/batches') return 'Batch Management'
    if (path.startsWith('/incoming-receipt')) return 'Incoming Receipt'
    if (path.startsWith('/sortex-checklist')) return 'Sortex Checklist'
    if (path.startsWith('/sorting-efficiency')) return 'Sorting Efficiency'
    if (path.startsWith('/roasting-temperature')) return 'Roasting Temperature'
    if (path.startsWith('/finished-goods')) return 'Finished Goods'
    if (path.startsWith('/traceability')) return 'Batch Traceability'
    if (path === '/sortex/daily-summary') return 'Sortex Daily Summary'
    if (path === '/sortex/weekly-summary') return 'Sortex Weekly Summary'
    if (path === '/monitoring/overall') return 'Overall Quality Overview'
    if (path === '/monitoring/batch-comparison') return 'Batch Comparison Dashboard'
    if (path.startsWith('/monitoring/sortex-live')) return 'Sortex Live Monitoring'
    if (path.startsWith('/monitoring/roasting')) return 'Roasting Monitoring Dashboard'
    if (path === '/monitoring/manager') return 'Manager Dashboard'
    return 'Dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img src="/logo.png" alt="TEV Africa Foods" className="h-10 w-auto mr-2" />
          <h1 className="text-xl font-bold text-primary-800">TEV Africa Foods</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {navigation.map((item) => {
            if (item.section) {
              return (
                <div key={item.section} className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {item.section}
                </div>
              )
            }
            if (!item.href) return null
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
                <img src="/logo.png" alt="TEV Africa Foods" className="h-8 w-auto mr-2" />
                <h1 className="text-xl font-bold text-primary-800">TEV Africa Foods</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
              {navigation.map((item) => {
                if (item.section) {
                  return (
                    <div key={item.section} className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {item.section}
                    </div>
                  )
                }
                if (!item.href) return null
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="ml-4 lg:ml-0 text-lg font-semibold text-gray-900">
                {getPageTitle()}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-gray-500">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-accent-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
