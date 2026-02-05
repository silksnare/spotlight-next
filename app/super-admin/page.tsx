'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Types
interface Phase {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
}

interface UserAccount {
  id: number
  name: string
  email: string
  role: 'judge' | 'admin'
  region?: string
  createdAt: string
}

interface ImageAsset {
  id: string
  name: string
  type: 'background' | 'logo' | 'banner' | 'other'
  url: string
}

// Color Picker Component
function ColorPicker({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <h4 className="font-medium text-gray-900">{label}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border-2 border-gray-200 shadow-inner"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 cursor-pointer rounded border-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded font-mono"
        />
      </div>
    </div>
  )
}

// Toggle Switch Component
function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// Phase Card Component
function PhaseCard({
  phase,
  onUpdate,
}: {
  phase: Phase
  onUpdate: (phase: Phase) => void
}) {
  return (
    <div className={`border rounded-lg p-5 ${phase.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-900">{phase.name}</h4>
          <p className="text-sm text-gray-500">{phase.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${phase.isActive ? 'text-green-600' : 'text-gray-400'}`}>
            {phase.isActive ? 'Active' : 'Inactive'}
          </span>
          <Toggle
            enabled={phase.isActive}
            onChange={(isActive) => onUpdate({ ...phase, isActive })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
          <input
            type="datetime-local"
            value={phase.startDate}
            onChange={(e) => onUpdate({ ...phase, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
          <input
            type="datetime-local"
            value={phase.endDate}
            onChange={(e) => onUpdate({ ...phase, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  )
}

// Image Upload Card
function ImageUploadCard({
  asset,
  onUpload,
  onRemove,
}: {
  asset: ImageAsset
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{asset.name}</h4>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 capitalize">{asset.type}</span>
      </div>
      {asset.url ? (
        <div className="relative">
          <img
            src={asset.url}
            alt={asset.name}
            className="w-full h-32 object-cover rounded-lg"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-500">Click to upload</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      )}
    </div>
  )
}

// Section Header
function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  )
}

export default function SuperAdminPage() {
  // Theme Colors State
  const [colors, setColors] = useState({
    primary: '#f97316',
    secondary: '#eab308',
    highlight: '#ef4444',
    background: '#ffffff',
  })

  // Phases State
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 'registration',
      name: 'Registration',
      description: 'Users can register and create accounts',
      startDate: '2025-08-01T00:00',
      endDate: '2025-08-14T23:59',
      isActive: true,
    },
    {
      id: 'submission',
      name: 'Video Submission',
      description: 'Participants can upload their videos',
      startDate: '2025-08-15T00:00',
      endDate: '2025-09-05T23:59',
      isActive: true,
    },
    {
      id: 'judging',
      name: 'Judging',
      description: 'Judges review and score submissions',
      startDate: '2025-09-06T00:00',
      endDate: '2025-09-11T23:59',
      isActive: false,
    },
    {
      id: 'voting',
      name: 'Peer Voting',
      description: 'Participants vote for their favorites',
      startDate: '2025-09-12T00:00',
      endDate: '2025-09-17T23:59',
      isActive: false,
    },
    {
      id: 'results',
      name: 'Results',
      description: 'Winners are announced',
      startDate: '2025-09-18T00:00',
      endDate: '2025-09-30T23:59',
      isActive: false,
    },
  ])

  // Image Assets State
  const [imageAssets, setImageAssets] = useState<ImageAsset[]>([
    { id: 'hero-bg', name: 'Hero Background', type: 'background', url: 'https://picsum.photos/seed/hero/800/400' },
    { id: 'logo', name: 'Site Logo', type: 'logo', url: '' },
    { id: 'banner', name: 'Promotional Banner', type: 'banner', url: '' },
    { id: 'footer-bg', name: 'Footer Background', type: 'background', url: '' },
  ])

  // User Accounts State
  const [users, setUsers] = useState<UserAccount[]>([
    { id: 1, name: 'John Smith', email: 'john.smith@example.com', role: 'judge', region: 'West Coast', createdAt: '2025-01-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@example.com', role: 'judge', region: 'East Coast', createdAt: '2025-01-16' },
    { id: 3, name: 'Mike Wilson', email: 'mike.w@example.com', role: 'admin', createdAt: '2025-01-10' },
  ])

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'judge' as 'judge' | 'admin',
    region: '',
  })

  // Handlers
  const updatePhase = (updatedPhase: Phase) => {
    setPhases(phases.map((p) => (p.id === updatedPhase.id ? updatedPhase : p)))
  }

  const handleImageUpload = (assetId: string, file: File) => {
    const url = URL.createObjectURL(file)
    setImageAssets(imageAssets.map((a) => (a.id === assetId ? { ...a, url } : a)))
  }

  const handleImageRemove = (assetId: string) => {
    setImageAssets(imageAssets.map((a) => (a.id === assetId ? { ...a, url: '' } : a)))
  }

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) return
    const user: UserAccount = {
      id: Date.now(),
      ...newUser,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setUsers([...users, user])
    setNewUser({ name: '', email: '', role: 'judge', region: '' })
  }

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((u) => u.id !== userId))
  }

  const handleSaveAll = () => {
    alert('Settings saved successfully!')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin</h1>
          <p className="text-gray-500 mt-1">Manage site settings, content, phases, and user accounts</p>
        </div>

        <div className="space-y-10">
          {/* Theme & Branding Section */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <SectionHeader
              title="Theme & Branding"
              description="Customize the look and feel of your site"
            />
            <div className="space-y-4">
              <ColorPicker
                label="Primary Color"
                description="Main brand color used for buttons and accents"
                value={colors.primary}
                onChange={(primary) => setColors({ ...colors, primary })}
              />
              <ColorPicker
                label="Secondary Color"
                description="Supporting color for highlights and badges"
                value={colors.secondary}
                onChange={(secondary) => setColors({ ...colors, secondary })}
              />
              <ColorPicker
                label="Highlight Color"
                description="Used for important elements and CTAs"
                value={colors.highlight}
                onChange={(highlight) => setColors({ ...colors, highlight })}
              />
              <ColorPicker
                label="Background Color"
                description="Page background color"
                value={colors.background}
                onChange={(background) => setColors({ ...colors, background })}
              />
            </div>

            {/* Color Preview */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500 mb-3">Preview</p>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: colors.primary }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: colors.secondary }}
                >
                  Secondary
                </button>
                <button
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: colors.highlight }}
                >
                  Highlight
                </button>
              </div>
            </div>
          </section>

          {/* Image Assets Section */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <SectionHeader
              title="Image Assets"
              description="Upload and manage site images and backgrounds"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {imageAssets.map((asset) => (
                <ImageUploadCard
                  key={asset.id}
                  asset={asset}
                  onUpload={(file) => handleImageUpload(asset.id, file)}
                  onRemove={() => handleImageRemove(asset.id)}
                />
              ))}
            </div>
            <button className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Image Asset
            </button>
          </section>

          {/* Phase Management Section */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <SectionHeader
              title="Phase Management"
              description="Control program phases with dates and activation toggles"
            />
            <div className="space-y-4">
              {phases.map((phase) => (
                <PhaseCard key={phase.id} phase={phase} onUpdate={updatePhase} />
              ))}
            </div>

            {/* Phase Timeline Visual */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-3">Phase Timeline</p>
              <div className="flex items-center gap-2">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="flex items-center">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        phase.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {phase.name}
                    </div>
                    {index < phases.length - 1 && (
                      <svg className="w-4 h-4 text-gray-300 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* User Management Section */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <SectionHeader
              title="User Management"
              description="Create and manage judge and admin accounts"
            />

            {/* Create New User Form */}
            <div className="bg-gray-50 rounded-lg p-5 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Create New Account</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'judge' | 'admin' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="judge">Judge</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Region (Judges)</label>
                  <input
                    type="text"
                    value={newUser.region}
                    onChange={(e) => setNewUser({ ...newUser, region: e.target.value })}
                    placeholder="e.g., West Coast"
                    disabled={newUser.role !== 'judge'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleCreateUser}
                    disabled={!newUser.name || !newUser.email}
                    className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Region</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.region || '—'}</td>
                      <td className="py-3 px-4 text-gray-500">{user.createdAt}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Discard Changes
            </button>
            <button
              onClick={handleSaveAll}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
            >
              Save All Settings
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
