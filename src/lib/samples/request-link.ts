/**
 * Contact links out of the sample library.
 *
 * The site already has first-touch attribution: UtmCapture stashes utm_* from
 * the URL and the contact form replays it into /api/contact, which persists the
 * five utm columns. So enquiries are tagged with utm_* rather than an ad-hoc
 * ?ref= param that nothing on the receiving end reads.
 *
 * `sample` additionally rides through so the contact form can say what the
 * visitor was looking at when they clicked.
 */
export function requestUrl(opts: { from: string; sample?: string; title?: string }) {
  const params = new URLSearchParams({
    utm_source: "samples",
    utm_medium: "site",
    utm_campaign: "sample_library",
    utm_content: opts.sample ?? opts.from,
  });
  if (opts.sample) params.set("sample", opts.sample);
  if (opts.title) params.set("sample_title", opts.title);
  return `/contact?${params.toString()}`;
}
