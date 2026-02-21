/**
 * API Configuration utility
 * Provides centralized access to API URLs and configuration
 */

export interface ApiConfig {
  backendUrl: string;
  apiVersion: string;
  audioEndpoint: string;
  routesEndpoint: string;
}

export function getApiConfig(): ApiConfig {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
  
  return {
    backendUrl,
    apiVersion,
    audioEndpoint: `${backendUrl}/api/${apiVersion}/audio/voice-command`,
    routesEndpoint: `${backendUrl}/api/routes`,
  };
}

export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
}

export function getApiVersion(): string {
  return process.env.NEXT_PUBLIC_API_VERSION || "v1";
}

export function getAudioEndpoint(): string {
  const config = getApiConfig();
  return config.audioEndpoint;
}

export function getRoutesEndpoint(): string {
  const config = getApiConfig();
  return config.routesEndpoint;
}