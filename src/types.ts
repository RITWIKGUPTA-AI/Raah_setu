/**
 * VECTOR - Vehicle & Emergency Connectivity for Transport Operations & Routing
 * Command Dashboard Types
 */

export type SeverityLevel = 'critical' | 'high' | 'warning' | 'medium' | 'info';

export type RoadStatus = 'major' | 'blocked' | 'restricted' | 'open' | 'clear' | 'warning';

export type RoadConditionStatus = 'clear' | 'warning' | 'blocked';
export type EnvironmentRiskLevel = 'low' | 'medium' | 'high';
export type TrafficLevel = 'low' | 'medium' | 'high';

export type IncidentCategory =
  | 'landslide'
  | 'flood'
  | 'structural'
  | 'breakdown'
  | 'weather'
  | 'road_damage'
  | 'bridge_restriction';

export type CargoCategory = 'medical' | 'food' | 'fuel' | 'rescue' | 'relief';

export interface RoadSegment {
  id: string;
  name: string;
  routeNumber: string; // e.g., 'NH-29'
  status: RoadStatus;
  // Environment-based status model
  conditionStatus?: RoadConditionStatus;
  environmentRisk?: EnvironmentRiskLevel;
  trafficLevel?: TrafficLevel;
  weatherCondition?: string;
  state?: string;
  from: string;
  to: string;
  lengthKm: number;
  points: [number, number][]; // Scaled map coordinates [x, y]
  conditionDetails: string;
  detourRoute?: string;
  affectedConvoys: number;
  lastUpdated: string;
  blockedLocation?: [number, number]; // [lng, lat] geographic location of closure
  blockedReason?: string;
}

export interface IncidentMarker {
  id: string;
  code: string; // e.g. 'INC-NE-294'
  title: string;
  category: IncidentCategory;
  severity: SeverityLevel;
  roadName: string;
  district: string;
  state: string;
  coordinates: [number, number]; // [x, y] on GIS map
  latLng: string;
  timestamp: string;
  reportedBy: string;
  status: 'active' | 'in-progress' | 'clearing' | 'resolved';
  description: string;
  dispatchedTeams: string[];
  estimatedClearance: string;
  affectedVehicles: number;
  // Detail Drawer & Incident Management attributes
  verificationStatus?: 'verified' | 'pending' | 'flagged';
  assignedOfficer?: string;
  assignedOfficerRole?: string;
  recommendedAction?: string;
  photoUrl?: string;
  photoCaption?: string;
}

export interface VehicleMarker {
  id: string;
  callsign: string; // e.g. 'MED-CONVOY-09'
  cargo: CargoCategory;
  cargoDescription: string;
  priority: 'emergency' | 'high' | 'standard';
  driver: string;
  origin: string;
  destination: string;
  status: 'moving' | 'delayed' | 'rerouting' | 'halted';
  currentSpeedKmH: number;
  eta: string;
  coordinates: [number, number];
  assignedHighway: string;
  delayMinutes?: number;
  telemetry: {
    batteryTemp: string;
    fuelLevel: number;
    satcomLink: 'SECURE' | 'DEGRADED' | 'STANDBY';
  };
}

export interface RiskZone {
  id: string;
  name: string;
  type: 'landslide' | 'flood' | 'seismic' | 'monsoon';
  riskScore: number; // 0 - 100
  level: 'extreme' | 'high' | 'moderate';
  polygon: [number, number][];
  affectedDistricts: string[];
  advisoryText: string;
  sensorTrigger: string;
}

export interface PriorityAlert {
  id: string;
  code: string;
  title: string;
  severity: SeverityLevel;
  category: string;
  location: string;
  timestamp: string;
  impactedAsset: string;
  actionRequired: string;
  targetIncidentId?: string;
  acknowledged: boolean;
}

export interface DistrictConnectivity {
  id: string;
  district: string;
  state: string;
  percentage: number;
  status: 'optimal' | 'moderate' | 'restricted' | 'critical';
  openRoutes: number;
  totalRoutes: number;
  activeDetours: number;
  weatherCondition: string;
}

export interface AIRiskOutlook {
  id: string;
  code: string;
  title: string;
  probability: number; // e.g. 89%
  timeHorizon: string; // e.g. 'Within 4 hours'
  riskFactor: string;
  impactAssessment: string;
  preemptiveMitigation: string;
  severity: 'critical' | 'high' | 'warning';
  dataSource: string;
}

export interface BridgeMarker {
  id: string;
  name: string;
  river: string;
  state: string;
  district: string;
  routeNumber: string;
  status: 'open' | 'restricted' | 'critical' | 'blocked';
  coordinates: [number, number];
  lengthMeters: number;
  lengthM?: number;
  riverCrossing?: string;
  details?: string;
  conditionDetails: string;
  structuralHealthScore: number; // 0-100
}

export interface LiveEventItem {
  id: string;
  location: string;
  district: string;
  state: string;
  eventType: string; // e.g., 'Road Blockage', 'Flash Flood', 'Bridge Vibration', 'Convoy Transit'
  severity: SeverityLevel;
  time: string; // e.g. '8 min ago'
  incidentId?: string;
  riskScore?: number;
  status?: string;
  lastUpdate?: string;
  details?: string;
}

export interface MapLayerState {
  roads: boolean;
  bridges: boolean;
  districtBoundaries: boolean;
  vehicles: boolean;
  incidents: boolean;
  landslideZones: boolean;
  floodZones: boolean;
  weatherRisk: boolean;
  // Backward compatibility
  majorRoads?: boolean;
  blockedRoads?: boolean;
  restrictedRoads?: boolean;
  riskZones?: boolean;
}

export type FleetVehicleStatus = 'moving' | 'delayed' | 'at-risk';

export interface FleetVehicle {
  id: string; // e.g., 'NER-1023'
  callsign?: string;
  cargo: string; // e.g., 'Medicines', 'Food', 'Agricultural Produce', 'Construction Materials'
  cargoDetails?: string;
  origin: string; // e.g., 'Guwahati'
  destination: string; // e.g., 'Imphal'
  eta: string; // e.g., 'ETA 4h 20m'
  status: FleetVehicleStatus; // moving (Green), delayed (Amber), at-risk (Red)
  statusLabel: 'On Route' | 'Delayed' | 'At Risk';
  currentLocation: string; // e.g., 'NH-37 Sector 4, Noney'
  route: string; // e.g., 'Guwahati → Nagaon → Dimapur → Imphal'
  speed: string; // e.g., '52 km/h'
  delay: string; // e.g., 'None (On Schedule)' or '+1h 45m'
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  riskDetails?: string;
  lastGpsUpdate: string; // e.g., '25s ago'
  coordinates: [number, number]; // [x, y] coordinates in 800x500 map space
  driverName?: string;
  driverPhone?: string;
  state?: string;
}

export type ShipmentStatus = 'Dispatched' | 'In Transit' | 'Delayed' | 'Delivered';
export type ShipmentPriority = 'Critical' | 'High' | 'Standard';

export interface ShipmentItem {
  id: string; // e.g., 'SHP-NER-4011'
  commodity: 'Medicines' | 'Food' | 'Agricultural Produce' | 'Construction Materials' | 'Fuel & POL';
  quantity: string; // e.g., '1,200 Cold-Chain Units', '36 Metric Tonnes'
  origin: string; // e.g., 'Guwahati Central Depot'
  originState: string;
  destination: string; // e.g., 'Imphal Central Hospital'
  destinationDistrict: string;
  destinationState: string;
  vehicle: string; // e.g., 'NER-1023'
  eta: string; // e.g., 'Today, 15:40 IST (4h 20m)'
  delay: string; // e.g., 'No Delay' or '+1h 45m'
  risk: 'Low' | 'Medium' | 'High';
  riskNote?: string;
  priority: ShipmentPriority;
  status: ShipmentStatus;
  currentLocation: string;
  dispatchDate?: string;
  consignee?: string;
}

// ----------------------------------------------------------------------
// AI Risk Intelligence Types
// ----------------------------------------------------------------------

export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low';

export interface AIRiskCorridor {
  id: string;
  corridorCode: string; // e.g. 'NH-10'
  corridorName: string;
  state: string;
  disruptionProbability: number; // e.g. 91, 63, 18
  expectedTimeframe: string; // e.g. 'Expected within 3 hours', 'Expected within 6 hours'
  primaryHazard: string; // e.g. 'Heavy rainfall + slope instability', 'Flood probability increasing'
  riskLevel: RiskLevel;
  confidenceScore: number; // e.g. 94%
  riskFactors: {
    rainfall: number; // 0-100 score/weight
    terrain: number;
    historical: number;
    roadCondition: number;
    traffic: number;
    floodProbability: number;
  };
  riskFactorDetails: {
    rainfallDetail: string;
    terrainDetail: string;
    historicalDetail: string;
    roadDetail: string;
    trafficDetail: string;
    floodDetail: string;
  };
  timeline: {
    now: number; // Disruption % at NOW
    plus3h: number; // at +3h
    plus6h: number; // at +6h
    plus12h: number; // at +12h
    plus24h: number; // at +24h
  };
  affectedConvoys: number;
  sensorInputs: string[];
  recommendedAction: string;
}

// ----------------------------------------------------------------------
// District Monitoring Types
// ----------------------------------------------------------------------

export interface DistrictMonitoringItem {
  id: string;
  district: string;
  state: string;
  connectivityScore: number; // 0 - 100
  connectivityStatus: 'optimal' | 'moderate' | 'restricted' | 'critical';
  openRoads: number;
  totalRoads: number;
  blockedRoadsCount: number;
  blockedRoads: string[];
  openRoadsList: string[];
  activeIncidentsCount: number;
  incidentDetails: Array<{
    id: string;
    title: string;
    severity: SeverityLevel;
    road: string;
    status: string;
  }>;
  supplyStatus: 'Stable' | 'Constrained' | 'Critical Shortage' | 'Replenishing';
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  activeVehiclesCount: number;
  vehiclesList: Array<{
    callsign: string;
    cargo: string;
    status: string;
    driver: string;
    eta: string;
  }>;
  supplyDeliveries: {
    medicines: string;
    foodGrains: string;
    fuelPOL: string;
    reliefSupplies: string;
  };
  weather: {
    condition: string;
    temp: string;
    rainfall24h: string;
    wind: string;
    warningAlert?: string;
  };
  riskForecast: string;
  mapCoordinates: [number, number];
}

// ----------------------------------------------------------------------
// Operational Alerts Types
// ----------------------------------------------------------------------

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'resolved';
export type AlertStatus = 'active' | 'acknowledged' | 'assigned' | 'resolved';

export interface OperationalAlertItem {
  id: string;
  code: string;
  severity: AlertSeverity;
  title: string;
  location: string;
  district?: string;
  state: string;
  description: string;
  time: string; // e.g. '8 minutes ago'
  timestamp: string; // e.g. '07 Sep 2026, 10:42 IST'
  status: AlertStatus;
  assignedTo?: string;
  assignedTeam?: string;
  targetRoad?: string;
  targetIncidentId?: string;
  coordinates?: [number, number];
  actionAdvised?: string;
}

// ----------------------------------------------------------------------
// Field Reports Types
// ----------------------------------------------------------------------

export type FieldReportType =
  | 'Landslide'
  | 'Flood'
  | 'Road Damage'
  | 'Bridge Damage'
  | 'Traffic'
  | 'Weather Condition';

export type FieldVerificationStatus = 'Pending' | 'Verified' | 'Rejected' | 'Pending Verification';
export type FieldReportLifecycle = 'Actionable' | 'Monitoring' | 'Closed' | 'Converted to Incident' | 'Under Review' | 'Dismissed';

export interface FieldReportItem {
  id: string; // e.g. 'FR-2026-089'
  location: string; // e.g. 'NH-10 Km 38, East Sikkim'
  district: string;
  state: string;
  type: FieldReportType;
  submittedBy: string; // e.g. 'Insp. T. Jamir'
  reporterDesignation: string; // e.g. 'Assistant Engineer'
  reporterAgency: string; // e.g. 'BRO Task Force 74'
  reporterContact: string; // e.g. '+91 98452-98122'
  time: string; // e.g. '8 minutes ago'
  timestamp: string; // e.g. '07 Sep 2026, 10:38 IST'
  verification: FieldVerificationStatus;
  status: FieldReportLifecycle;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  gpsCoordinates: string; // e.g. '27.3389° N, 88.6065° E, Elev. 1,420m'
  coordinates: [number, number]; // map coordinate [x, y]
  description: string;
  photoUrl?: string;
  photoCaption?: string;
  linkedIncidentId?: string;
  resolutionNotes?: string;
}

// ----------------------------------------------------------------------
// Analytics Types
// ----------------------------------------------------------------------

export interface AnalyticsDisruptionData {
  date: string;
  disruptions: number;
  cleared: number;
  blockedKm: number;
}

export interface AnalyticsDelayData {
  corridor: string;
  avgDelayHours: number;
  normHours: number;
}

export interface AnalyticsDistrictScore {
  district: string;
  state: string;
  connectivity: number;
  blockedRoutes: number;
}

export interface AnalyticsCategoryData {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface VulnerableCorridorItem {
  id: string;
  corridor: string;
  state: string;
  disruptions: number;
  averageDelay: string;
  risk: 'Critical' | 'High' | 'Moderate' | 'Low';
  trend: 'increasing' | 'stable' | 'decreasing';
  primaryCause: string;
  activeBlockages: number;
}

// ----------------------------------------------------------------------
// Settings Types
// ----------------------------------------------------------------------

export interface OfficerProfile {
  officerName: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  badgeId: string;
  commandJurisdiction: string;
}

export interface NotificationSettings {
  criticalIncidents: boolean;
  routeDisruptions: boolean;
  vehicleDelays: boolean;
  weatherAlerts: boolean;
  soundAlerts: boolean;
  satelliteDispatch: boolean;
}

export interface MapPreferenceSettings {
  defaultMapView: 'tactical' | 'satellite' | 'topographic' | 'minimal';
  defaultLayers: {
    roads: boolean;
    incidents: boolean;
    vehicles: boolean;
    bridges: boolean;
    weatherRadar: boolean;
    riskPolygons: boolean;
  };
}

export interface SystemStatusData {
  dataSynchronization: string;
  apiStatus: {
    nicGateway: 'operational' | 'degraded' | 'offline';
    imdWeatherFeed: 'operational' | 'degraded' | 'offline';
    morthVahan: 'operational' | 'degraded' | 'offline';
    isroBhuvan: 'operational' | 'degraded' | 'offline';
  };
  lastSystemUpdate: string;
  buildVersion: string;
  activeSessions: {
    id: string;
    device: string;
    ip: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
}

export type AppTheme = 'white' | 'dark' | 'bone' | 'powder' | 'frost';

