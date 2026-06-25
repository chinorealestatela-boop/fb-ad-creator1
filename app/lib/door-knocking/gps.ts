import type { GpsCoordinates } from './types';

const GOOD_ACCURACY_FT = 30;
const GOOD_ACCURACY_M = GOOD_ACCURACY_FT * 0.3048;
const TIMEOUT_MS = 15000;
const MAX_AGE_MS = 5000;

export type GpsCallback = (coords: GpsCoordinates) => void;
export type GpsErrorCallback = (error: string) => void;

function positionToCoords(pos: GeolocationPosition): GpsCoordinates {
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    timestamp: pos.timestamp,
  };
}

function geolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location access denied. Please enable location permissions in your browser settings.';
    case err.POSITION_UNAVAILABLE:
      return 'Location information unavailable. Please try again.';
    case err.TIMEOUT:
      return 'Location request timed out. Please try again.';
    default:
      return 'Unknown location error.';
  }
}

export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

// One-shot get with accuracy refinement: keeps watching until accuracy ≤ 30ft
export function getAccurateLocation(
  onUpdate: GpsCallback,
  onError: GpsErrorCallback,
  onSettled: (coords: GpsCoordinates) => void
): () => void {
  if (!isGeolocationSupported()) {
    onError('Geolocation is not supported by your browser.');
    return () => {};
  }

  let watchId: number | null = null;
  let settled = false;

  const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: TIMEOUT_MS,
    maximumAge: MAX_AGE_MS,
  };

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const coords = positionToCoords(pos);
      onUpdate(coords);

      if (!settled && coords.accuracy <= GOOD_ACCURACY_M) {
        settled = true;
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
        onSettled(coords);
      }
    },
    (err) => {
      onError(geolocationErrorMessage(err));
    },
    options
  );

  // Safety fallback: settle on best reading after 10 seconds even if accuracy is poor
  const fallbackTimer = setTimeout(() => {
    if (!settled && watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }, 10000);

  return () => {
    clearTimeout(fallbackTimer);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  };
}

// Continuous watch for door-knocking mode
export function watchLocation(
  onUpdate: GpsCallback,
  onError: GpsErrorCallback
): () => void {
  if (!isGeolocationSupported()) {
    onError('Geolocation is not supported by your browser.');
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) => onUpdate(positionToCoords(pos)),
    (err) => onError(geolocationErrorMessage(err)),
    { enableHighAccuracy: true, timeout: TIMEOUT_MS, maximumAge: MAX_AGE_MS }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}

export function accuracyLabel(accuracyM: number): string {
  const ft = accuracyM / 0.3048;
  if (ft <= 10) return 'Excellent';
  if (ft <= 30) return 'Good';
  if (ft <= 100) return 'Fair';
  return 'Poor';
}
