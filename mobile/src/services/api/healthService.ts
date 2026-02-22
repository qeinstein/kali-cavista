import BaseRequest from "../../helpers/services";

// ─── Types matching API contracts ────────────────────────────────────────────

/**
 * POST /api/v1/health/sync
 * → payload: { snapshots: [{snapshotAt, stepsCount, activeCalories, heartRate}] }
 * → response: { success, snapshotsReceived }
 */
export interface HealthSnapshot {
  snapshotAt: string;
  stepsCount: number;
  activeCalories: number;
  heartRate: number;
}

export interface HealthSyncPayload {
  snapshots: HealthSnapshot[];
}

export interface HealthSyncResponse {
  success: boolean;
  snapshotsReceived: number;
}

/**
 * POST /api/v1/health/sleep
 * → payload: { sleepStart, sleepEnd, durationMinutes, quality }
 * → response: { success }
 */
export interface SleepDataPayload {
  sleepStart: string;
  sleepEnd: string;
  durationMinutes: number;
  quality: string;
}

export interface SleepSyncResponse {
  success: boolean;
}

/**
 * GET /health
 * → response: "string" (health check)
 */

// ─── POST: Sync health data ────────────────────────────────────────────────

/**
 * syncHealthData(snapshots)
 * → POST /api/v1/health/sync
 * → Receives a batch of health snapshots from the device
 * → Returns { success, snapshotsReceived }
 */
export const syncHealthData = async (
  snapshots: HealthSnapshot[],
): Promise<HealthSyncResponse> => {
  return await BaseRequest.post("/api/v1/health/sync", { snapshots });
};

// ─── POST: Sync sleep data ──────────────────────────────────────────────────

/**
 * syncSleepData(data)
 * → POST /api/v1/health/sleep
 * → Receives last night's sleep data
 * → Returns { success }
 */
export const syncSleepData = async (
  data: SleepDataPayload,
): Promise<SleepSyncResponse> => {
  return await BaseRequest.post("/api/v1/health/sleep", data);
};

// ─── GET: Health check ──────────────────────────────────────────────────────

/**
 * healthCheck()
 * → GET /health
 * → Returns a string (server status)
 */
export const healthCheck = async (): Promise<string> => {
  return await BaseRequest.get("/health");
};
