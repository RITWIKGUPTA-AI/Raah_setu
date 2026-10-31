import React, { useState } from 'react';
import {
  User,
  Bell,
  Map,
  Server,
  Shield,
  Check,
  Save,
  KeyRound,
  LogOut,
  Laptop,
  Smartphone,
  Radio,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Palette,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  INITIAL_OFFICER_PROFILE,
  INITIAL_NOTIFICATION_SETTINGS,
  INITIAL_MAP_PREFERENCES,
  INITIAL_SYSTEM_STATUS,
} from '../data/mockAnalyticsData';
import {
  OfficerProfile,
  NotificationSettings,
  MapPreferenceSettings,
  SystemStatusData,
} from '../types';
import { getMapTilerAuthInfo } from './map/mapProviders';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, themeOptions } = useTheme();

  // State
  const [profile, setProfile] = useState<OfficerProfile>(INITIAL_OFFICER_PROFILE);
  const [notifications, setNotifications] = useState<NotificationSettings>(INITIAL_NOTIFICATION_SETTINGS);
  const [mapPrefs, setMapPrefs] = useState<MapPreferenceSettings>(INITIAL_MAP_PREFERENCES);
  const [systemStatus] = useState<SystemStatusData>(INITIAL_SYSTEM_STATUS);

  const [activeSessions, setActiveSessions] = useState(INITIAL_SYSTEM_STATUS.activeSessions);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  // Handle toggle notifications
  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle map view change
  const handleMapViewChange = (view: MapPreferenceSettings['defaultMapView']) => {
    setMapPrefs((prev) => ({
      ...prev,
      defaultMapView: view,
    }));
  };

  // Handle layer toggle
  const toggleLayer = (layer: keyof MapPreferenceSettings['defaultLayers']) => {
    setMapPrefs((prev) => ({
      ...prev,
      defaultLayers: {
        ...prev.defaultLayers,
        [layer]: !prev.defaultLayers[layer],
      },
    }));
  };

  // Save changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Revoke session
  const handleRevokeSession = (sessionId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  // Handle password submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.new) {
      setPasswordStatus('Please fill in all password fields.');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordStatus('New passwords do not match.');
      return;
    }
    setPasswordStatus('Password updated successfully.');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordStatus(null);
      setPasswordForm({ current: '', new: '', confirm: '' });
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* 1. Page Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5 shadow-2xs shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Settings
            </h1>
            <span className="inline-flex items-center rounded-sm bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 border border-slate-200">
              System Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage account and portal preferences
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-1.5 rounded bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 animate-in fade-in">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      {/* Main Settings Body */}
      <div className="p-4 max-w-4xl mx-auto w-full space-y-6">
        {/* APPEARANCE & BACKGROUND THEME */}
        <section className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 bg-slate-50/70">
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Appearance & Background Color
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Active: <strong className="text-blue-600 capitalize">{themeOptions.find((t) => t.id === theme)?.name}</strong>
            </span>
          </div>

          <div className="p-4">
            <p className="text-xs text-slate-600 mb-3.5 leading-relaxed">
              Switch the workspace background and pure white surfaces across the entire portal between Pure White, Dark mode, Bone, Powder, and Frost color styles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {themeOptions.map((opt) => {
                const isActive = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    id={`settings-theme-card-${opt.id}`}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={`relative flex flex-col rounded-lg border text-left p-3 transition-all cursor-pointer ${
                      isActive
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                    style={{ backgroundColor: opt.surfaceHex }}
                  >
                    {/* Visual Card Preview */}
                    <div
                      className="w-full h-16 rounded border p-2 mb-2.5 flex flex-col justify-between shadow-2xs transition-transform group-hover:scale-102"
                      style={{
                        backgroundColor: opt.bgAppHex,
                        borderColor: opt.borderHex,
                      }}
                    >
                      <div
                        className="w-full h-6 rounded border px-1.5 flex items-center justify-between"
                        style={{
                          backgroundColor: opt.surfaceHex,
                          borderColor: opt.borderHex,
                        }}
                      >
                        <span
                          className="text-[9px] font-bold tracking-tight"
                          style={{ color: opt.textHex }}
                        >
                          VECTOR
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              opt.id === 'dark'
                                ? '#38BDF8'
                                : opt.id === 'bone'
                                ? '#D97706'
                                : opt.id === 'powder'
                                ? '#0284C7'
                                : opt.id === 'frost'
                                ? '#0D9488'
                                : '#2563EB',
                          }}
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <div
                          className="h-1.5 w-10 rounded-full"
                          style={{
                            backgroundColor: opt.id === 'dark' ? '#334155' : '#CBD5E1',
                          }}
                        />
                        <div
                          className="h-1.5 w-4 rounded-full"
                          style={{
                            backgroundColor: opt.id === 'dark' ? '#1E293B' : '#E2E8F0',
                          }}
                        />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-bold leading-tight"
                        style={{ color: opt.textHex }}
                      >
                        {opt.name}
                      </span>
                      {isActive && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      )}
                    </div>

                    <span
                      className="text-[10px] leading-tight line-clamp-2"
                      style={{
                        color: opt.id === 'dark' ? '#94A3B8' : '#64748B',
                      }}
                    >
                      {opt.description}
                    </span>

                    {/* Active Badge */}
                    <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                        {opt.id}
                      </span>
                      {isActive ? (
                        <span className="font-semibold text-blue-600">Active</span>
                      ) : (
                        <span className="text-slate-400 hover:text-slate-600">Apply</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 1: PROFILE */}
        <section className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center space-x-2 border-b border-slate-100 px-4 py-2.5 bg-slate-50/70">
            <User className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Profile
            </h2>
          </div>

          <form onSubmit={handleSaveProfile} className="divide-y divide-slate-100 text-xs">
            {/* Officer Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2">
              <div className="sm:w-1/3">
                <span className="font-semibold text-slate-900">Officer Name</span>
                <p className="text-[11px] text-slate-500">Official name on emergency transport manifest</p>
              </div>
              <div className="sm:w-2/3">
                <input
                  type="text"
                  value={profile.officerName}
                  onChange={(e) => setProfile({ ...profile, officerName: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Department */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2">
              <div className="sm:w-1/3">
                <span className="font-semibold text-slate-900">Department</span>
                <p className="text-[11px] text-slate-500">Cadre and command administrative wing</p>
              </div>
              <div className="sm:w-2/3">
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2">
              <div className="sm:w-1/3">
                <span className="font-semibold text-slate-900">Role</span>
                <p className="text-[11px] text-slate-500">Security clearance authorization level</p>
              </div>
              <div className="sm:w-2/3 flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 inline-flex items-center space-x-1 rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  <Save className="h-3 w-3" />
                  <span>Update</span>
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* SECTION 2: NOTIFICATIONS */}
        <section className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center space-x-2 border-b border-slate-100 px-4 py-2.5 bg-slate-50/70">
            <Bell className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Notifications
            </h2>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Critical Incidents */}
            <div className="flex items-center justify-between p-3.5">
              <div>
                <span className="font-semibold text-slate-900">Critical Incidents</span>
                <p className="text-[11px] text-slate-500">
                  Instant dispatch alerts for major bridge breaches and active mudslides
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={notifications.criticalIncidents}
                  onChange={() => toggleNotification('criticalIncidents')}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none" />
              </label>
            </div>

            {/* Route Disruptions */}
            <div className="flex items-center justify-between p-3.5">
              <div>
                <span className="font-semibold text-slate-900">Route Disruptions</span>
                <p className="text-[11px] text-slate-500">
                  Highway closure warnings, alternate bypass prompts, and single-lane bottlenecks
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={notifications.routeDisruptions}
                  onChange={() => toggleNotification('routeDisruptions')}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none" />
              </label>
            </div>

            {/* Vehicle Delays */}
            <div className="flex items-center justify-between p-3.5">
              <div>
                <span className="font-semibold text-slate-900">Vehicle Delays</span>
                <p className="text-[11px] text-slate-500">
                  Alert when medical or petroleum convoys exceed 45 minutes beyond planned schedule
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={notifications.vehicleDelays}
                  onChange={() => toggleNotification('vehicleDelays')}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none" />
              </label>
            </div>

            {/* Weather Alerts */}
            <div className="flex items-center justify-between p-3.5">
              <div>
                <span className="font-semibold text-slate-900">Weather Alerts</span>
                <p className="text-[11px] text-slate-500">
                  IMD Doppler radar warnings (heavy precipitation &gt; 35mm/hr in catchment basins)
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={notifications.weatherAlerts}
                  onChange={() => toggleNotification('weatherAlerts')}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none" />
              </label>
            </div>
          </div>
        </section>

        {/* SECTION 3: MAP PREFERENCES */}
        <section className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center space-x-2 border-b border-slate-100 px-4 py-2.5 bg-slate-50/70">
            <Map className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Map Preferences
            </h2>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Default Map View */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2">
              <div className="sm:w-1/3">
                <span className="font-semibold text-slate-900">Default Map View</span>
                <p className="text-[11px] text-slate-500">Initial basemap styling loaded across dashboards</p>
              </div>
              <div className="sm:w-2/3 flex flex-wrap gap-2">
                {[
                  { id: 'tactical', label: 'Tactical GIS' },
                  { id: 'satellite', label: 'Satellite Hybrid' },
                  { id: 'topographic', label: 'Topographic Relief' },
                  { id: 'minimal', label: 'Minimal Grey' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMapViewChange(item.id as any)}
                    className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                      mapPrefs.defaultMapView === item.id
                        ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Layers */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between p-3.5 gap-2">
              <div className="sm:w-1/3">
                <span className="font-semibold text-slate-900">Default Layers</span>
                <p className="text-[11px] text-slate-500">Operational layers rendered on system launch</p>
              </div>
              <div className="sm:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'roads', label: 'Road Corridors' },
                  { id: 'incidents', label: 'Incident Markers' },
                  { id: 'vehicles', label: 'Freight Vehicles' },
                  { id: 'bridges', label: 'Bridge Sensors' },
                  { id: 'weatherRadar', label: 'Weather Radar' },
                  { id: 'riskPolygons', label: 'Risk Polygons' },
                ].map((layer) => (
                  <label
                    key={layer.id}
                    className="flex items-center space-x-2 rounded border border-slate-200 bg-slate-50/50 p-2 cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={mapPrefs.defaultLayers[layer.id as keyof MapPreferenceSettings['defaultLayers']]}
                      onChange={() => toggleLayer(layer.id as keyof MapPreferenceSettings['defaultLayers'])}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] font-medium text-slate-800">{layer.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: SYSTEM */}
        <section className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center space-x-2 border-b border-slate-100 px-4 py-2.5 bg-slate-50/70">
            <Server className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              System
            </h2>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Data Synchronization */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2">
              <div className="sm:w-1/3">
                <span className="font-semibold text-slate-900">Data Synchronization</span>
                <p className="text-[11px] text-slate-500">Live telemetry mesh status and refresh rate</p>
              </div>
              <div className="sm:w-2/3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs text-slate-800">
                    {systemStatus.dataSynchronization}
                  </span>
                </div>
              </div>
            </div>

            {/* API Status */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between p-3.5 gap-2">
              <div className="sm:w-1/3">
                <span className="font-semibold text-slate-900">API Status</span>
                <p className="text-[11px] text-slate-500">External national integration gateways</p>
              </div>
              <div className="sm:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    name: 'MapTiler Cloud API & Token',
                    status: getMapTilerAuthInfo().description,
                    isConfigured: getMapTilerAuthInfo().isConfigured,
                  },
                  { name: 'NIC Emergency Cloud', status: systemStatus.apiStatus.nicGateway, isConfigured: true },
                  { name: 'IMD Doppler Weather Feed', status: systemStatus.apiStatus.imdWeatherFeed, isConfigured: true },
                  { name: 'MoRTH Vahan & Sarathi', status: systemStatus.apiStatus.morthVahan, isConfigured: true },
                  { name: 'ISRO Bhuvan Spatial Feed', status: systemStatus.apiStatus.isroBhuvan, isConfigured: true },
                ].map((api) => (
                  <div
                    key={api.name}
                    className="flex items-center justify-between rounded border border-slate-200 bg-slate-50/60 px-2.5 py-1.5"
                  >
                    <span className="text-[11px] text-slate-700 font-medium">{api.name}</span>
                    <span
                      className={`inline-flex items-center space-x-1 text-[10px] font-semibold border rounded px-1.5 py-0.2 uppercase ${
                        api.isConfigured
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          api.isConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <span>{api.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Last System Update */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2">
              <div className="sm:w-1/3">
                <span className="font-semibold text-slate-900">Last System Update</span>
                <p className="text-[11px] text-slate-500">Current deployment build signature</p>
              </div>
              <div className="sm:w-2/3">
                <span className="font-mono text-xs text-slate-800 bg-slate-100 rounded px-2 py-0.5 border border-slate-200">
                  {systemStatus.lastSystemUpdate}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: SECURITY */}
        <section className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center space-x-2 border-b border-slate-100 px-4 py-2.5 bg-slate-50/70">
            <Shield className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Security
            </h2>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Change Password */}
            <div className="flex items-center justify-between p-3.5">
              <div>
                <span className="font-semibold text-slate-900">Change Password</span>
                <p className="text-[11px] text-slate-500">
                  Update GovNet single sign-on authentication credentials
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center space-x-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                <span>Change Password</span>
              </button>
            </div>

            {/* Active Sessions */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">Active Sessions</span>
                  <p className="text-[11px] text-slate-500">
                    Authorized dispatch hardware terminals currently logged into your account
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded border border-slate-200 bg-slate-50/50 p-2 text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      {session.device.includes('Tablet') ? (
                        <Smartphone className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Laptop className="h-4 w-4 text-slate-500" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800">{session.device}</span>
                          {session.isCurrent && (
                            <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.2 text-[9px] font-semibold text-blue-700">
                              Current Node
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {session.ip} • {session.location} • {session.lastActive}
                        </div>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <div className="flex items-center justify-between p-3.5 bg-rose-50/20">
              <div>
                <span className="font-semibold text-rose-900">Logout</span>
                <p className="text-[11px] text-rose-600/80">
                  End current administrative session on this terminal
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to end your active command session?')) {
                    alert('Session logged out.');
                  }
                }}
                className="inline-flex items-center space-x-1.5 rounded border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors shadow-2xs"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="Minimum 12 characters"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  placeholder="Confirm password"
                />
              </div>

              {passwordStatus && (
                <div className={`p-2 rounded text-[11px] ${
                  passwordStatus.includes('successfully')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {passwordStatus}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
