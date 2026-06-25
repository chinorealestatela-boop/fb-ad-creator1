'use client';
import { useState, useCallback } from 'react';
import { getAccurateLocation, accuracyLabel } from '@/app/lib/door-knocking/gps';
import type { GpsCoordinates } from '@/app/lib/door-knocking/types';

interface Props {
  onLocation: (coords: GpsCoordinates, address: string, neighborhood: string, city: string) => void;
  variant?: 'button' | 'fab';
}

export default function GpsLocationButton({ onLocation, variant = 'button' }: Props) {
  const [state, setState] = useState<'idle' | 'locating' | 'geocoding' | 'error'>('idle');
  const [accuracy, setAccuracy] = useState<string>('');
  const [error, setError] = useState('');

  const handleClick = useCallback(() => {
    setState('locating');
    setError('');
    setAccuracy('');

    const stop = getAccurateLocation(
      (coords) => {
        const label = accuracyLabel(coords.accuracy);
        const ft = Math.round(coords.accuracy / 0.3048);
        setAccuracy(`${label} (±${ft} ft)`);
      },
      (err) => {
        setState('error');
        setError(err);
      },
      async (coords) => {
        setState('geocoding');
        try {
          const res = await fetch(
            `/api/door-knocking/geocode?lat=${coords.lat}&lng=${coords.lng}`
          );
          const data = await res.json();
          onLocation(coords, data.address || '', data.neighborhood || '', data.city || '');
          setState('idle');
        } catch {
          // Use coordinates as fallback address
          onLocation(coords, `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`, '', '');
          setState('idle');
        }
      }
    );

    return stop;
  }, [onLocation]);

  const isBusy = state === 'locating' || state === 'geocoding';

  if (variant === 'fab') {
    return (
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
        {isBusy && accuracy && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-blue-300 shadow-lg">
            {state === 'geocoding' ? 'Getting address…' : `GPS: ${accuracy}`}
          </div>
        )}
        {error && (
          <div className="bg-red-950/80 border border-red-800 rounded-xl px-3 py-2 text-xs text-red-300 shadow-lg max-w-[220px]">
            {error}
          </div>
        )}
        <button
          onClick={handleClick}
          disabled={isBusy}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 shadow-xl flex items-center justify-center transition-all active:scale-95"
          title="Use My Current Location"
        >
          {isBusy ? (
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
        {!isBusy && !error && (
          <span className="text-xs text-gray-400 text-center">My Location</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={isBusy}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 border border-blue-700/50 hover:bg-blue-600/30 disabled:opacity-60 transition-colors text-sm text-blue-300 font-medium w-full justify-center"
      >
        {isBusy ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {state === 'geocoding' ? 'Getting address…' : `Locating… ${accuracy}`}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Use My Current Location
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}
