'use client';

import AssessmentClient from "@/components/assessments/AssessmentClient";

export default function Page({ params }: { params: { id: string } }) {
  return <AssessmentClient id={params.id} />;
}
