'use client';

import { useMemo, useState } from 'react';
import { DemoAccountBanner } from '@/components/demo/DemoAccountBanner';
import { JobSearchBar } from '@/components/discovery/JobSearchBar';
import { JobFeedToggles } from '@/components/discovery/JobFeedToggles';
import { JobFeed } from '@/components/discovery/JobFeed';
import { JobDetailModal } from '@/components/discovery/JobDetailModal';
import type { JobPosting } from '@/types/jobs';

const JOB_POSTINGS: JobPosting[] = [
  {
    id: '1',
    title: 'Senior Product Designer',
    company: 'Noor Labs',
    location: 'Remote',
    type: 'remote',
    tags: ['Figma', 'Research', 'Systems'],
    description: 'Shape calm work tools used by thoughtful teams. Partner with research to craft grounded flows.',
    stipend: '$160k · equity',
    postedAt: '2 days ago',
    experience: '7+ yrs',
    applyUrl: 'https://example.com/jobs/1',
  },
  {
    id: '2',
    title: 'Design Systems Lead',
    company: 'Ummah Finance',
    location: 'London, UK',
    type: 'hybrid',
    tags: ['Tokens', 'Accessibility', 'Leadership'],
    description: 'Guide a small team building trustworthy finance tooling rooted in Islamic principles.',
    stipend: '£120k · hybrid',
    postedAt: '4 days ago',
    experience: '5+ yrs',
    applyUrl: 'https://example.com/jobs/2',
  },
  {
    id: '3',
    title: 'Product Researcher',
    company: 'Calm Search',
    location: 'Toronto, Canada',
    type: 'remote',
    tags: ['Qual', 'Workshops', 'Storytelling'],
    description: 'Facilitate listening sessions and turn insights into gentle improvements for the job discovery flow.',
    stipend: '$140k · contractor',
    postedAt: '1 week ago',
    experience: '4+ yrs',
    applyUrl: 'https://example.com/jobs/3',
  },
  {
    id: '4',
    title: 'Brand Designer',
    company: 'Saada Studio',
    location: 'Dubai, UAE',
    type: 'onsite',
    tags: ['Campaigns', 'Motion', 'Copy'],
    description: 'Craft visual narratives for human-centered fintech and wellness founders.',
    stipend: 'AED 28k/mo',
    postedAt: '5 days ago',
    experience: 'Mid-level',
    applyUrl: 'https://example.com/jobs/4',
  },
];

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('any');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(['calm companies', 'design systems']);

  const locations = useMemo(() => Array.from(new Set(JOB_POSTINGS.map((job) => job.location))).sort(), []);
  const bookmarkedSet = useMemo(() => new Set(bookmarkedJobs), [bookmarkedJobs]);

  const filteredJobs = useMemo(() => {
    return JOB_POSTINGS.filter((job) => {
      if (remoteOnly && job.type !== 'remote') {
        return false;
      }

      if (bookmarkedOnly && !bookmarkedSet.has(job.id)) {
        return false;
      }

      if (locationFilter !== 'any' && job.location !== locationFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = `${job.title} ${job.company} ${job.tags.join(' ')}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [bookmarkedOnly, bookmarkedSet, locationFilter, query, remoteOnly]);

  const selectedJob = useMemo(() => JOB_POSTINGS.find((job) => job.id === selectedJobId) ?? null, [selectedJobId]);

  const handleSubmit = () => {
    if (!query.trim()) {
      return;
    }

    setRecentSearches((prev) => {
      const withoutDupes = prev.filter((item) => item !== query.trim());
      return [query.trim(), ...withoutDupes].slice(0, 5);
    });

    if (filteredJobs.length > 0) {
      setSelectedJobId(filteredJobs[0].id);
    }
  };

  const handleBookmarkToggle = (jobId: string) => {
    setBookmarkedJobs((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId);
      }

      return [...prev, jobId];
    });
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Discovery</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Calm jobs for patient builders</h1>
        <p className="text-sm text-neutral-600">
          Track thoughtful teams hiring designers and researchers. Apply gently, keep notes, and share leads with your circle.
        </p>
      </header>

      <DemoAccountBanner />

      <JobSearchBar
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        locations={locations}
        recentSearches={recentSearches}
      />

      <JobFeedToggles
        remoteOnly={remoteOnly}
        bookmarkedOnly={bookmarkedOnly}
        onRemoteToggle={() => setRemoteOnly((prev) => !prev)}
        onBookmarkedToggle={() => setBookmarkedOnly((prev) => !prev)}
      />

      <JobFeed
        jobs={filteredJobs}
        selectedJobId={selectedJobId}
        bookmarkedJobIds={bookmarkedSet}
        onSelect={(job) => setSelectedJobId(job.id)}
        onBookmarkToggle={handleBookmarkToggle}
      />

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJobId(null)} />
    </main>
  );
}
