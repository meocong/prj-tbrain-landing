# Visuals

A post needs 3-6 visuals, in **at least 3 different forms**, and each one must carry information the reader would otherwise have to read a paragraph for. Decoration doesn't count: a robot photo next to a paragraph about data budgets is worse than no image.

The forms, roughly from most to least "wow":
1. **Video** of the system actually working (official project/lab video).
2. **Annotated source figure**: a licensed figure with numbered call-outs.
3. **Source figure**: a licensed figure, cropped to the panel you discuss.
4. **Original chart or diagram** (`render_chart`): stat, matrix, scatter, share, line, bar, timeline, flow, quadrant.
5. **Library photo** of our own work (at most one).

A strong post mixes a source visual (1-3) with 1-3 of our own charts in different forms. Three bar charts is one form, not three.

## 1. Video from the source (when one exists)

Most robotics papers have a project page with a demo video on YouTube. A 20-second clip of the robot folding the shirt says more than any figure.
- Use only the official video: linked from the paper's project page, the lab's or company's own channel. Never re-uploads, ads for a competitor's product, or videos of identifiable members of the public filmed without context.
- Embed with `<iframe src="https://www.youtube.com/watch?v=VIDEO_ID" title="what it shows"></iframe>` (the site converts it to a privacy-friendly embed; add `&t=42` to start at the moment that matters). Follow it with a caption paragraph: `<p><em>Watch the gripper at 0:42: … Video: <lab>, <project>.</em></p>`.
- One video per post, two at most. Say in the text what to watch for.
- Record it as `{kind: "video", url, why, credit: "<lab>, <project page url>", license: "YouTube embed"}`.

## 2. Figures from the original sources (when the licence allows)

Run `mcp_tbrain_cms_source_license` on **every** arXiv paper you cite. If any is reusable, show at least one of its figures (the method diagram or the key result), unless none helps the reader.

1. **Licence.** `source_license` returns `reusable`, a `credit_hint` and, when reusable, the paper's `figures` (url + caption).
   - Reusable: CC BY, CC BY-SA, CC0. Also figures on pages that say CC BY/CC0, Apache-2.0 or MIT for the repo the image lives in, and press kits meant for reuse.
   - **Not reusable**: arXiv's default licence (most papers), any NC or ND licence, journal/publisher pages, blogs and news sites (copyrighted unless they say otherwise), YouTube frames, company marketing images.
   - Not reusable doesn't mean no visual: embed the paper's official video if there is one, or **redraw the numbers** with `render_chart` (facts and numbers are not copyrighted, the drawing is), credited "Data: Hoque et al., 2025 (EgoDex)".
2. `mcp_tbrain_cms_fetch_source_image` with the figure URL (saves it under `/opt/data/figures/`).
3. `mcp_tbrain_cms_upload_image` with that path and, to keep only the panel you discuss, `crop: {x, y, w, h}` as fractions of the image. The figure caption usually says how the panels are laid out ("Left: … Right: …" → left half is `{x:0, y:0, w:0.5, h:1}`). Never alter the content of a figure (no recolouring, no removing labels). If unsure about the layout, upload it uncropped.
4. Caption = what to notice + credit, in one `<em>` paragraph:
   `<p><em>Only 5% of DROID scenes are kitchens, which is why it generalises where earlier datasets didn't. Figure: Khazatsky et al., 2024 (DROID), CC BY 4.0.</em></p>`
   The credit is part of the licence: never drop it.

### Annotated figure (wow, but only with eyes)

`render_chart` with `type: "annotate"` draws numbered call-outs (dot, box, arrow) on an uploaded licensed figure, with the labels in a legend under it and "· annotated by Tbrain" in the footer (CC BY requires saying it was changed).
- You must know where things are. Use the vision tool (`vision_analyze`) on the uploaded figure to get positions as fractions of width/height, then look at the returned `png_url` with the vision tool again to check each marker lands on what its label says. If the vision tool is unavailable or unsure, **don't annotate**: use the plain figure and say what to look at in the caption.
- 2-4 markers is the sweet spot; each label says why that spot matters, not what it is ("Wrist camera: the only view that sees contact").
- Record as `{kind: "annotated_figure", url: png_url, credit, license, source_url}`.

## 3. Original charts and diagrams (at least one per post)

`mcp_tbrain_cms_render_chart` returns `url` (SVG, for inline `<img>`) and `png_url` (for covers and social). Pick the form from what the paragraph says:

| The paragraph says… | Form |
|---|---|
| 2-4 numbers that frame the whole post | `stat` (hero numbers; great right after the opening) |
| which option has which property | `matrix` (✓ / partly / – grid; the synthesis workhorse) |
| a ranking, a gap, "X is 5× Y" | `bar` (highlight the one item the paragraph is about) |
| two quantities against each other ("more data, not more success") | `scatter` (use `log_x` for hours/episodes spanning orders of magnitude) |
| how something is split (a data mix, where a budget goes) | `share` |
| how something grew or fell over time | `line` (≤4 series) |
| how we got here; releases in order | `timeline` (highlight the turning point) |
| a pipeline, a method, where things break | `flow` (highlight the step the post is about) |
| a trade-off between two qualities | `quadrant` |

Rules:
- `title` states the claim the chart proves ("No human-video dataset labels contact"), not a label ("Dataset comparison").
- Always fill `source` (it prints as the footer); `subtitle` says what is measured and in which units.
- One measure per chart. Never set a 4-task average beside a single-task number as if comparable.
- Every number comes from a cited source, an approved knowledge item or your own `hf_hub_query` / `arxiv_count` result; never chart estimates you made up. A `flow`, `matrix` or `quadrant` that encodes our judgement is fine: say so in the caption ("our reading of the papers").
- One chart per idea; no two charts of the same form in a post unless it's a `by_the_numbers` post.
- Caption says what to notice, not what the chart is.
- Record as `{kind: "chart", form: "<type>", url, why, credit: "Tbrain", license: "original"}`.

## 4. The Tbrain image library (at most one, only for our own work)

`mcp_tbrain_cms_list_images` returns approved images of our capture work with a description of what each shows. Use one only next to a paragraph about our own capture, QC or delivery whose description matches. Never as decoration, never by file name, never more than one.

## Cover

The cover must be a PNG/JPEG (social cards can't show SVG). In order of preference:
1. A licensed source figure (or annotated figure `png_url`) that reads well cropped to 2:1.
2. A **cover card**: `render_chart` with `type: "cover"`, `title` (the post title or a shorter hook), `eyebrow` ("Deep dive · Teleop data"), and a `stat` when the post has one killer number. Use its `png_url`. This is the default when there's no great figure.
3. A library photo, only for `field_story` / `proof` posts about our own work.

## Record every visual

In the outline and in `agent_meta.images`: `{url, why, kind, form?, credit, license, source_url}`. The reviewer sees the licence next to each source visual; one without `license` gets flagged.

Never link to `/samples`, never use third-party images whose licence you didn't check, and never put an image inside a link.
