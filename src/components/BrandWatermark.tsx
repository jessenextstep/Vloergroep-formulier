import React from 'react';
import { brandWatermarkIcon } from '../lib/brandAssets';

export function BrandWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-[-14vw] bottom-[-12vw] z-0 select-none opacity-[0.05] md:right-[-10vw] md:bottom-[-10vw] md:opacity-[0.06] xl:opacity-[0.07]"
    >
      <img
        src={brandWatermarkIcon}
        alt=""
        className="block h-auto w-[58vw] min-w-[240px] max-w-[640px] md:w-[42vw] lg:w-[34vw] xl:w-[30vw]"
      />
    </div>
  );
}
