'use client';

/**
 * Basic Potree Example
 * Minimal setup to get Potree running in Next.js
 */

import {
  PotreeProvider,
  PotreeLoader,
  PotreeViewer,
} from '@/src/potree-viewer';

export default function BasicExample() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PotreeProvider>
        <PotreeLoader basePath="/potree-static">
          <PotreeViewer
            config={{
              fov: 60,
              pointBudget: 500_000,
            }}
            style={{ width: '100%', height: '100%' }}
          />
        </PotreeLoader>
      </PotreeProvider>
    </div>
  );
}
