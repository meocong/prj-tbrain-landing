# Visuals

A post needs 3-5 visuals, and each one must carry information the reader would otherwise have to read a paragraph for. Decoration doesn't count: a robot photo next to a paragraph about data budgets is worse than no image.

Pick visuals in this order:

## 1. Figures from the original sources (preferred when the licence allows)

Run `source_license` on **every** arXiv paper you cite. If any is reusable, the post should show at least one of its figures (the method diagram or the key result), unless none of them helps the reader.

The paper, dataset card or project page usually has the best picture of the thing you're writing about: the capture rig, the data distribution, the result plot. Show it, crop it to the part you discuss, and say what to notice.

1. **Check the licence first.** For arXiv papers call `mcp_tbrain_cms_source_license` with the id. It returns `reusable`, a `credit_hint` and, when reusable, the paper's `figures` (url + caption).
   - Reusable: CC BY, CC BY-SA, CC0. Also figures on pages that say CC BY/CC0, Apache-2.0 or MIT for the repo the image lives in, and press kits meant for reuse.
   - **Not reusable**: arXiv's default licence (most papers), any NC or ND licence, journal/publisher pages, blog posts and news sites (copyrighted unless they say otherwise), YouTube frames, company marketing images.
   - Not reusable doesn't mean no visual: **redraw the numbers** with `render_chart` (facts and numbers are not copyrighted, the drawing is), credited "Data: Hoque et al., 2025 (EgoDex)". Or describe the figure in a sentence and link to it.
2. `mcp_tbrain_cms_fetch_source_image` with the figure URL. It saves the file under `/opt/data/figures/`.
3. Crop to the panel you discuss (a 5-panel figure where you discuss one panel is noise). Python with Pillow is available:
   `python3 -c "from PIL import Image; im=Image.open('/opt/data/figures/x.png'); print(im.size); im.crop((0,0,800,420)).save('/opt/data/figures/x-crop.png')"`
   Keep at least 700px wide when possible. Don't edit the content of a figure (no recolouring, no removing labels).
4. `mcp_tbrain_cms_upload_image` with the cropped file; use the returned URL.
5. Caption = what to notice + credit, in one `<em>` paragraph:
   `<p><em>Only 5% of DROID scenes are kitchens, which is why it generalises where earlier datasets didn't. Figure: Khazatsky et al., 2024 (DROID), CC BY 4.0.</em></p>`
   The credit is part of the licence: never drop it.

## 2. Original charts and diagrams (at least one per post)

`mcp_tbrain_cms_render_chart` draws a clean chart in the Tbrain style from a small spec and returns an SVG URL. Use it for the comparison or structure the post is really about:

| The paragraph says… | Use |
|---|---|
| "X is 5× bigger than Y", a ranking, a gap | `bar` (highlight the one item the paragraph is about) |
| how something grew or fell over time | `line` (≤4 series) |
| how we got here; releases in order | `timeline` (≤8 events, highlight the turning point) |
| a pipeline, a process, where things break | `flow` (≤6 steps, highlight the step the post is about) |
| a trade-off between two qualities; positioning options | `quadrant` |

Rules:
- The chart `title` states the claim the chart proves ("Most egocentric datasets are under 1,000 hours"), not a label ("Dataset sizes").
- Every number in a chart comes from a cited source or an approved knowledge item; put it in `source`. Never chart estimates you made up. A `flow` or `quadrant` that encodes our judgement is fine: say so in the caption ("our reading of …").
- Always fill `source` (it prints as the footer "Source: …"); `subtitle` says what is measured and in which units, nothing else.
- One measure per chart. Never put a 4-task average and a single-task number side by side as if comparable; make two charts or drop one.
- One chart per idea. Two charts that say the same thing: cut one. Vary the forms: three bar charts in one post reads like a slide deck; a `flow` of the method or a `timeline` usually says more.
- Caption says what to notice, not what the chart is ("EgoDex alone is a fifth of Ego4D's hours but all of it is hands").

## 3. The Tbrain image library (at most one, and only when it shows our own work)

`mcp_tbrain_cms_list_images` returns approved images of our capture work with a description of what each shows. Use one only when the paragraph next to it is about our own capture, QC or delivery, and the description matches. Never use a library image as decoration, never pick by file name, and never use more than one per post.

## Cover

The cover must be a PNG/JPEG (social cards can't show SVG, so a `render_chart` chart can't be the cover). Best: the strongest licensed source figure that reads well cropped to 2:1. Otherwise one library image that matches the topic. The cover may repeat an inline figure.

## Record every visual

In `agent_meta.images` and in the outline: `{url, why, kind: "source_figure" | "chart" | "library", credit, license, source_url}`. The reviewer sees the licence next to each figure; a source figure without `license` gets flagged.

Never link to `/samples`, never use third-party images whose licence you didn't check, and never put an image inside a link.
