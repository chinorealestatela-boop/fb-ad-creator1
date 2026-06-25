'use client';
import type { PropertyOwnerInfo } from '@/app/lib/door-knocking/types';

interface Props {
  info: PropertyOwnerInfo;
}

export default function PropertyOwnerInfoCard({ info }: Props) {
  if (info.loading) {
    return (
      <div className="rounded-xl p-4 border border-gray-700 bg-gray-800/50 animate-pulse">
        <div className="h-3 w-32 bg-gray-600 rounded mb-3" />
        <div className="h-4 w-48 bg-gray-700 rounded mb-2" />
        <div className="h-3 w-24 bg-gray-600 rounded mb-2" />
        <div className="h-3 w-36 bg-gray-600 rounded" />
      </div>
    );
  }

  if (info.error && !info.currentOwnerName) {
    return (
      <div className="rounded-xl p-4 border border-yellow-700/50 bg-yellow-900/10 text-yellow-400 text-sm">
        {info.error}
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 border border-blue-800/40 bg-blue-950/20">
      <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-3">Property Ownership</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-gray-400 w-36 shrink-0">Current Owner:</span>
          <span className="text-white font-medium">{info.currentOwnerName || 'Unknown'}</span>
        </div>
        {info.currentDeedYear && (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 w-36 shrink-0">Deed Recorded:</span>
            <span className="text-white">{info.currentDeedYear}</span>
          </div>
        )}
        <div className="flex items-start gap-2">
          <span className="text-gray-400 w-36 shrink-0">Previous Owner(s):</span>
          <span className="text-white">
            {info.previousOwners.length > 0
              ? info.previousOwners.join(', ')
              : 'No previous ownership history found.'}
          </span>
        </div>
      </div>
      {info.error && (
        <p className="mt-2 text-xs text-yellow-500">{info.error}</p>
      )}
    </div>
  );
}
