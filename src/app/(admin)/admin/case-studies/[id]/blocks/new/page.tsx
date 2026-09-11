import { requireAdmin } from "@/lib/admin/server/list";
import { CaseStudyBlockForm } from "../block-form";

export const dynamic = "force-dynamic";

export default async function NewCaseStudyBlockPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("content.create");
  const { id } = await params;
  return <CaseStudyBlockForm caseStudyId={id} />;
}
