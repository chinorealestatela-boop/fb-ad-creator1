'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FollowUp, Lead } from '@/app/lib/door-knocking/types';
import { OUTCOME_LABELS } from '@/app/lib/door-knocking/types';
import OutcomeModal from './OutcomeModal';

interface Props {
  followUps: FollowUp[];
  leads: Map<number, Lead>;
  /** Called after an outcome is saved so the parent can reload data */
  onUpdated: (updatedLead: Lead) => void;
  /** Show address column (dashboard view) vs compact (lead-detail view) */
  showAddress?: boolean;
}

function formatScheduledAt(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today · ${timeStr}`;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();
  if (isTomorrow) return `Tomorrow · ${timeStr}`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ` · ${timeStr}`;
}

function urgencyClass(iso: string, completed: boolean): string {
  if (completed) return 'opacity-50';
  const d = new Date(iso);
  const now = new Date();
  if (d < now) return 'border-red-800/50 bg-red-950/20';
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d < tomorrow) return 'border-yellow-800/40 bg-yellow-950/10';
  return 'border-gray-700 bg-gray-800/40';
}

function urgencyLabel(iso: string, completed: boolean): React.ReactElement | null {
  if (completed) return null;
  const d = new Date(iso);
  const now = new Date();
  if (d < now) return <span className="text-xs text-red-400 font-medium">Overdue</span>;
  const soon = new Date(now);
  soon.setHours(soon.getHours() + 3);
  if (d < soon) return <span className="text-xs text-yellow-400 font-medium">Soon</span>;
  return null;
}

type SortMode = 'upcoming' | 'overdue' | 'completed';

export default function FollowUpList({
  followUps,
  leads,
  onUpdated,
  showAddress = false,
}: Props) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<{ followUp: FollowUp; lead: Lead } | null>(null);
  const [tab, setTab] = useState<SortMode>('upcoming');

  const now = new Date();

  const pending = followUps.filter((f) => !f.completed);
  const overdue = pending.filter((f) => new Date(f.scheduledAt) < now);
  const upcoming = pending.filter((f) => new Date(f.scheduledAt) >= now);
  const completed = followUps.filter((f) => f.completed);

  const tabData: Record<SortMode, FollowUp[]> = {
    upcoming: upcoming.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    overdue: overdue.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    completed: completed
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
      .slice(0, 20),
  };

  const counts = { upcoming: upcoming.length, overdue: overdue.length, completed: completed.length };
  const displayed = tabData[tab];

  function handleMarkComplete(fu: FollowUp) {
    const lead = leads.get(fu.leadId);
    if (!lead) return;
    setActiveModal({ followUp: fu, lead });
  }

  function handleModalDone(updatedLead: Lead) {
    setActiveModal(null);
    onUpdated(updatedLead);
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-3">
        {(['overdue', 'upcoming', 'completed'] as SortMode[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
              tab === t
                ? t === 'overdue'
                  ? 'bg-red-900/60 border border-red-700/50 text-red-300'
                  : 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
            }`}
          >
            {t} {counts[t] > 0 && `(${counts[t]})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-6">
          {tab === 'upcoming' && 'No upcoming follow-ups.'}
          {tab === 'overdue' && '🎉 Nothing overdue!'}
          {tab === 'completed' && 'No completed follow-ups yet.'}
        </p>
      ) : (
        <div className="space-y-2">
          {displayed.map((fu) => {
            const lead = leads.get(fu.leadId);
            return (
              <div
                key={fu.id}
                className={`rounded-xl border p-3 transition-colors ${urgencyClass(fu.scheduledAt, fu.completed)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {showAddress && lead && (
                      <button
                        onClick={() => router.push(`/door-knocking/lead/${lead.id}`)}
                        className="text-sm font-medium text-white hover:text-blue-400 transition-colors truncate block text-left mb-0.5"
                      >
                        {lead.address}
                      </button>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        fu.type === 'appointment'
                          ? 'bg-green-900/50 text-green-300 border border-green-700/40'
                          : 'bg-blue-900/40 text-blue-300 border border-blue-700/40'
                      }`}>
                        {fu.type === 'appointment' ? '🗓️ Appointment' : '📅 Follow-Up'}
                      </span>
                      {urgencyLabel(fu.scheduledAt, fu.completed)}
                    </div>
                    <p className="text-sm text-white mt-1 font-medium">
                      {formatScheduledAt(fu.scheduledAt)}
                    </p>
                    {fu.notes && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{fu.notes}</p>
                    )}
                    {fu.completed && fu.outcome && (
                      <p className="text-xs text-gray-500 mt-1">
                        ✓ {OUTCOME_LABELS[fu.outcome]}
                        {fu.outcomeNotes ? ` — ${fu.outcomeNotes}` : ''}
                      </p>
                    )}
                  </div>

                  {!fu.completed && (
                    <button
                      onClick={() => handleMarkComplete(fu)}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-green-700/30 border border-green-600/40 text-green-300 text-xs font-semibold hover:bg-green-700/50 transition-colors whitespace-nowrap"
                    >
                      ✓ Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outcome Modal */}
      {activeModal && (
        <OutcomeModal
          followUp={activeModal.followUp}
          lead={activeModal.lead}
          onDone={handleModalDone}
          onCancel={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
