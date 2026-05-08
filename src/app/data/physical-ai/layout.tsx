import type { ReactNode } from "react";
import { ForceDarkScope } from "@/components/theme/ForceDarkScope";

export default function PhysicalAILayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ForceDarkScope />
      {children}
    </>
  );
}
