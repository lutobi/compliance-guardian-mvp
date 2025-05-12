import { supabase } from "@/lib/supabase";
import AssessmentClient from "@/components/assessments/AssessmentClient";
import Link from "next/link";

async function AssessmentPage({ params }: { params: { id: string } }) {
  // existing code remains the same
}

export default function Page({ params }: { params: { id: string } }) {
  return <AssessmentClient id={params.id} />;
}
