import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import Input from '../components/ui/Input'
import { signOut } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('TEV Africa Foods')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    alert('Settings saved successfully')
  }

  const handleLogout = async () => {
    await signOut()
    localStorage.removeItem('auth_session')
    navigate('/login')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your application settings</p>
      </div>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Application:</span>
            <span className="font-medium">TEV Africa Foods Manufacturing</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Version:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Environment:</span>
            <span className="font-medium">Development</span>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Sign Out</h3>
              <p className="text-sm text-gray-500">Sign out of your account</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
