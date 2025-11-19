'use client';

import type { JobPosting } from '@/types/jobs';

interface JobFeedProps {
  jobs: JobPosting[];
  selectedJobId: string | null;
  bookmarkedJobIds: Set<string>;
  onSelect: (job: JobPosting) => void;
  onBookmarkToggle: (jobId: string) => void;
}

export function JobFeed({ jobs, selectedJobId, bookmarkedJobIds, onSelect, onBookmarkToggle }: JobFeedProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-6 text-sm text-neutral-600">
        Nothing matches your filters yet. Try broadening the search to see more calm teams.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {jobs.map((job) => {
        const isSelected = selectedJobId === job.id;
        const isBookmarked = bookmarkedJobIds.has(job.id);

        return (
          <li key={job.id}>
            <article
              className={`cursor-pointer rounded-3xl border p-5 shadow-sm transition ${
                isSelected ? 'border-neutral-900 bg-neutral-900/5' : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
              onClick={() => onSelect(job)}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">{job.title}</h3>
                  <p className="text-sm text-neutral-600">
                    {job.company} · {job.location} · {job.experience}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onBookmarkToggle(job.id);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    isBookmarked
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-900'
                  }`}
                >
                  {isBookmarked ? 'Saved' : 'Save role'}
                </button>
              </div>
              <p className="mt-3 text-sm text-neutral-700">{job.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">{job.stipend}</span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">{job.postedAt}</span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">{job.type}</span>
                {job.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-neutral-200 px-3 py-1 text-neutral-700">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

export default JobFeed;
