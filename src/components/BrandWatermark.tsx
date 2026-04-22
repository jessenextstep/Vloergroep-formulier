import React from 'react';
import { brandWatermarkIcon } from '../lib/brandAssets';

export function BrandWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-[-16vw] right-[-16vw] z-0 select-none opacity-[0.055] mix-blend-screen md:bottom-[-10vw] md:right-[-10vw] md:opacity-[0.07] xl:bottom-[-8vw] xl:right-[-8vw] xl:opacity-[0.08]"
    >
      <img
        src={brandWatermarkIcon}
        alt=""
        className="block h-auto w-[70vw] min-w-[260px] max-w-[720px] brightness-110 contrast-125 md:w-[42vw] lg:w-[34vw] xl:w-[30vw]"
      />
    </div>
  );
}
