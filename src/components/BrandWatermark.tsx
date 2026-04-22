import React from 'react';
import { brandWatermarkIcon } from '../lib/brandAssets';

export function BrandWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-[-11vw] right-[-10vw] z-0 select-none opacity-[0.095] mix-blend-screen md:bottom-[-7vw] md:right-[-6vw] md:opacity-[0.12] xl:bottom-[-5vw] xl:right-[-4vw] xl:opacity-[0.135]"
    >
      <img
        src={brandWatermarkIcon}
        alt=""
        className="block h-auto w-[74vw] min-w-[280px] max-w-[760px] brightness-[1.22] contrast-[1.18] drop-shadow-[0_0_32px_rgba(255,255,255,0.03)] md:w-[46vw] lg:w-[38vw] xl:w-[32vw]"
      />
    </div>
  );
}
