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
    <div className="mb-8 flex items-start gap-4 rounded-[20px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
      <BrandMark className="mt-0.5 h-10 w-10 rounded-[14px]" />
      <div>
        <h4 className="mb-1 text-sm font-medium text-white">{title}</h4>
        <p className="text-white/72 text-sm leading-6">{body}</p>
      </div>
    </div>
  );
}

ProofCalloutComponent.displayName = 'ProofCallout';

export const ProofCallout = React.memo(ProofCalloutComponent);
