"use client";

import { FrameworkClient } from '@/components/frameworks/FrameworkClient';

export interface FrameworkDetailProps {
  id: string;
  name: string;
  description: string;
  version: string;
  categories: string[];
}

export function FrameworkDetail({
  id,
  name,
  description,
  version,
  categories,
}: FrameworkDetailProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <FrameworkClient
        id={id}
        name={name}
        description={description}
        version={version}
        categories={categories}
      />
    </div>
  );
}
