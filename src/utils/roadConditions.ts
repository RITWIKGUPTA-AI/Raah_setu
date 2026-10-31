/**
 * Road Condition Data Model & Dynamic Evaluation Engine
 * Government Logistics & Infrastructure Monitoring Dashboard
 *
 * Priority Rules:
 * 1. BLOCKED → RED
 * 2. HIGH environmental risk / severe disruption → RED
 * 3. MEDIUM risk / partial disruption → YELLOW
 * 4. CLEAR / LOW risk → GREEN
 */

import { RoadSegment, RoadConditionStatus, EnvironmentRiskLevel, TrafficLevel } from '../types';

export type DynamicRoadColor = 'green' | 'yellow' | 'red';

export interface EvaluatedRoadCondition {
  condition: RoadConditionStatus;
  color: DynamicRoadColor;
  colorHex: string;
  glowHex: string;
  casingHex: string;
  label: string;
  badgeLabel: string;
  priorityRank: 1 | 2 | 3 | 4;
  isBlocked: boolean;
  isWarning: boolean;
  isClear: boolean;
}

export interface BlockedRoadClosureIndicator {
  id: string;
  roadId: string;
  routeNumber: string;
  name: string;
  location: [number, number]; // [lng, lat]
  reason: string;
  detourRoute?: string;
  lastUpdated: string;
}

/**
 * Dynamically determines road condition status and color from segment properties
 */
export function evaluateRoadCondition(road: Partial<RoadSegment>): EvaluatedRoadCondition {
  // 1. BLOCKED → RED
  if (
    road.status === 'blocked' ||
    road.conditionStatus === 'blocked'
  ) {
    return {
      condition: 'blocked',
      color: 'red',
      colorHex: '#ef4444',
      glowHex: 'rgba(239, 68, 68, 0.55)',
      casingHex: '#7f1d1d',
      label: 'ROAD BLOCKED',
      badgeLabel: 'Blocked / Critical',
      priorityRank: 1,
      isBlocked: true,
      isWarning: false,
      isClear: false,
    };
  }

  // 2. HIGH environmental risk / severe disruption → RED
  if (road.environmentRisk === 'high') {
    return {
      condition: 'blocked',
      color: 'red',
      colorHex: '#ef4444',
      glowHex: 'rgba(239, 68, 68, 0.55)',
      casingHex: '#7f1d1d',
      label: 'ROAD BLOCKED / SEVERE HAZARD',
      badgeLabel: 'Severe Environmental Hazard',
      priorityRank: 2,
      isBlocked: true,
      isWarning: false,
      isClear: false,
    };
  }

  // 3. MEDIUM risk / partial disruption → YELLOW
  if (
    road.status === 'restricted' ||
    road.status === 'warning' ||
    road.conditionStatus === 'warning' ||
    road.environmentRisk === 'medium' ||
    road.trafficLevel === 'high'
  ) {
    return {
      condition: 'warning',
      color: 'yellow',
      colorHex: '#eab308',
      glowHex: 'rgba(234, 179, 8, 0.45)',
      casingHex: '#713f12',
      label: 'MODERATE RISK / WARNING',
      badgeLabel: 'Warning / Moderate Risk',
      priorityRank: 3,
      isBlocked: false,
      isWarning: true,
      isClear: false,
    };
  }

  // 4. CLEAR / LOW risk → GREEN
  return {
    condition: 'clear',
    color: 'green',
    colorHex: '#10b981',
    glowHex: 'rgba(16, 185, 129, 0.35)',
    casingHex: '#064e3b',
    label: 'CLEAR & SAFE',
    badgeLabel: 'Clear / Safe',
    priorityRank: 4,
    isBlocked: false,
    isWarning: false,
    isClear: true,
  };
}

/**
 * Extracts active road closure markers for map visualization
 */
export function extractBlockedRoadIndicators(roads: RoadSegment[]): BlockedRoadClosureIndicator[] {
  const indicators: BlockedRoadClosureIndicator[] = [];

  for (const road of roads) {
    const evaluated = evaluateRoadCondition(road);
    if (evaluated.isBlocked) {
      if (road.blockedLocation && road.blockedLocation.length === 2) {
        indicators.push({
          id: `closure-${road.id}`,
          roadId: road.id,
          routeNumber: road.routeNumber,
          name: road.name,
          location: road.blockedLocation,
          reason: road.blockedReason || road.conditionDetails || 'Total corridor blockage',
          detourRoute: road.detourRoute,
          lastUpdated: road.lastUpdated,
        });
      }
    }
  }

  return indicators;
}
