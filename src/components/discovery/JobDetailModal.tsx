'use client';

import type { JobPosting } from '@/types/jobs';

interface JobDetailModalProps {
  job: JobPosting | null;
  onClose: () => void;
}

export function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  if (!job) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Deep dive</p>
            <h2 className="text-2xl font-semibold text-neutral-900">{job.title}</h2>
            <p className="text-sm text-neutral-600">
              {job.company} · {job.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-200 px-3 py-1 text-sm font-semibold text-neutral-600 hover:border-neutral-900"
          >
            Close
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-neutral-700">{job.description}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Compensation</p>
            <p className="mt-1 text-base font-semibold text-neutral-900">{job.stipend}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Experience</p>
            <p className="mt-1 text-base font-semibold text-neutral-900">{job.experience}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs text-neutral-600">
          {job.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-neutral-200 px-3 py-1">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-2xl bg-neutral-900 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
          >
            Apply now
          </a>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-neutral-700 hover:text-neutral-900">
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobDetailModal;
