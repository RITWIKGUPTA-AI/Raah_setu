import {
  AnalyticsDisruptionData,
  AnalyticsDelayData,
  AnalyticsDistrictScore,
  AnalyticsCategoryData,
  VulnerableCorridorItem,
  OfficerProfile,
  NotificationSettings,
  MapPreferenceSettings,
  SystemStatusData,
} from '../types';

// ======================================================================
// 1. ANALYTICS DATA (7-DAY & 30-DAY OPERATIONAL PERFORMANCE)
// ======================================================================

export const ANALYTICS_DISRUPTIONS_TREND: AnalyticsDisruptionData[] = [
  { date: '01 Sep', disruptions: 5, cleared: 4, blockedKm: 14 },
  { date: '02 Sep', disruptions: 7, cleared: 6, blockedKm: 22 },
  { date: '03 Sep', disruptions: 12, cleared: 8, blockedKm: 48 }, // Flash flood peak
  { date: '04 Sep', disruptions: 16, cleared: 11, blockedKm: 65 }, // Landslide wave
  { date: '05 Sep', disruptions: 11, cleared: 14, blockedKm: 38 },
  { date: '06 Sep', disruptions: 9, cleared: 12, blockedKm: 29 },
  { date: '07 Sep', disruptions: 8, cleared: 10, blockedKm: 24 }, // Current date
];

export const ANALYTICS_DELIVERY_DELAYS: AnalyticsDelayData[] = [
  { corridor: 'NH-10 (Sikkim)', avgDelayHours: 6.4, normHours: 2.0 },
  { corridor: 'NH-29 (Nagaland)', avgDelayHours: 4.8, normHours: 1.5 },
  { corridor: 'NH-6 (Meghalaya)', avgDelayHours: 3.5, normHours: 1.5 },
  { corridor: 'NH-102 (Manipur)', avgDelayHours: 5.2, normHours: 2.0 },
  { corridor: 'NH-27 (Assam)', avgDelayHours: 1.8, normHours: 1.0 },
  { corridor: 'NH-415 (Arunachal)', avgDelayHours: 3.9, normHours: 1.5 },
];

export const ANALYTICS_DISTRICT_CONNECTIVITY: AnalyticsDistrictScore[] = [
  { district: 'Kamrup Metro', state: 'Assam', connectivity: 96, blockedRoutes: 0 },
  { district: 'Papum Pare', state: 'Arunachal Pradesh', connectivity: 88, blockedRoutes: 1 },
  { district: 'Ri-Bhoi', state: 'Meghalaya', connectivity: 79, blockedRoutes: 2 },
  { district: 'Kohima', state: 'Nagaland', connectivity: 71, blockedRoutes: 3 },
  { district: 'East Sikkim', state: 'Sikkim', connectivity: 54, blockedRoutes: 5 },
  { district: 'Imphal West', state: 'Manipur', connectivity: 68, blockedRoutes: 3 },
  { district: 'Aizawl', state: 'Mizoram', connectivity: 84, blockedRoutes: 1 },
  { district: 'West Tripura', state: 'Tripura', connectivity: 92, blockedRoutes: 0 },
];

export const ANALYTICS_INCIDENT_CATEGORIES: AnalyticsCategoryData[] = [
  { name: 'Landslides & Mudflows', count: 28, percentage: 41.2, color: '#f59e0b' },
  { name: 'Flooding & Scour', count: 18, percentage: 26.5, color: '#06b6d4' },
  { name: 'Bridge Stress & Damage', count: 9, percentage: 13.2, color: '#e11d48' },
  { name: 'Pavement Washout', count: 8, percentage: 11.8, color: '#f97316' },
  { name: 'Heavy Freight Stoppage', count: 5, percentage: 7.3, color: '#6366f1' },
];

export const VULNERABLE_CORRIDORS_DATA: VulnerableCorridorItem[] = [
  {
    id: 'corridor-nh-10',
    corridor: 'NH-10 (Sevoke – Gangtok)',
    state: 'Sikkim',
    disruptions: 14,
    averageDelay: '6.4 hrs',
    risk: 'Critical',
    trend: 'increasing',
    primaryCause: 'Teesta River flood surge & 29th Mile mudslide',
    activeBlockages: 3,
  },
  {
    id: 'corridor-nh-29',
    corridor: 'NH-29 (Dimapur – Kohima)',
    state: 'Nagaland',
    disruptions: 9,
    averageDelay: '4.8 hrs',
    risk: 'Critical',
    trend: 'increasing',
    primaryCause: 'Pagla Pahar rockfall & subgrade sinkage',
    activeBlockages: 2,
  },
  {
    id: 'corridor-nh-102',
    corridor: 'NH-102 (Imphal – Moreh)',
    state: 'Manipur',
    disruptions: 8,
    averageDelay: '5.2 hrs',
    risk: 'High',
    trend: 'stable',
    primaryCause: 'Tengnoupal slope collapse & security checkpoints',
    activeBlockages: 2,
  },
  {
    id: 'corridor-nh-6',
    corridor: 'NH-6 (Jorabat – Silchar)',
    state: 'Meghalaya / Assam',
    disruptions: 7,
    averageDelay: '3.5 hrs',
    risk: 'High',
    trend: 'decreasing',
    primaryCause: 'Sonapur tunnel drainage siltation',
    activeBlockages: 1,
  },
  {
    id: 'corridor-nh-415',
    corridor: 'NH-415 (Banderdewa – Itanagar)',
    state: 'Arunachal Pradesh',
    disruptions: 5,
    averageDelay: '3.9 hrs',
    risk: 'Moderate',
    trend: 'stable',
    primaryCause: 'Karsingsa sinking zone & monsoon silt',
    activeBlockages: 1,
  },
  {
    id: 'corridor-nh-27',
    corridor: 'NH-27 (East-West Corridor)',
    state: 'Assam',
    disruptions: 3,
    averageDelay: '1.8 hrs',
    risk: 'Low',
    trend: 'decreasing',
    primaryCause: 'Heavy cargo congestion & bridge toll staging',
    activeBlockages: 0,
  },
];

// ======================================================================
// 2. SETTINGS INITIAL DATA
// ======================================================================

export const INITIAL_OFFICER_PROFILE: OfficerProfile = {
  officerName: 'Dr. Rajesh K. Sharma, IAS',
  department: 'Ministry of Road Transport & Highways (MoRTH) / NEC Disaster Logistics Cell',
  role: 'Principal Secretary & Regional Transport Director',
  email: 'rajesh.sharma@morth.gov.in',
  phone: '+91 361-223-8901',
  badgeId: 'GOI-NER-DIR-049',
  commandJurisdiction: 'North Eastern Regional Corridor Zone (NER-8)',
};

export const INITIAL_NOTIFICATION_SETTINGS: NotificationSettings = {
  criticalIncidents: true,
  routeDisruptions: true,
  vehicleDelays: true,
  weatherAlerts: true,
  soundAlerts: false,
  satelliteDispatch: true,
};

export const INITIAL_MAP_PREFERENCES: MapPreferenceSettings = {
  defaultMapView: 'tactical',
  defaultLayers: {
    roads: true,
    incidents: true,
    vehicles: true,
    bridges: true,
    weatherRadar: false,
    riskPolygons: true,
  },
};

export const INITIAL_SYSTEM_STATUS: SystemStatusData = {
  dataSynchronization: 'Real-Time Telemetry (Satellite Mesh + 4G Auto-Failover, 30s intervals)',
  apiStatus: {
    nicGateway: 'operational',
    imdWeatherFeed: 'operational',
    morthVahan: 'operational',
    isroBhuvan: 'operational',
  },
  lastSystemUpdate: 'Build v2.4.8 (07 Sep 2026 09:30 IST) — Security Patch NER-SP4',
  buildVersion: 'v2.4.8-gov-prod',
  activeSessions: [
    {
      id: 'sess-01',
      device: 'Workstation Terminal (NIC-NER-HQ-01)',
      ip: '10.142.64.18 (GovNet VPN)',
      location: 'Dispur Command Centre, Assam',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: 'sess-02',
      device: 'Tactical Toughbook (BRO-TF74-CMD)',
      ip: '10.142.88.92 (GovNet Satellite)',
      location: 'Sevoke Forward Base, West Bengal',
      lastActive: '42 minutes ago',
      isCurrent: false,
    },
    {
      id: 'sess-03',
      device: 'Encrypted Field Tablet (NER-TAB-09)',
      ip: '10.142.112.55 (Satellite Mesh)',
      location: 'Kohima District Cell, Nagaland',
      lastActive: '3 hours ago',
      isCurrent: false,
    },
  ],
};
