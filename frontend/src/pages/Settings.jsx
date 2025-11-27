import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Globe, Mail, Database } from 'lucide-react';

export default function Settings({ user }) {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure system preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-lg border border-gray-200 p-2 space-y-1">
            {[
              { id: 'general', label: 'General', icon: SettingsIcon },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'email', label: 'Email Settings', icon: Mail },
              { id: 'system', label: 'System', icon: Database },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'profile' && <ProfileSettings user={user} />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'email' && <EmailSettings />}
            {activeTab === 'system' && <SystemSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
          <input type="text" defaultValue="ExportSuite Ltd." className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
            <option>USD - US Dollar</option>
            <option>EUR - Euro</option>
            <option>GBP - British Pound</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
            <option>UTC</option>
            <option>America/New_York</option>
            <option>Europe/London</option>
            <option>Asia/Singapore</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
            <option>MM/DD/YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>

        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function ProfileSettings({ user }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h2>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-semibold">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Change Avatar
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input type="text" defaultValue={user.name} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" defaultValue={user.email} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <input type="text" defaultValue={user.role} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" />
        </div>

        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
          Update Profile
        </button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Email Notifications', desc: 'Receive email notifications for important updates' },
          { label: 'Order Updates', desc: 'Get notified when orders status changes' },
          { label: 'Shipment Alerts', desc: 'Receive alerts for shipment tracking updates' },
          { label: 'Low Inventory Warnings', desc: 'Alert when inventory falls below reorder level' },
          { label: 'Daily Summary', desc: 'Receive daily summary of activities' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input type="password" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input type="password" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input type="password" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
        </div>

        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
          Change Password
        </button>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Two-Factor Authentication</h3>
        <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account</p>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Enable 2FA
        </button>
      </div>
    </div>
  );
}

function EmailSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">Email configuration requires SMTP setup. Contact your administrator.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
          <input type="text" placeholder="smtp.example.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
            <input type="text" defaultValue="587" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
            <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
              <option>TLS</option>
              <option>SSL</option>
              <option>None</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input type="password" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
        </div>

        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
          Test Connection
        </button>
      </div>
    </div>
  );
}

function SystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between py-3 border-b border-gray-200">
          <span className="text-sm text-gray-600">Version</span>
          <span className="text-sm font-medium text-gray-900">3.0.0</span>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-200">
          <span className="text-sm text-gray-600">Database</span>
          <span className="text-sm font-medium text-gray-900">MongoDB</span>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-200">
          <span className="text-sm text-gray-600">Server Status</span>
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
            Online
          </span>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-200">
          <span className="text-sm text-gray-600">Last Backup</span>
          <span className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Maintenance</h3>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-left">
            Clear Cache
          </button>
          <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-left">
            Database Backup
          </button>
          <button className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-left">
            Reset System (Danger)
          </button>
        </div>
      </div>
    </div>
  );
}
