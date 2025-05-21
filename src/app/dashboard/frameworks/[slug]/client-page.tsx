'use client';

import { FrameworkClient } from '@/components/frameworks/FrameworkClient';

export default function FrameworkDetailClientPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <FrameworkClient id={slug} />
    </div>
  );
}
