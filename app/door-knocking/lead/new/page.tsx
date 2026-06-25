'use client';
import Link from 'next/link';
import LeadForm from '@/app/components/door-knocking/LeadForm';

export default function NewLeadPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] p-4 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6 pt-2">
        <Link href="/door-knocking" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">New Lead</h1>
      </div>

      <LeadForm mode="create" />
    </main>
  );
}
