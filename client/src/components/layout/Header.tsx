import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Circle } from 'lucide-react';

export function Header() {
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    api.health().then(h => setProviders(h.availableProviders)).catch(() => {});
  }, []);

  return (
    <header className="h-14 bg-white border-b border-ramp-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-ramp-gray-500">
          {providers.length > 0 ? (
            <>
              <Circle size={8} className="fill-ramp-green text-ramp-green" />
              <span>{providers.length} provider{providers.length !== 1 ? 's' : ''} online</span>
            </>
          ) : (
            <>
              <Circle size={8} className="fill-red-400 text-red-400" />
              <span>No providers configured</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
