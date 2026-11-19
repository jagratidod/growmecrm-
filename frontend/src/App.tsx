import React, { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { LeadsProvider } from './context/LeadsContext'
import { BookingsProvider } from './context/BookingsContext'
import { TeamProvider } from './context/TeamContext'
import { BillsProvider } from './context/BillsContext'
import { SettingsProvider } from './context/SettingsContext'
import { ItinerariesProvider } from './context/ItinerariesContext'
import { PackagesProvider } from './context/PackagesContext'
import { HotelsProvider } from './context/HotelsContext'
import { SightseeingProvider } from './context/SightseeingContext'
import { HostPageProvider } from './context/HostPageContext'
import { CallLogProvider } from './context/CallLogContext'
import { RouterProvider, useRouter } from './context/RouterContext'
import { AuthPage } from './features/auth/AuthPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { LeadsPage } from './features/leads/LeadsPage'
import { BookingsPage } from './features/bookings/BookingsPage'
import { TeamPage } from './features/team/TeamPage'
import { BillsPage } from './features/bills/BillsPage'
import { ItinerariesPage } from './features/itineraries/ItinerariesPage'
import { PackagesPage } from './features/packages/PackagesPage'
import { HotelsPage } from './features/hotels/HotelsPage'
import { SightseeingPage } from './features/sightseeing/SightseeingPage'
import { HostPage } from './features/hostPage/HostPage'
import { CallLogPage } from './features/callLog/CallLogPage'
import { ProfilePage } from './features/settings/ProfilePage'
import { ChannelsPage } from './features/settings/ChannelsPage'
import { AiAgentPage } from './features/settings/AiAgentPage'

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const { path, navigate } = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Base route enforcement: if not logged in and not on /login, redirect to /login
    if (!isAuthenticated && path !== '/login') {
      navigate('/login', { replace: true })
    }
  }, [isLoading, isAuthenticated, path, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Initializing CRM Session...</p>
        </div>
      </div>
    )
  }

  // Base route is /login: show AuthPage if path is /login or if unauthenticated
  const isLoginPage = path === '/login' || !isAuthenticated

  if (isLoginPage) {
    return <AuthPage onSuccess={() => navigate('/leads')} />
  }

  const handleMenuNavigation = (menuName: string) => {
    if (menuName === 'Dashboard') {
      navigate('/dashboard')
    } else if (menuName === 'Leads') {
      navigate('/leads')
    } else if (menuName === 'Bookings') {
      navigate('/bookings')
    } else if (menuName === 'Bills') {
      navigate('/bills')
    } else if (menuName === 'Team') {
      navigate('/team')
    } else if (menuName === 'Itineraries') {
      navigate('/itineraries')
    } else if (menuName === 'Packages') {
      navigate('/packages')
    } else if (menuName === 'Sightseeing') {
      navigate('/sightseeing')
    } else if (menuName === 'Hotels') {
      navigate('/hotels')
    } else if (menuName === 'Host Page') {
      navigate('/host-page')
    } else if (menuName === 'Call Log') {
      navigate('/call-log')
    } else if (menuName === 'My profile') {
      navigate('/profile')
    } else if (menuName === 'Channels') {
      navigate('/channels')
    } else if (menuName === 'AI Agent') {
      navigate('/ai-agent')
    } else {
      navigate('/leads')
    }
  }

  // Authenticated CRM Routes:
  if (path === '/bookings') {
    return <BookingsPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/bills') {
    return <BillsPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/team') {
    return <TeamPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/itineraries') {
    return <ItinerariesPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/packages') {
    return <PackagesPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/sightseeing') {
    return <SightseeingPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/hotels') {
    return <HotelsPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/host-page') {
    return <HostPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/call-log') {
    return <CallLogPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/profile') {
    return <ProfilePage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/channels') {
    return <ChannelsPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/ai-agent') {
    return <AiAgentPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/dashboard') {
    return <DashboardPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/leads') {
    return <LeadsPage onNavigateMenu={handleMenuNavigation} />
  }

  return <DashboardPage onNavigateMenu={handleMenuNavigation} />
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <LeadsProvider>
          <BookingsProvider>
            <TeamProvider>
              <BillsProvider>
                <ItinerariesProvider>
                  <PackagesProvider>
                    <HotelsProvider>
                      <SightseeingProvider>
                        <HostPageProvider>
                          <CallLogProvider>
                            <SettingsProvider>
                              <ToastProvider>
                                <AppContent />
                              </ToastProvider>
                            </SettingsProvider>
                          </CallLogProvider>
                        </HostPageProvider>
                      </SightseeingProvider>
                    </HotelsProvider>
                  </PackagesProvider>
                </ItinerariesProvider>
              </BillsProvider>
            </TeamProvider>
          </BookingsProvider>
        </LeadsProvider>
      </AuthProvider>
    </RouterProvider>
  )
}
