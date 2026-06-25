'use client';
import { STATUS_COLORS, STATUS_LABELS, type LeadStatus } from '@/app/lib/door-knocking/types';

interface Props {
  status: LeadStatus;
  size?: 'sm' | 'md';
  interactive?: boolean;
  onChange?: (status: LeadStatus) => void;
}

const ALL_STATUSES: LeadStatus[] = [
  'new', 'no_answer', 'follow_up', 'interested',
  'appointment_set', 'not_interested', 'listing_signed',
];

export default function StatusBadge({ status, size = 'md', interactive, onChange }: Props) {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  if (!interactive) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding}`}
        style={{ backgroundColor: color + '22', color, border: `1px solid ${color}55` }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_STATUSES.map((s) => {
        const c = STATUS_COLORS[s];
        const active = s === status;
        return (
          <button
            key={s}
            onClick={() => onChange?.(s)}
            className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all ${padding}`}
            style={{
              backgroundColor: active ? c + '33' : 'transparent',
              color: active ? c : '#9ca3af',
              border: `1px solid ${active ? c : '#374151'}`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? c : '#4b5563' }} />
            {STATUS_LABELS[s]}
          </button>
        );
      })}
    </div>
  );
}
