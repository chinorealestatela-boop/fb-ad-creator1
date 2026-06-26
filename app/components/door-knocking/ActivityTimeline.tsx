'use client';
import { useEffect, useState } from 'react';
import { getActivitiesByLead, getVisitsByLead } from '@/app/lib/door-knocking/db';
import type { Activity, Visit, LeadStatus } from '@/app/lib/door-knocking/types';
import { STATUS_LABELS } from '@/app/lib/door-knocking/types';

interface Props {
  leadId: number;
}

type TimelineItem =
  | { kind: 'visit'; visit: Visit }
  | { kind: 'activity'; activity: Activity };

const ACTIVITY_ICONS: Record<string, string> = {
  visit: '🚪',
  note: '📝',
  photo: '📷',
  status_change: '🔄',
  follow_up_set: '📅',
  follow_up_completed: '✅',
  call: '📞',
  text: '💬',
  email: '✉️',
  appointment: '🗓️',
};

function formatDate(ts: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(ts));
}

export default function ActivityTimeline({ leadId }: Props) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [visits, activities] = await Promise.all([
        getVisitsByLead(leadId),
        getActivitiesByLead(leadId),
      ]);

      const timeline: TimelineItem[] = [
        ...visits.map((v) => ({ kind: 'visit' as const, visit: v })),
        ...activities.map((a) => ({ kind: 'activity' as const, activity: a })),
      ].sort((a, b) => {
        const ta = a.kind === 'visit' ? a.visit.timestamp : a.activity.timestamp;
        const tb = b.kind === 'visit' ? b.visit.timestamp : b.activity.timestamp;
        return tb - ta;
      });

      setItems(timeline);
      setLoading(false);
    }
    load();
  }, [leadId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-24 bg-gray-700 rounded" />
              <div className="h-3 w-40 bg-gray-600 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <p className="text-gray-500 text-sm text-center py-4">No activity yet.</p>;
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-700" />
      <div className="space-y-4">
        {items.map((item, i) => {
          if (item.kind === 'visit') {
            const v = item.visit;
            return (
              <div key={`v-${v.id ?? i}`} className="flex gap-3 pl-1">
                <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-700 flex items-center justify-center text-sm shrink-0 z-10">
                  🚪
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{formatDate(v.timestamp)}</p>
                  <p className="text-sm text-white font-medium">Door Knocked</p>
                  {v.statusAfter && (
                    <p className="text-xs text-gray-400">
                      Status: {v.statusBefore ? `${STATUS_LABELS[v.statusBefore]} → ` : ''}{STATUS_LABELS[v.statusAfter]}
                    </p>
                  )}
                  {v.notes && <p className="text-sm text-gray-300 mt-1">{v.notes}</p>}
                </div>
              </div>
            );
          }

          const a = item.activity;
          const icon = ACTIVITY_ICONS[a.type] || '•';
          const isCompletion = a.type === 'follow_up_completed';

          return (
            <div key={`a-${a.id ?? i}`} className="flex gap-3 pl-1">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm shrink-0 z-10 ${
                isCompletion
                  ? 'bg-green-900/50 border-green-700'
                  : 'bg-gray-800 border-gray-600'
              }`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">{formatDate(a.timestamp)}</p>

                {isCompletion ? (
                  <>
                    <p className="text-sm text-white font-medium">
                      {String(a.data.followUpType ?? 'follow-up').replace(/_/g, ' ')} completed
                    </p>
                    {a.data.outcomeLabel != null && (
                      <p className="text-sm text-green-400 mt-0.5">
                        Outcome: {String(a.data.outcomeLabel)}
                      </p>
                    )}
                    {a.data.notes != null && String(a.data.notes) && (
                      <p className="text-sm text-gray-300 mt-1">{String(a.data.notes)}</p>
                    )}
                    {a.data.statusChanged && a.data.fromStatus != null && a.data.toStatus != null && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Status: {STATUS_LABELS[String(a.data.fromStatus) as LeadStatus]} → {STATUS_LABELS[String(a.data.toStatus) as LeadStatus]}
                      </p>
                    )}
                    {a.data.newFollowUpAt != null && (
                      <p className="text-xs text-blue-400 mt-0.5">
                        📅 New follow-up: {new Date(String(a.data.newFollowUpAt)).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-white capitalize">
                      {a.type.replace(/_/g, ' ')}
                    </p>
                    {a.data?.note != null && (
                      <p className="text-sm text-gray-300 mt-1">{String(a.data.note)}</p>
                    )}
                    {a.data?.scheduledAt != null && (
                      <p className="text-xs text-blue-400 mt-0.5">
                        {new Date(String(a.data.scheduledAt)).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    )}
                    {a.data?.from != null && a.data?.to != null && (
                      <p className="text-xs text-gray-400">
                        {STATUS_LABELS[String(a.data.from) as LeadStatus]} → {STATUS_LABELS[String(a.data.to) as LeadStatus]}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
