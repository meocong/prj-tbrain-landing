# HTML format for `content_html`

The site sanitizes the body and strips anything outside this list. Write clean, semantic HTML:

- Section headings: `<h2>` (main sections) and `<h3>` (sub-points). **No `<h1>`**, since the post title is the h1.
- Paragraphs: `<p>`. Emphasis: `<strong>`, `<em>`.
- Lists: `<ul>` / `<ol>` with `<li>`.
- Links: `<a href="https://…">descriptive anchor</a>`. Internal links are site-relative: `<a href="/data/physical-ai/quality">our QC playbook</a>`.
- Quotes: `<blockquote><p>…</p></blockquote>` for pull quotes or short sourced quotes.
- Tables: `<table><thead><tr><th>…</th></tr></thead><tbody><tr><td>…</td></tr></tbody></table>` for comparisons or decision tables.
- Code: `<pre><code class="language-python">…</code></pre>`, or inline `<code>`.
- Images: `<img src="/images/…" alt="specific description">` followed by a caption paragraph `<p><em>What the reader should notice.</em></p>`, using only paths from `images.md` or URLs returned by `upload_image`. (No `<figure>`: the admin editor drops figcaptions.)
- Not allowed (removed): scripts, iframes, embeds, inline `style`, classes (except `language-*` on code), forms.

## Skeleton
```html
<p>Hook: a situation the reader is in (the decision, the money, the failure they fear). Concrete, 2-3 sentences.</p>
<p>The tension: why the obvious answer is wrong or incomplete, with one sourced fact. Thesis in one sentence.</p>
<p>What they will be able to do after reading (1 sentence).</p>

<h2>Section 1: the core idea</h2>
<p>…</p>
<img src="/images/…" alt="specific description">
<p><em>What the reader should notice in this image.</em></p>

<h2>Section 2: evidence / what the research shows</h2>
<p>… <a href="https://arxiv.org/abs/…">the X paper</a> …</p>

<h2>Section 3: what we see in the field</h2>
<p>Tbrain angle: concrete, anonymized.</p>

<h2>A practical checklist</h2>
<ul><li>…</li></ul>

<h2>Bottom line</h2>
<p>1 paragraph takeaway + specific CTA with an internal link.</p>
```
