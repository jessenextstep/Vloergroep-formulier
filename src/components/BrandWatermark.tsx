import React from 'react';
import { brandWatermarkIcon } from '../lib/brandAssets';

export function BrandWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-[-18vw] top-[14vh] z-0 select-none opacity-[0.09] mix-blend-screen md:right-[-11vw] md:top-[10vh] md:opacity-[0.11] xl:opacity-[0.13]"
    >
      <img
        src={brandWatermarkIcon}
        alt=""
        className="block h-auto w-[74vw] min-w-[280px] max-w-[760px] brightness-110 contrast-125 md:w-[48vw] lg:w-[38vw] xl:w-[34vw]"
      />
    </div>
  );
}
