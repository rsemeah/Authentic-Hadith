'use client';

import { FormEvent } from 'react';

interface JobSearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  locationFilter: string;
  onLocationChange: (value: string) => void;
  locations: string[];
  recentSearches: string[];
}

export function JobSearchBar({
  query,
  onQueryChange,
  onSubmit,
  locationFilter,
  onLocationChange,
  locations,
  recentSearches,
}: JobSearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[240px]">
            <label htmlFor="query" className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Search roles
            </label>
            <input
              id="query"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Product design, research ops, ..."
              className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
            />
          </div>
          <div className="w-full max-w-xs">
            <label htmlFor="location" className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Location
            </label>
            <div className="mt-2 relative">
              <select
                id="location"
                value={locationFilter}
                onChange={(event) => onLocationChange(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              >
                <option value="any">Any location</option>
                {locations.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400">▾</span>
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
            >
              Update feed
            </button>
          </div>
        </div>
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span className="font-semibold uppercase tracking-[0.18em]">Recent:</span>
            {recentSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onQueryChange(item)}
                className="rounded-full border border-neutral-200 px-3 py-1 text-neutral-700 hover:border-neutral-900"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </form>
    </section>
  );
}

export default JobSearchBar;
