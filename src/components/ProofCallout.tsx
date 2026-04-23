import React from 'react';
import { BrandMark } from './BrandMark';

interface ProofCalloutProps {
  title?: string;
  body: string;
}

function ProofCalloutComponent({
  title = 'Wist je dat VloerGroep...',
  body,
}: ProofCalloutProps) {
  return (
    <div className="mb-8 flex items-start gap-4 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(38,38,38,0.4),rgba(18,18,18,0.18))] p-5 text-left backdrop-blur-xl">
      <BrandMark className="mt-0.5 h-10 w-10 shrink-0 rounded-[14px]" />
      <div className="min-w-0 flex-1 text-left">
        <h4 className="mb-1 text-left text-sm font-medium text-white">{title}</h4>
        <p className="text-left text-sm leading-6 text-white/72">{body}</p>
      </div>
    </div>
  );
}

ProofCalloutComponent.displayName = 'ProofCallout';

export const ProofCallout = React.memo(ProofCalloutComponent);
