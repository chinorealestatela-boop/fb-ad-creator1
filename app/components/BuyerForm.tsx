"use client";

import { useState } from "react";
import type {
  Buyer,
  PropertyType,
  InvestorStrategy,
  RehabLevel,
} from "../lib/types";

const PROPERTY_TYPES: PropertyType[] = [
  "single_family",
  "condo",
  "townhome",
  "duplex",
  "multi_family",
];
const STRATEGIES: InvestorStrategy[] = [
  "flip",
  "brrrr",
  "rental_hold",
  "wholesale",
];
const REHAB_LEVELS: RehabLevel[] = ["cosmetic", "moderate", "heavy", "gut"];

const TYPE_LABEL: Record<string, string> = {
  single_family: "Single Family",
  condo: "Condo",
  townhome: "Townhome",
  duplex: "Duplex",
  multi_family: "Multi-Family",
};
const STRAT_LABEL: Record<string, string> = {
  flip: "Flip",
  brrrr: "BRRRR",
  rental_hold: "Rental Hold",
  wholesale: "Wholesale",
};

// Blank buyer template for the "add" flow.
function blank(): Buyer {
  return {
    id: "",
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
    active: true,
    createdAt: new Date().toISOString(),
    buyBox: {
      minPrice: 0,
      maxPrice: 350_000,
      zips: [],
      cities: [],
      propertyTypes: [],
      strategies: ["flip"],
      minBeds: 2,
      minBaths: 1,
      maxRehabLevel: "moderate",
      minProfit: 30_000,
      minRoiPct: 12,
      avoidHighCrime: true,
    },
  };
}

export default function BuyerForm({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: Buyer | null; // null = add new
  onSave: (buyer: Buyer) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [b, setB] = useState<Buyer>(initial ?? blank());

  const set = (patch: Partial<Buyer>) => setB((prev) => ({ ...prev, ...patch }));
  const setBox = (patch: Partial<Buyer["buyBox"]>) =>
    setB((prev) => ({ ...prev, buyBox: { ...prev.buyBox, ...patch } }));

  const toggleArr = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const submit = () => {
    if (!b.name.trim() || !b.email.trim()) return;
    onSave(b);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 screen-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-white mb-4">
          {initial ? "Edit Buyer" : "Add Buyer"}
        </h2>

        <div className="space-y-4">
          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name *">
              <input
                className="inp"
                value={b.name}
                onChange={(e) => set({ name: e.target.value })}
              />
            </Field>
            <Field label="Company">
              <input
                className="inp"
                value={b.company ?? ""}
                onChange={(e) => set({ company: e.target.value })}
              />
            </Field>
            <Field label="Email *">
              <input
                className="inp"
                value={b.email}
                onChange={(e) => set({ email: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <input
                className="inp"
                value={b.phone ?? ""}
                onChange={(e) => set({ phone: e.target.value })}
              />
            </Field>
          </div>

          <div className="h-px" style={{ background: "var(--border)" }} />
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Buy Box
          </p>

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min Price">
              <input
                type="number"
                className="inp"
                value={b.buyBox.minPrice}
                onChange={(e) => setBox({ minPrice: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max Price">
              <input
                type="number"
                className="inp"
                value={b.buyBox.maxPrice}
                onChange={(e) => setBox({ maxPrice: Number(e.target.value) })}
              />
            </Field>
          </div>

          {/* Areas */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cities (comma-separated)">
              <input
                className="inp"
                placeholder="Las Vegas, Henderson"
                value={b.buyBox.cities.join(", ")}
                onChange={(e) =>
                  setBox({
                    cities: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
            <Field label="ZIPs (comma-separated)">
              <input
                className="inp"
                placeholder="89052, 89149"
                value={b.buyBox.zips.join(", ")}
                onChange={(e) =>
                  setBox({
                    zips: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
          </div>

          {/* Property types */}
          <Field label="Property Types (any if none selected)">
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((t) => (
                <Chip
                  key={t}
                  active={b.buyBox.propertyTypes.includes(t)}
                  onClick={() => setBox({ propertyTypes: toggleArr(b.buyBox.propertyTypes, t) })}
                >
                  {TYPE_LABEL[t]}
                </Chip>
              ))}
            </div>
          </Field>

          {/* Strategies */}
          <Field label="Strategies">
            <div className="flex flex-wrap gap-2">
              {STRATEGIES.map((s) => (
                <Chip
                  key={s}
                  active={b.buyBox.strategies.includes(s)}
                  onClick={() => setBox({ strategies: toggleArr(b.buyBox.strategies, s) })}
                >
                  {STRAT_LABEL[s]}
                </Chip>
              ))}
            </div>
          </Field>

          {/* Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="Min Beds">
              <input
                type="number"
                className="inp"
                value={b.buyBox.minBeds}
                onChange={(e) => setBox({ minBeds: Number(e.target.value) })}
              />
            </Field>
            <Field label="Min Baths">
              <input
                type="number"
                className="inp"
                value={b.buyBox.minBaths}
                onChange={(e) => setBox({ minBaths: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max Rehab">
              <select
                className="inp"
                value={b.buyBox.maxRehabLevel}
                onChange={(e) => setBox({ maxRehabLevel: e.target.value as RehabLevel })}
              >
                {REHAB_LEVELS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Min Profit">
              <input
                type="number"
                className="inp"
                value={b.buyBox.minProfit}
                onChange={(e) => setBox({ minProfit: Number(e.target.value) })}
              />
            </Field>
            <Field label="Min ROI %">
              <input
                type="number"
                className="inp"
                value={b.buyBox.minRoiPct}
                onChange={(e) => setBox({ minRoiPct: Number(e.target.value) })}
              />
            </Field>
            <Field label="Avoid High Crime">
              <select
                className="inp"
                value={b.buyBox.avoidHighCrime ? "yes" : "no"}
                onChange={(e) => setBox({ avoidHighCrime: e.target.value === "yes" })}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              className="inp"
              rows={2}
              value={b.notes ?? ""}
              onChange={(e) => set({ notes: e.target.value })}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: "var(--surface-2)", color: "var(--muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || !b.name.trim() || !b.email.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {saving ? "Saving..." : initial ? "Save Changes" : "Add Buyer"}
          </button>
        </div>

        <style jsx>{`
          .inp {
            width: 100%;
            border-radius: 8px;
            padding: 8px 10px;
            font-size: 13px;
            background: var(--surface-2);
            border: 1px solid var(--border);
            color: var(--foreground);
          }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        background: active ? "var(--accent)" : "var(--surface-2)",
        color: active ? "#fff" : "var(--muted)",
        border: "1px solid var(--border)",
      }}
    >
      {children}
    </button>
  );
}
