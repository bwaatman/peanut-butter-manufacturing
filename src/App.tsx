import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCurrentUser } from './lib/auth'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import BatchManagement from './pages/BatchManagement'
import IncomingReceiptForm from './pages/IncomingReceiptForm'
import SortingEfficiencyForm from './pages/SortingEfficiencyForm'
import RoastingTemperatureForm from './pages/RoastingTemperatureForm'
import FinishedGoodsForm from './pages/FinishedGoodsForm'
import BatchTraceability from './pages/BatchTraceability'
import BatchSelectPage from './pages/BatchSelectPage'
import Settings from './pages/Settings'
import DailySortexSummary from './pages/DailySortexSummary'
import WeeklySortexSummary from './pages/WeeklySortexSummary'
import BatchComparisonDashboard from './pages/BatchComparisonDashboard'
import SortexLiveMonitoring from './pages/SortexLiveMonitoring'
import RoastingMonitoringDashboard from './pages/RoastingMonitoringDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import SortexChecklistForm from './pages/SortexChecklistForm'
import OverallQualityOverview from './pages/OverallQualityOverview'
import Layout from './components/Layout'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { user } = await getCurrentUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/batches"
          element={
            <Layout>
              <BatchManagement />
            </Layout>
          }
        />
        <Route
          path="/incoming-receipt"
          element={
            <Layout>
              <BatchSelectPage
                title="Incoming Receipt"
                description="Select a batch to record incoming receipt information"
                getTargetPath={(batchId) => `/incoming-receipt/${batchId}`}
              />
            </Layout>
          }
        />
        <Route
          path="/incoming-receipt/:batchId"
          element={
            <Layout>
              <IncomingReceiptForm />
            </Layout>
          }
        />
        <Route
          path="/sortex-checklist"
          element={
            <Layout>
              <BatchSelectPage
                title="Sortex Checklist"
                description="Select a batch to record hourly Sortex checklist data"
                getTargetPath={(batchId) => `/sortex-checklist/${batchId}`}
              />
            </Layout>
          }
        />
        <Route
          path="/sortex-checklist/:batchId"
          element={
            <Layout>
              <SortexChecklistForm />
            </Layout>
          }
        />
        <Route
          path="/sorting-efficiency"
          element={
            <Layout>
              <BatchSelectPage
                title="Sorting Efficiency"
                description="Select a batch to record sorting efficiency data"
                getTargetPath={(batchId) => `/sorting-efficiency/${batchId}`}
              />
            </Layout>
          }
        />
        <Route
          path="/sorting-efficiency/:batchId"
          element={
            <Layout>
              <SortingEfficiencyForm />
            </Layout>
          }
        />
        <Route
          path="/roasting-temperature"
          element={
            <Layout>
              <BatchSelectPage
                title="Roasting Temperature"
                description="Select a batch to record roasting temperature data"
                getTargetPath={(batchId) => `/roasting-temperature/${batchId}`}
              />
            </Layout>
          }
        />
        <Route
          path="/roasting-temperature/:batchId"
          element={
            <Layout>
              <RoastingTemperatureForm />
            </Layout>
          }
        />
        <Route
          path="/finished-goods"
          element={
            <Layout>
              <BatchSelectPage
                title="Finished Goods"
                description="Select a batch to record finished goods data"
                getTargetPath={(batchId) => `/finished-goods/${batchId}`}
              />
            </Layout>
          }
        />
        <Route
          path="/finished-goods/:batchId"
          element={
            <Layout>
              <FinishedGoodsForm />
            </Layout>
          }
        />
        <Route
          path="/traceability"
          element={
            <Layout>
              <BatchSelectPage
                title="Batch Traceability"
                description="Select a batch to view traceability information"
                getTargetPath={(batchId) => `/traceability/${batchId}`}
              />
            </Layout>
          }
        />
        <Route
          path="/traceability/:batchId"
          element={
            <Layout>
              <BatchTraceability />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
        <Route
          path="/sortex/daily-summary"
          element={
            <Layout>
              <DailySortexSummary />
            </Layout>
          }
        />
        <Route
          path="/sortex/weekly-summary"
          element={
            <Layout>
              <WeeklySortexSummary />
            </Layout>
          }
        />
        <Route
          path="/monitoring/overall"
          element={
            <Layout>
              <OverallQualityOverview />
            </Layout>
          }
        />
        <Route
          path="/monitoring/batch-comparison"
          element={
            <Layout>
              <BatchComparisonDashboard />
            </Layout>
          }
        />
        <Route
          path="/monitoring/sortex-live"
          element={
            <Layout>
              <BatchSelectPage
                title="Sortex Live Monitoring"
                description="Select a batch to view live Sortex monitoring data"
                getTargetPath={(batchId) => `/monitoring/sortex-live/${batchId}`}
              />
            </Layout>
          }
        />
        <Route
          path="/monitoring/sortex-live/:batchId"
          element={
            <Layout>
              <SortexLiveMonitoring />
            </Layout>
          }
        />
        <Route
          path="/monitoring/roasting"
          element={
            <Layout>
              <BatchSelectPage
                title="Roasting Temperature Monitoring"
                description="Select a batch to view roasting temperature monitoring data"
                getTargetPath={(batchId) => `/monitoring/roasting/${batchId}`}
              />
            </Layout>
          }
        />
        <Route
          path="/monitoring/roasting/:batchId"
          element={
            <Layout>
              <RoastingMonitoringDashboard />
            </Layout>
          }
        />
        <Route
          path="/monitoring/manager"
          element={
            <Layout>
              <ManagerDashboard />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
