'use client';

interface JobFeedTogglesProps {
  remoteOnly: boolean;
  bookmarkedOnly: boolean;
  onRemoteToggle: () => void;
  onBookmarkedToggle: () => void;
}

export function JobFeedToggles({ remoteOnly, bookmarkedOnly, onRemoteToggle, onBookmarkedToggle }: JobFeedTogglesProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onRemoteToggle}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
          remoteOnly ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-700 hover:border-neutral-900'
        }`}
      >
        Remote only
      </button>
      <button
        type="button"
        onClick={onBookmarkedToggle}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
          bookmarkedOnly
            ? 'border-neutral-900 bg-neutral-900 text-white'
            : 'border-neutral-200 text-neutral-700 hover:border-neutral-900'
        }`}
      >
        Saved roles
      </button>
    </div>
  );
}

export default JobFeedToggles;
