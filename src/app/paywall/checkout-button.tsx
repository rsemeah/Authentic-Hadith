'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
  priceId: string;
  label: string;
  customerEmail?: string;
}

export function CheckoutButton({ priceId, label, customerEmail }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, customerEmail }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? 'Unable to start checkout.');
      }

      window.location.href = data.url as string;
    } catch (checkoutError) {
      const fallbackMessage = checkoutError instanceof Error ? checkoutError.message : 'Unable to start checkout.';
      setError(fallbackMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={startCheckout}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-white/60 transition hover:bg-white disabled:opacity-60"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-500 delay-75" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-600 delay-150" />
            <span className="sr-only">Starting checkout</span>
          </span>
        ) : (
          label
        )}
      </button>
      {error ? <p className="text-center text-xs text-red-200">{error}</p> : null}
    </div>
  );
}
