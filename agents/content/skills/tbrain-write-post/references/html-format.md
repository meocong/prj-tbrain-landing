# HTML format for `content_html`

The site sanitizes the body and strips anything outside this list. Write clean, semantic HTML:

- Section headings: `<h2>` (main sections) and `<h3>` (sub-points). **No `<h1>`**, since the post title is the h1.
- Paragraphs: `<p>`. Emphasis: `<strong>`, `<em>`.
- Lists: `<ul>` / `<ol>` with `<li>`.
- Links: `<a href="https://…">descriptive anchor</a>`. Internal links are site-relative: `<a href="/data/physical-ai/quality">our QC playbook</a>`.
- Key takeaways box: `<blockquote><ul><li>…</li><li>…</li><li>…</li></ul></blockquote>` right after the opening (the site renders a blockquote with a list as a highlighted box). Use it once.
- Quotes: `<blockquote><p>…</p></blockquote>` for pull quotes or short sourced quotes.
- Tables: `<table><thead><tr><th>…</th></tr></thead><tbody><tr><td>…</td></tr></tbody></table>` for comparisons or decision tables.
- Code: `<pre><code class="language-python">…</code></pre>`, or inline `<code>`.
- Images: `<img src="/images/…" alt="specific description">` followed by a caption paragraph `<p><em>What the reader should notice.</em></p>`, using only `image_url`s from `list_images` (the approved library). (No `<figure>`: the admin editor drops figcaptions.)
- Not allowed (removed): scripts, iframes, embeds, inline `style`, classes (except `language-*` on code), forms.

## Structure
The skeleton depends on the post type: follow `post-types.md`. Every post has, in order: the opening (1-3 short paragraphs), the key takeaways box, 4-6 `<h2>` sections whose headings are claims, images next to the sections they support, and a short ending (one memorable line, then a specific next step with a link). Don't add an "Introduction" or "Conclusion" heading.

```html
<p>Opening: a scene or the answer, then the tension.</p>
<p>Thesis in one sentence.</p>
<blockquote><ul><li>Takeaway one.</li><li>Takeaway two.</li><li>Takeaway three.</li></ul></blockquote>

<h2>A heading that makes a claim</h2>
<p>Claim, evidence with <a href="https://…">a descriptive source link</a>, what it means for the reader.</p>
<img src="/images/…" alt="what the image shows">
<p><em>What the reader should notice in this image.</em></p>

<h2>…</h2>
<p>…</p>

<p>The one line to remember. The next step: <a href="/data/physical-ai/quality">how we QC every episode</a>.</p>
```
