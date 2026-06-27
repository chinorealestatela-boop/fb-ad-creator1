'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  saveLead,
  markFollowUpComplete,
  saveFollowUp,
  addActivity,
} from '@/app/lib/door-knocking/db';
import type {
  Lead,
  FollowUp,
  LeadStatus,
  OutcomeType,
  FollowUpType,
} from '@/app/lib/door-knocking/types';
import { OUTCOME_LABELS, OUTCOME_ICONS } from '@/app/lib/door-knocking/types';
import StatusBadge from './StatusBadge';

interface Props {
  followUps: FollowUp[];
  leads: Map<number, Lead>;
  onClose: () => void;
  onUpdated: (lead: Lead) => void;
}

const OUTCOME_STATUS: Partial<Record<OutcomeType, LeadStatus>> = {
  not_home: 'no_answer',
  reschedule: 'appointment_set',
  schedule_follow_up: 'follow_up',
  appointment_set: 'appointment_set',
  sold: 'listing_signed',
  not_interested: 'not_interested',
  left_information: 'follow_up',
  callback_requested: 'follow_up',
};

const OUTCOME_FU_TYPE: Partial<Record<OutcomeType, FollowUpType>> = {
  not_home: 'follow_up',
  reschedule: 'appointment',
  schedule_follow_up: 'follow_up',
  appointment_set: 'appointment',
  callback_requested: 'follow_up',
};

const NEEDS_DATE: OutcomeType[] = [
  'not_home', 'reschedule', 'schedule_follow_up', 'appointment_set', 'callback_requested',
];

function localDatetimeNow(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function formatOverdue(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor(diffMs / 3600000);
  if (days > 0) return `${days}d overdue`;
  if (hours > 0) return `${hours}h overdue`;
  return 'Just overdue';
}

type SaveState = 'idle' | 'saving' | 'saved';

export default function QuickReview({ followUps, leads, onClose, onUpdated }: Props) {
  const [remaining, setRemaining] = useState<FollowUp[]>(() => [...followUps]);
  const [index, setIndex] = useState(0);
  const [localLead, setLocalLead] = useState<Lead | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [showOutcome, setShowOutcome] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeType | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [newFollowUpDate, setNewFollowUpDate] = useState(localDatetimeNow());
  const [completedCount, setCompletedCount] = useState(0);
  const [doneAll, setDoneAll] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentFU = remaining[index] ?? null;
  const externalLead = currentFU ? (leads.get(currentFU.leadId) ?? null) : null;
  const total = followUps.length;

  useEffect(() => {
    if (!externalLead) {
      setLocalLead(null);
      return;
    }
    setLocalLead({ ...externalLead });
    setSaveState('idle');
    setShowOutcome(false);
    setSelectedOutcome(null);
    setOutcomeNotes('');
    setNewFollowUpDate(localDatetimeNow());
    setTimeout(() => notesRef.current?.focus(), 150);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, externalLead?.id]);

  const doSave = useCallback(async (lead: Lead) => {
    if (!lead.id) return;
    setSaveState('saving');
    const saved = { ...lead, updatedAt: Date.now(), synced: false as const };
    await saveLead(saved);
    setSaveState('saved');
    onUpdated(saved);
    setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 1500);
  }, [onUpdated]);

  function updateField<K extends keyof Lead>(key: K, value: Lead[K]) {
    if (!localLead) return;
    const updated = { ...localLead, [key]: value };
    setLocalLead(updated);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(updated), 700);
  }

  function goNext() {
    if (remaining.length === 0) return;
    setIndex((i) => (i + 1 < remaining.length ? i + 1 : 0));
  }

  function goPrev() {
    if (index > 0) setIndex(index - 1);
  }

  async function handleComplete(outcome: OutcomeType) {
    if (!currentFU?.id || !localLead?.id) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState('saving');
    const now = Date.now();

    await markFollowUpComplete(currentFU.id, outcome, outcomeNotes || undefined);

    const newStatus = OUTCOME_STATUS[outcome] ?? localLead.status;
    const needsDate = NEEDS_DATE.includes(outcome);
    const fuType: FollowUpType = OUTCOME_FU_TYPE[outcome] ?? 'follow_up';

    if (needsDate && newFollowUpDate) {
      await saveFollowUp({
        leadId: localLead.id,
        leadAddress: localLead.address,
        type: fuType,
        scheduledAt: newFollowUpDate,
        notes: outcomeNotes || undefined,
        completed: false,
        createdAt: now,
      });
    }

    const updatedLead: Lead = {
      ...localLead,
      status: newStatus,
      followUpDate: needsDate && newFollowUpDate ? newFollowUpDate : localLead.followUpDate,
      updatedAt: now,
      synced: false,
    };
    await saveLead(updatedLead);
    await addActivity({
      leadId: localLead.id,
      type: 'follow_up_completed',
      timestamp: now,
      data: { outcome, outcomeNotes, newFollowUpAt: needsDate ? newFollowUpDate : undefined },
    });

    onUpdated(updatedLead);
    setSaveState('idle');
    setCompletedCount((c) => c + 1);

    const newRemaining = remaining.filter((_, i) => i !== index);
    if (newRemaining.length === 0) {
      setDoneAll(true);
      return;
    }
    setRemaining(newRemaining);
    setIndex(Math.min(index, newRemaining.length - 1));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta < 0) goNext();
    else goPrev();
  }

  if (doneAll) {
    return (
      <div className="fixed inset-0 z-[3000] bg-gray-950 flex flex-col items-center justify-center text-center px-8">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">All caught up!</h2>
        <p className="text-gray-400">
          {completedCount} follow-up{completedCount !== 1 ? 's' : ''} completed.
        </p>
        <button
          onClick={onClose}
          className="mt-6 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-base transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!currentFU || !localLead) return null;

  const progressPct = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0 border-b border-gray-800/60">
        <button
          onClick={onClose}
          className="p-2 -ml-1 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-white">⚡ Quick Review</p>
          <p className="text-xs text-gray-500">
            {remaining.length - index} remaining · {completedCount} done
          </p>
        </div>
        <div
          className={`text-xs px-2.5 py-1 rounded-lg font-medium min-w-[52px] text-center transition-all ${
            saveState === 'saving'
              ? 'text-yellow-400 bg-yellow-950/40 border border-yellow-800/30'
              : saveState === 'saved'
              ? 'text-green-400 bg-green-950/40 border border-green-800/30'
              : 'text-gray-700'
          }`}
        >
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? '✓ Saved' : 'Auto'}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 shrink-0 font-medium">
            {index + 1} / {remaining.length}
          </span>
        </div>
      </div>

      {/* Scrollable card area with swipe */}
      <div
        className="flex-1 overflow-y-auto overscroll-none px-4 pb-4 space-y-3"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Lead header */}
        <div className="rounded-2xl bg-gray-900 border border-gray-700/80 p-4">
          <div className="flex items-start gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-tight">{localLead.address}</p>
              {(localLead.ownerName || localLead.firstName) && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {localLead.ownerName ||
                    `${localLead.firstName ?? ''} ${localLead.lastName ?? ''}`.trim()}
                </p>
              )}
            </div>
            <span className="text-xs text-red-400 font-semibold bg-red-950/50 border border-red-800/40 px-2 py-1 rounded-lg shrink-0">
              {formatOverdue(currentFU.scheduledAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                currentFU.type === 'appointment'
                  ? 'bg-green-900/50 text-green-300 border-green-700/40'
                  : 'bg-blue-900/40 text-blue-300 border-blue-700/40'
              }`}
            >
              {currentFU.type === 'appointment' ? '🗓️ Appointment' : '📅 Follow-Up'}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(currentFU.scheduledAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
          {currentFU.notes && (
            <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-800 pt-2">
              &ldquo;{currentFU.notes}&rdquo;
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Status</p>
          <StatusBadge
            status={localLead.status}
            interactive
            onChange={(s) => updateField('status', s)}
          />
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Notes</p>
          <textarea
            ref={notesRef}
            value={localLead.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Add notes… (autosaves)"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none text-sm transition-colors"
          />
        </div>

        {/* Follow-up date */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Next Follow-Up</p>
          <input
            type="datetime-local"
            value={localLead.followUpDate || ''}
            onChange={(e) => updateField('followUpDate', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Phone</p>
            <input
              type="tel"
              value={localLead.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Email</p>
            <input
              type="email"
              value={localLead.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick contact links */}
        {(localLead.phone || localLead.email) && (
          <div className="flex gap-2">
            {localLead.phone && (
              <a
                href={`tel:${localLead.phone}`}
                className="flex-1 py-2.5 rounded-xl bg-green-900/30 border border-green-700/40 text-green-300 text-sm font-medium text-center"
              >
                📞 Call
              </a>
            )}
            {localLead.phone && (
              <a
                href={`sms:${localLead.phone}`}
                className="flex-1 py-2.5 rounded-xl bg-blue-900/30 border border-blue-700/40 text-blue-300 text-sm font-medium text-center"
              >
                💬 Text
              </a>
            )}
          </div>
        )}

        {/* Inline outcome picker */}
        {showOutcome && (
          <div className="rounded-2xl bg-gray-900 border border-gray-700 p-4 space-y-3">
            <p className="text-sm font-bold text-white">What happened?</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(OUTCOME_LABELS) as OutcomeType[]).map((o) => (
                <button
                  key={o}
                  onClick={() => setSelectedOutcome(o === selectedOutcome ? null : o)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all text-xs font-medium active:scale-95 ${
                    selectedOutcome === o
                      ? 'border-blue-500 bg-blue-900/40 text-white scale-[1.03]'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span className="text-xl">{OUTCOME_ICONS[o]}</span>
                  <span className="text-center leading-tight">{OUTCOME_LABELS[o]}</span>
                </button>
              ))}
            </div>

            {selectedOutcome && NEEDS_DATE.includes(selectedOutcome) && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">
                  {selectedOutcome === 'appointment_set' || selectedOutcome === 'reschedule'
                    ? 'Appointment date & time'
                    : 'Next follow-up date & time'}
                </p>
                <input
                  type="datetime-local"
                  value={newFollowUpDate}
                  onChange={(e) => setNewFollowUpDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <textarea
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              placeholder="Notes (optional)…"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowOutcome(false);
                  setSelectedOutcome(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedOutcome && handleComplete(selectedOutcome)}
                disabled={!selectedOutcome}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-bold transition-colors"
              >
                Confirm ✓
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-4 pb-6 pt-3 border-t border-gray-800 shrink-0 space-y-2 bg-gray-950">
        {!showOutcome && (
          <button
            onClick={() => setShowOutcome(true)}
            className="w-full py-4 rounded-xl bg-green-700 hover:bg-green-600 active:scale-[0.98] text-white font-bold text-base transition-all"
          >
            ✓ Complete Follow-Up
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium disabled:opacity-30 hover:bg-gray-700 transition-colors active:scale-[0.98]"
          >
            ← Prev
          </button>
          <button
            onClick={goNext}
            className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors active:scale-[0.98]"
          >
            Skip →
          </button>
        </div>
        <p className="text-xs text-gray-600 text-center">Swipe left/right to navigate · Changes autosave</p>
      </div>
    </div>
  );
}
