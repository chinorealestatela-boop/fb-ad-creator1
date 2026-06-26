'use client';
import { useState } from 'react';
import {
  saveLead,
  saveFollowUp,
  markFollowUpComplete,
  addActivity,
} from '@/app/lib/door-knocking/db';
import type { Lead, FollowUp, LeadStatus, OutcomeType, FollowUpType } from '@/app/lib/door-knocking/types';
import {
  OUTCOME_LABELS,
  OUTCOME_ICONS,
} from '@/app/lib/door-knocking/types';

// Maps outcome → new lead status (null = no change)
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

// Outcomes that need a datetime for a new follow-up/appointment
const NEEDS_DATETIME: OutcomeType[] = [
  'not_home',
  'reschedule',
  'schedule_follow_up',
  'appointment_set',
  'callback_requested',
];

// Follow-up type per outcome
const OUTCOME_FU_TYPE: Partial<Record<OutcomeType, FollowUpType>> = {
  not_home: 'follow_up',
  reschedule: 'appointment',
  schedule_follow_up: 'follow_up',
  appointment_set: 'appointment',
  callback_requested: 'follow_up',
};

interface Step2Config {
  heading: string;
  showDateTime: boolean;
  dateTimeLabel: string;
  showNotes: boolean;
  notesLabel: string;
  showOptionalFollowUp?: boolean; // for 'left_information' and 'other'
  confirmOnly?: boolean; // for 'sold' and 'not_interested'
}

const STEP2_CONFIG: Record<OutcomeType, Step2Config> = {
  not_home: {
    heading: 'Schedule next visit',
    showDateTime: true,
    dateTimeLabel: 'When should you come back?',
    showNotes: true,
    notesLabel: 'Any notes?',
  },
  reschedule: {
    heading: 'New appointment time',
    showDateTime: true,
    dateTimeLabel: 'New appointment date & time',
    showNotes: true,
    notesLabel: 'Notes for this appointment',
  },
  schedule_follow_up: {
    heading: 'Schedule a follow-up',
    showDateTime: true,
    dateTimeLabel: 'Follow-up date & time',
    showNotes: true,
    notesLabel: 'What to follow up on?',
  },
  appointment_set: {
    heading: 'Appointment details',
    showDateTime: true,
    dateTimeLabel: 'Appointment date & time',
    showNotes: true,
    notesLabel: 'Appointment notes',
  },
  sold: {
    heading: 'Mark as Sold',
    showDateTime: false,
    dateTimeLabel: '',
    showNotes: true,
    notesLabel: 'Closing notes (optional)',
    confirmOnly: true,
  },
  not_interested: {
    heading: 'Mark as Not Interested',
    showDateTime: false,
    dateTimeLabel: '',
    showNotes: true,
    notesLabel: 'Why not interested? (optional)',
    confirmOnly: true,
  },
  left_information: {
    heading: 'Left information',
    showDateTime: false,
    dateTimeLabel: '',
    showNotes: true,
    notesLabel: 'What did you leave?',
    showOptionalFollowUp: true,
  },
  callback_requested: {
    heading: 'Callback requested',
    showDateTime: true,
    dateTimeLabel: 'When to call back?',
    showNotes: true,
    notesLabel: 'Notes',
  },
  other: {
    heading: 'Notes',
    showDateTime: false,
    dateTimeLabel: '',
    showNotes: true,
    notesLabel: 'What happened?',
    showOptionalFollowUp: true,
  },
};

// Outcomes grouped by color/severity for the picker grid
const OUTCOME_GROUPS: { outcomes: OutcomeType[]; color: string }[] = [
  { outcomes: ['not_home', 'reschedule'], color: '#9ca3af' },
  { outcomes: ['schedule_follow_up', 'callback_requested'], color: '#eab308' },
  { outcomes: ['appointment_set', 'sold'], color: '#22c55e' },
  { outcomes: ['left_information', 'not_interested', 'other'], color: '#6b7280' },
];

function localDatetimeNow(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

interface Props {
  followUp: FollowUp;
  lead: Lead;
  onDone: (updatedLead: Lead) => void;
  onCancel: () => void;
}

export default function OutcomeModal({ followUp, lead, onDone, onCancel }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [outcome, setOutcome] = useState<OutcomeType | null>(null);
  const [dateTime, setDateTime] = useState(localDatetimeNow());
  const [notes, setNotes] = useState('');
  const [addFollowUp, setAddFollowUp] = useState(false);
  const [followUpDateTime, setFollowUpDateTime] = useState(localDatetimeNow());
  const [saving, setSaving] = useState(false);

  function handleOutcomeSelect(o: OutcomeType) {
    setOutcome(o);
    setStep(2);
  }

  async function handleSubmit() {
    if (!outcome) return;
    setSaving(true);
    const now = Date.now();
    const cfg = STEP2_CONFIG[outcome];

    // 1. Mark the original follow-up complete
    if (followUp.id) {
      await markFollowUpComplete(followUp.id, outcome, notes);
    }

    // 2. Determine new lead status
    const newStatus: LeadStatus = OUTCOME_STATUS[outcome] ?? lead.status;
    let newFollowUpDate = lead.followUpDate;

    // 3. Create new follow-up / appointment if needed
    const needsNewFU = NEEDS_DATETIME.includes(outcome);
    const optionalFU = cfg.showOptionalFollowUp && addFollowUp;

    if (needsNewFU || optionalFU) {
      const fuDateTime = needsNewFU ? dateTime : followUpDateTime;
      const fuType: FollowUpType = OUTCOME_FU_TYPE[outcome] ?? 'follow_up';
      await saveFollowUp({
        leadId: lead.id!,
        leadAddress: lead.address,
        type: fuType,
        scheduledAt: fuDateTime,
        notes,
        completed: false,
        createdAt: now,
      });
      newFollowUpDate = fuDateTime;
    }

    // 4. Update the lead
    const updatedLead: Lead = {
      ...lead,
      status: newStatus,
      followUpDate: newFollowUpDate,
      updatedAt: now,
      synced: false,
    };
    await saveLead(updatedLead);

    // 5. Log activity timeline entry
    await addActivity({
      leadId: lead.id!,
      type: 'follow_up_completed',
      timestamp: now,
      data: {
        followUpType: followUp.type,
        scheduledAt: followUp.scheduledAt,
        outcome,
        outcomeLabel: OUTCOME_LABELS[outcome],
        notes,
        newFollowUpAt: (needsNewFU || optionalFU) ? (needsNewFU ? dateTime : followUpDateTime) : undefined,
        statusChanged: newStatus !== lead.status,
        fromStatus: lead.status,
        toStatus: newStatus,
      },
    });

    setSaving(false);
    onDone(updatedLead);
  }

  const cfg = outcome ? STEP2_CONFIG[outcome] : null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg mx-auto bg-gray-900 border-t border-gray-700 rounded-t-2xl pb-safe-bottom max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-600" />
        </div>

        <div className="px-5 pb-6">
          {step === 1 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Mark Complete</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{followUp.leadAddress || lead.address}</p>
                </div>
                <button onClick={onCancel} className="text-gray-500 hover:text-white p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-gray-300 mb-4">What happened at this {followUp.type === 'appointment' ? 'appointment' : 'follow-up'}?</p>

              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(OUTCOME_LABELS) as OutcomeType[]).map((o) => (
                  <button
                    key={o}
                    onClick={() => handleOutcomeSelect(o)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-gray-600 active:scale-95 transition-all"
                  >
                    <span className="text-2xl">{OUTCOME_ICONS[o]}</span>
                    <span className="text-xs text-gray-300 text-center leading-tight font-medium">
                      {OUTCOME_LABELS[o]}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && outcome && cfg && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{OUTCOME_ICONS[outcome]}</span>
                    <h2 className="text-base font-bold text-white">{cfg.heading}</h2>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{lead.address}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Date/time picker */}
                {cfg.showDateTime && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
                      {cfg.dateTimeLabel}
                    </label>
                    <input
                      type="datetime-local"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                )}

                {/* Notes */}
                {cfg.showNotes && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
                      {cfg.notesLabel}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Enter notes…"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none transition-colors"
                    />
                  </div>
                )}

                {/* Optional follow-up toggle for 'left_information' and 'other' */}
                {cfg.showOptionalFollowUp && (
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setAddFollowUp((v) => !v)}
                        className={`relative w-10 h-6 rounded-full transition-colors ${addFollowUp ? 'bg-blue-600' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${addFollowUp ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                      <span className="text-sm text-gray-300">Schedule a follow-up</span>
                    </label>
                    {addFollowUp && (
                      <div className="mt-3">
                        <label className="block text-xs text-gray-400 mb-1.5">Follow-up date & time</label>
                        <input
                          type="datetime-local"
                          value={followUpDateTime}
                          onChange={(e) => setFollowUpDateTime(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Status change preview */}
                {OUTCOME_STATUS[outcome] && OUTCOME_STATUS[outcome] !== lead.status && (
                  <div className="rounded-xl bg-blue-950/40 border border-blue-800/30 px-4 py-3 text-sm text-blue-300">
                    Lead status will update to <strong>{OUTCOME_STATUS[outcome]?.replace(/_/g, ' ')}</strong>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-base transition-colors"
                >
                  {saving ? 'Saving…' : cfg.confirmOnly ? 'Confirm' : 'Save & Continue'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
