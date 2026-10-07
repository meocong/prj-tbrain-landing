import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { ScrollProgress } from "@/components/marketing/fx/ScrollProgress";
import type { Category } from "@/lib/samples/categories";
import { C } from "../tokens";
import { AccessSection } from "./AccessSection";
import { DatasetJsonLd } from "./DatasetJsonLd";
import { DeliverySection } from "./DeliverySection";
import { DocsTabs } from "./DocsTabs";
import { HandPoseFaq } from "./HandPoseFaq";
import { HandPoseHero } from "./HandPoseHero";
import { KnownLimits } from "./KnownLimits";
import { MethodSection } from "./MethodSection";
import { ProductMatrix } from "./ProductMatrix";
import { ReadingTheNumbers } from "./ReadingTheNumbers";
import { RecordModalHost } from "./RecordModalHost";
import { RecordingsTable } from "./RecordingsTable";
import { Workspace } from "./Workspace";

/**
 * /samples/hand-pose, whole.
 *
 * A showcase, not a shelf: what this set offers is a way to look at a hand's pose
 * frame by frame, so the page leads with the viewer. In order:
 *
 *   hero         what it is, four figures
 *   viewer       a demo: one recording played, camera video and the same pose
 *                in 3D, the state lane and the live numbers on one clock
 *   recordings   all of them in a sortable table; "Visualize" opens a row in the
 *                record dialog (`RecordModalHost`), the player beside its numbers
 *   docs         how to read it, how it is measured, what you receive, the
 *                products and limits, the FAQ, as tabs
 *   access       the licence and the three ways in
 *
 * Same frame as the rest of the samples pages — the scoped tokens, the real
 * header, one `<main>`, the real footer — so it reads as one site.
 *
 * Mounted from `[category]/page.tsx` only where the category exists on this
 * build (`HAND_POSE_ON`), so nothing here is reachable on production.
 */
export function HandPoseCategoryPage({ c }: { c: Category }) {
  return (
    <div className="samples-scope bp-chrome" style={{ background: C.base }}>
      <DatasetJsonLd path={`/samples/${c.slug}`} />
      <ScrollProgress />
      <Header />
      <main style={{ color: C.text }}>
        <HandPoseHero />
        <Workspace />
        <RecordingsTable />
        <DocsTabs
          id="docs"
          title="Documentation"
          tabs={[
            { id: "numbers", label: "Reading the numbers", panel: <ReadingTheNumbers /> },
            { id: "method", label: "How it is measured", panel: <MethodSection /> },
            { id: "delivery", label: "What you receive", panel: <DeliverySection /> },
            {
              id: "limits",
              label: "Products and limits",
              panel: (
                <>
                  <ProductMatrix />
                  <KnownLimits />
                </>
              ),
            },
            { id: "faq", label: "FAQ", panel: <HandPoseFaq /> },
          ]}
        />
        <AccessSection />
      </main>
      <Footer />
      <RecordModalHost />
    </div>
  );
}
