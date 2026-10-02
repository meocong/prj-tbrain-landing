# HTML format for `content_html`

The site sanitizes the body and strips anything outside this list. Write clean, semantic HTML:

- Section headings: `<h2>` (main sections) and `<h3>` (sub-points). **No `<h1>`**, since the post title is the h1.
- Paragraphs: `<p>`. Emphasis: `<strong>`, `<em>`.
- Lists: `<ul>` / `<ol>` with `<li>`.
- Links: `<a href="https://…">descriptive anchor</a>`. Internal links are site-relative: `<a href="/samples">sample capture packs</a>`.
- Quotes: `<blockquote><p>…</p></blockquote>` for pull quotes or short sourced quotes.
- Tables: `<table><thead><tr><th>…</th></tr></thead><tbody><tr><td>…</td></tr></tbody></table>` for comparisons or decision tables.
- Code: `<pre><code class="language-python">…</code></pre>`, or inline `<code>`.
- Images: `<figure><img src="/images/…" alt="specific description"><figcaption>…</figcaption></figure>`, using only paths from `images.md` or URLs returned by `upload_image`.
- Not allowed (removed): scripts, iframes, embeds, inline `style`, classes (except `language-*` on code), forms.

## Skeleton
```html
<p>Hook: the reader's problem or a sourced, surprising fact. Thesis in sentence 2-3.</p>
<p>What this post covers and who it's for (1-2 sentences).</p>

<h2>Section 1: the core idea</h2>
<p>…</p>

<h2>Section 2: evidence / what the research shows</h2>
<p>… <a href="https://arxiv.org/abs/…">the X paper</a> …</p>

<h2>Section 3: what we see in the field</h2>
<p>Tbrain angle: concrete, anonymized.</p>

<h2>A practical checklist</h2>
<ul><li>…</li></ul>

<h2>Bottom line</h2>
<p>1 paragraph takeaway + specific CTA with an internal link.</p>
```
