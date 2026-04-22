import React from 'react';
import { BrandMark } from './BrandMark';

interface ProofCalloutProps {
  title?: string;
  body: string;
}

export function ProofCallout({
  title = 'VloerGroep Proof',
  body,
}: ProofCalloutProps) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-8 flex gap-4 items-start">
      <BrandMark className="h-11 w-11 rounded-[14px] mt-0.5" />
      <div>
        <h4 className="text-white font-medium text-sm mb-1">{title}</h4>
        <p className="text-white/60 text-sm leading-6">{body}</p>
      </div>
    </div>
  );
}
