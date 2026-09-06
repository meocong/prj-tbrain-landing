"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DELIVERY_LAYERS, FORMATS } from "@/lib/samples/catalog";
import { C, EASE } from "./tokens";

/**
 * Hairline grid on the darker band. No card fills: the cells are defined by the
 * dividers between them, which keeps six items from reading as six boxes.
 */
export function DeliveryLayers() {
  const reduce = useReducedMotion();

  return (
    <section style={{ background: C.band, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 py-24 md:py-32 lg:px-10 xl:px-16">
        <div className="max-w-2xl">
          <h2
            className="text-3xl font-medium tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
          >
            What travels{" "}
            <span style={{ color: C.textDim }}>with every file</span>
          </h2>
          <p className="mt-5 text-sm leading-relaxed md:text-base" style={{ color: C.textMid }}>
            The same six layers ship whether the sample came from a workshop, a studio or a game
            session. That is what makes two domains comparable inside one training pipeline.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3">
          {DELIVERY_LAYERS.map((layer, i) => (
            <motion.article
              key={layer.key}
              className="px-0 py-8 sm:px-7 lg:py-10"
              style={{
                borderTop: `1px solid ${C.hairline}`,
                borderLeft: i % 3 !== 0 ? `1px solid ${C.hairlineSoft}` : undefined,
              }}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.06, ease: EASE }}
            >
              <p
                className="font-mono text-2xl tracking-tight md:text-3xl"
                style={{ color: C.accent, lineHeight: 1 }}
              >
                {layer.metric}
              </p>
              <h3
                className="mt-5 text-lg font-medium"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {layer.title}
              </h3>
              <p className="mt-2.5 max-w-sm text-sm leading-relaxed" style={{ color: C.textMid }}>
                {layer.detail}
              </p>
            </motion.article>
          ))}
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-12 lg:gap-10">
          <h3
            className="text-2xl font-medium tracking-tight lg:col-span-4 md:text-3xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
          >
            Loads without a converter
          </h3>
          <dl className="lg:col-span-8">
            {FORMATS.map((f) => (
              <div
                key={f.name}
                className="grid gap-2 py-5 sm:grid-cols-12 sm:gap-6"
                style={{ borderTop: `1px solid ${C.hairline}` }}
              >
                <dt
                  className="font-mono text-sm sm:col-span-4"
                  style={{ color: C.accent }}
                >
                  {f.name}
                </dt>
                <dd className="text-sm leading-relaxed sm:col-span-8" style={{ color: C.textMid }}>
                  {f.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
