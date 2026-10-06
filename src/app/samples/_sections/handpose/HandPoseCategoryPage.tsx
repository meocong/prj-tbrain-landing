import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { ScrollProgress } from "@/components/marketing/fx/ScrollProgress";
import type { Category } from "@/lib/samples/categories";
import { C } from "../tokens";
import { AccessSection } from "./AccessSection";
import { AtAGlance } from "./AtAGlance";
import { CatalogueSection } from "./CatalogueSection";
import { CompareTable } from "./CompareTable";
import { DatasetJsonLd } from "./DatasetJsonLd";
import { DeliverySection } from "./DeliverySection";
import { HandPoseFaq } from "./HandPoseFaq";
import { HandPoseHero } from "./HandPoseHero";
import { KnownLimits } from "./KnownLimits";
import { MethodSection } from "./MethodSection";
import { ProductMatrix } from "./ProductMatrix";
import { ReadingTheNumbers } from "./ReadingTheNumbers";

/**
 * /samples/hand-pose, whole.
 *
 * The other category pages are one skeleton with the category swapped in; this
 * one is not, because what it sells is not footage. Its public layer is a
 * metrics table, a state lane per sample and two skeleton renders, and the page
 * is built to make a reader trust numbers rather than to play clips. So it has
 * its own sections, in an order that answers a buyer's questions as they arise:
 * what is it, what is in it, how do I read it, how do the samples compare, how
 * is it made, what do I receive, what is it not, and how do I get it.
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
        <AtAGlance />
        <CatalogueSection />
        <ReadingTheNumbers />
        <CompareTable />
        <MethodSection />
        <DeliverySection />
        <ProductMatrix />
        <KnownLimits />
        <HandPoseFaq />
        <AccessSection />
      </main>
      <Footer />
    </div>
  );
}
