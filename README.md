# NikTool AI Tool Authoring Manual

This is the authoritative operating manual for humans and AI agents that add, modify, review, or remove tools in NikTool.

NikTool is a mobile-first collection of browser utilities designed for static hosting on Cloudflare Pages. Most tools run entirely in the browser, require no account, and do not upload user content.

Production origin: `https://niktool.in`

Local preview origin: `http://127.0.0.1:8080`

## Instructions for an AI agent

If a user asks you to add a tool, read this entire document before editing files. Treat every requirement containing **MUST**, **MUST NOT**, **REQUIRED**, or **STOP** as mandatory.

The required order of work is:

```text
Understand request
  -> inspect repository
  -> state assumptions
  -> design behavior and failure states
  -> implement isolated tool
  -> add folder-local catalog metadata
  -> add folder-local sitemap metadata
  -> validate syntax and structure
  -> run functional tests
  -> review diff
  -> report evidence
```

Do not skip directly from the user request to writing code unless the user explicitly prohibits repository reads. If repository reads are prohibited, follow the write-only rule below.

### Mandatory AI behavior

An AI agent MUST:

1. Read this `README.md` completely.
2. Inspect the current repository before choosing file names, dependencies, UI patterns, or integration points.
3. Run `git status --short` before editing and preserve unrelated user changes.
4. Inspect the closest existing tool for behavior patterns, but use the canonical conventions in this document when a legacy tool differs.
5. Keep each tool isolated inside its own folder.
6. Add or update both `tools/<slug>/catalog.json` and `tools/<slug>/sitemap.xml` for every public tool.
7. Put real SEO metadata in the tool page's `index.html`.
8. Implement visible loading, success, empty, invalid-input, and failure states where applicable.
9. Validate the result using the checks in this document.
10. Report exactly what changed, what was tested, and any known limitations.

An AI agent MUST NOT:

- Overwrite or revert unrelated changes.
- Create a new framework, package manager, build system, router, or backend for a single tool.
- Import another tool's JavaScript file.
- Treat `tool.json` as live SEO data.
- Claim a tool is tested when it was not executed.
- Claim files stay local if the implementation uploads them.
- Add an unpinned external dependency.
- Use `innerHTML` with user-controlled content.
- Commit, push, deploy, or publish unless the user explicitly asks for it.
- Manually edit the generated root `catalog.json` or root `sitemap.xml` for a tool change.
- Add a public tool without folder-local catalog and sitemap metadata.

### Write-only or no-read-access rule

If the AI cannot inspect existing repository files, it cannot safely guarantee integration.

In that situation, the AI MUST do one of the following:

1. Request read access; or
2. Create only an isolated tool folder containing its page, script, `catalog.json`, and `sitemap.xml`; or
3. Stop and explain which unknown project contracts prevent a safe change.

The AI MUST NOT blindly overwrite generated root metadata, shared assets, routing files, or deployment configuration. It MUST NOT claim the tool is tested without evidence.

## Project architecture

NikTool is a static site. A GitHub Action aggregates folder-local metadata after a push; deployment itself has no required build step.

```text
.
|-- index.html                 Homepage and catalog shell
|-- catalog.json               Generated homepage data; do not edit manually
|-- sitemap.xml                Generated search-engine list; do not edit manually
|-- robots.txt                 Crawler rules and sitemap location
|-- _headers                   Cloudflare response headers and cache policy
|-- 404.html                   Static not-found page
|-- README.md                  This authoritative manual
|-- assets/
|   |-- styles.css             Shared design system and responsive layout
|   |-- shared.js              Shared icons, clipboard helper, footer year
|   |-- catalog.js             Homepage catalog renderer
|   `-- favicon.svg            Site favicon
|-- scripts/
|   |-- preview.cjs            Dependency-free local HTTP server
|   `-- sync-tool-metadata.cjs Validates and aggregates tool metadata
`-- tools/
    `-- tool-slug/
        |-- index.html         Independent tool page and real SEO metadata
        |-- tool.js            Isolated tool behavior
        |-- catalog.json       Source for this tool's homepage card
        `-- sitemap.xml        Source for this tool's sitemap entry
```

### Canonical source of truth

| Concern | Source of truth |
|---|---|
| Tool page content | `tools/<slug>/index.html` |
| Tool SEO metadata | `<head>` in `tools/<slug>/index.html` |
| Tool behavior | `tools/<slug>/tool.js` |
| Homepage card and search | `tools/<slug>/catalog.json` |
| Search-engine discovery | `tools/<slug>/sitemap.xml` |
| Shared design | `assets/styles.css` |
| Shared icons/helpers | `assets/shared.js` |
| Production domain | `https://niktool.in` |

The root `catalog.json` and `sitemap.xml` are generated by `scripts/sync-tool-metadata.cjs`. Tool agents MUST edit only the matching files inside their tool folder. GitHub Actions validates every tool and commits changed root outputs automatically.

Folder-local `catalog.json` is not a substitute for HTML metadata. Search engines index each tool's `index.html`.

`tool.json` is not consumed anywhere in the current runtime. The existing PDF Merger contains a legacy `tool.json`, but new tools MUST NOT create one unless the entire project is deliberately migrated to a validated generator system.

The existing PDF Merger also uses the legacy filename `script.js`. New tools MUST use `tool.js`.

## Current shared contracts

### Homepage catalog

`assets/catalog.js` fetches `/catalog.json` and creates:

- Tool cards
- Category filters
- Search text
- Tool count

Catalog values are inserted into HTML. Therefore all catalog fields MUST be trusted static plain text. Do not include HTML, scripts, user data, angle brackets, or unescaped markup in catalog values.

### Shared icons

Current supported icon keys are:

- `text`
- `code`
- `shield`

Unknown icon keys fall back to `code`, but relying on the fallback is forbidden. Use an existing key or intentionally add a safe inline SVG string to `assets/shared.js`.

### Shared helper

`window.NikTool.copy(text, button)` copies text and temporarily changes the button's accessibility state. A tool may use it when the browser clipboard API is appropriate.

### Shared page styles

Prefer existing classes before adding new CSS:

| Purpose | Existing class |
|---|---|
| Page width | `.container` |
| Tool introduction | `.tool-hero` |
| Main interactive card | `.tool-workspace` |
| Workspace heading | `.workspace-header` |
| Local-processing indicator | `.workspace-status`, `.status-dot` |
| Text area | `.tool-textarea` |
| Two-column editors | `.json-layout`, `.editor-panel` |
| Controls | `.control-grid`, `.control-group`, `.control-label` |
| Button row | `.toolbar` |
| Primary button | `.button` |
| Secondary button | `.button.secondary` |
| Status text | `.message`, `.message.success`, `.message.error` |
| Statistics | `.stats-grid`, `.stat`, `.stat-value`, `.stat-label` |
| Explanatory SEO content | `.seo-content` |
| Screen-reader-only text | `.sr-only` |

Do not modify shared CSS for a tool unless existing classes cannot express the required interface. If tool-specific styling is necessary, keep it narrowly scoped under a unique tool class so other tools cannot change accidentally.

## Request interpretation contract

Before coding, convert the user's request into this internal specification:

```text
Tool name:
Tool slug:
One-sentence purpose:
Input type:
Output type:
Core operation:
Processing location: browser / server
Minimum valid input:
Maximum supported input:
Unsupported inputs:
Success result:
Failure states:
Required dependency:
Privacy claim:
Catalog category:
Catalog icon:
Primary keywords:
```

If important information is missing, inspect repository context and make conservative assumptions. Ask the user only when different choices would materially change behavior, privacy, cost, or architecture.

### Example requirement normalization

User request:

```text
Add a tool: Remove Last Page of PDF
```

Normalized requirement:

```text
Tool name: Remove Last PDF Page
Slug: remove-last-pdf-page
Input: one PDF file
Output: one downloaded PDF
Operation: remove page at index pageCount - 1
Minimum valid input: a valid PDF containing at least two pages
Unsupported: encrypted, corrupted, non-PDF, one-page PDF, oversized PDF
Processing: local browser memory
Success: show original/new page count and enable explicit download
Dependency: pinned pdf-lib version, preferably hosted locally
Category: PDF
Icon: text, unless a PDF icon is intentionally added
```

## Tool naming rules

### Tool name

Use a short, specific, action-oriented public name.

Good:

- `Remove Last PDF Page`
- `JSON Formatter`
- `Case Converter`

Avoid:

- `Awesome PDF Utility`
- `Tool 6`
- `Document Thing`

### Slug

The slug MUST:

- Use lowercase ASCII letters and numbers
- Use single hyphens between words
- Match `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Describe the tool accurately
- Remain stable after publication

Example:

```text
remove-last-pdf-page
```

The public path MUST have both a leading and trailing slash:

```text
/tools/remove-last-pdf-page/
```

The canonical URL MUST be:

```text
https://niktool.in/tools/remove-last-pdf-page/
```

### File names

Canonical required files:

```text
tools/<slug>/index.html
tools/<slug>/tool.js
```

Do not name new behavior files `script.js`, `main.js`, or `<slug>.js`.

## Mandatory implementation phases

### Phase 1: Preflight inspection

Run these read-only checks before editing:

```powershell
git status --short
rg --files -g '!*.zip' -g '!.git/**'
Get-Content -Raw README.md
Get-Content -Raw catalog.json
Get-Content -Raw sitemap.xml
Get-Content -Raw assets/shared.js
Get-Content -Raw assets/styles.css
```

Then inspect one closest existing tool:

```powershell
Get-Content -Raw tools/<closest-tool>/index.html
Get-Content -Raw tools/<closest-tool>/tool.js
```

For a PDF tool, inspect the existing PDF tool, but do not copy its legacy `script.js`, unused `tool.json`, generic error handling, or external dependency pattern without review.

Record any dirty files and avoid overwriting them.

### Phase 2: Behavior design

Write down:

- Exact input and output
- Validation order
- Empty state
- Ready state
- Processing state
- Success state
- Recoverable errors
- Unsupported cases
- Memory and size constraints
- Browser compatibility risks

The interface MUST never fail silently.

### Phase 3: Create the isolated tool

Create only:

```text
tools/<slug>/index.html
tools/<slug>/tool.js
```

Optional files are allowed only when necessary:

```text
tools/<slug>/tool.css
tools/<slug>/assets/*
assets/vendor/<library>/<version>/*
```

Do not create duplicated copies of shared CSS, navigation, icons, or helpers.

### Phase 4: Register the tool

Add exactly one catalog object and exactly one sitemap URL.

### Phase 5: Validate and test

Complete every applicable automated and manual check in this document.

### Phase 6: Review and handoff

Review the final diff, confirm no unrelated files changed, and report evidence.

## Canonical tool page template

Use this as the structural baseline. Replace every `{{PLACEHOLDER}}`. Do not leave braces or placeholder text in committed files.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>{{UNIQUE_SEARCH_TITLE}} | NikTool</title>
  <meta name="description" content="{{UNIQUE_DESCRIPTION}}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://niktool.in/tools/{{SLUG}}/">

  <meta property="og:type" content="website">
  <meta property="og:title" content="{{SOCIAL_TITLE}} | NikTool">
  <meta property="og:description" content="{{SOCIAL_DESCRIPTION}}">
  <meta property="og:url" content="https://niktool.in/tools/{{SLUG}}/">
  <meta name="twitter:card" content="summary">

  <meta name="theme-color" content="#176b4d">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/styles.css">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "{{TOOL_NAME}}",
    "applicationCategory": "{{SCHEMA_CATEGORY}}",
    "operatingSystem": "Any",
    "url": "https://niktool.in/tools/{{SLUG}}/",
    "description": "{{SCHEMA_DESCRIPTION}}",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
  </script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <nav class="nav" aria-label="Main navigation">
      <a class="brand" href="/" aria-label="NikTool home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M5 7h14M8 12h8m-5 5h2"/>
          </svg>
        </span>
        <span class="brand-text">NikTool</span>
      </a>
      <div class="nav-links">
        <a class="home-link" href="/">Home</a>
        <a href="/#tools">All tools</a>
      </div>
    </nav>
  </header>

  <main id="main" class="container">
    <div class="breadcrumbs">
      <a href="/">Home</a>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m9 18 6-6-6-6"/>
      </svg>
      <span>{{TOOL_NAME}}</span>
    </div>

    <section class="tool-hero">
      <span class="tool-icon" aria-hidden="true">{{INLINE_ICON_SVG}}</span>
      <h1>{{TOOL_NAME}}</h1>
      <p>{{VISIBLE_ONE_SENTENCE_VALUE_PROPOSITION}}</p>
    </section>

    <section class="tool-workspace" aria-labelledby="workspace-title">
      <div class="workspace-header">
        <h2 id="workspace-title">{{WORKSPACE_HEADING}}</h2>
        <span class="workspace-status">
          <span class="status-dot"></span>
          Processed locally
        </span>
      </div>

      <!-- Tool-specific accessible controls go here. -->

      <div class="toolbar">
        <button class="button" id="primary-action" type="button" disabled>{{PRIMARY_ACTION}}</button>
        <button class="button secondary" id="clear-action" type="button" disabled>Clear</button>
      </div>

      <p class="message" id="tool-message" role="status" aria-live="polite">
        {{INITIAL_INSTRUCTION}}
      </p>
    </section>

    <article class="seo-content">
      <h2>How to {{LOWERCASE_TOOL_ACTION}}</h2>
      <ol>
        <li>{{STEP_ONE}}</li>
        <li>{{STEP_TWO}}</li>
        <li>{{STEP_THREE}}</li>
      </ol>

      <h2>{{BENEFIT_HEADING}}</h2>
      <p>{{ORIGINAL_USEFUL_EXPLANATION}}</p>

      <h2>Private browser-based processing</h2>
      <p>{{ACCURATE_PRIVACY_EXPLANATION}}</p>

      <h2>Frequently asked questions</h2>
      <details>
        <summary>{{REAL_USER_QUESTION}}</summary>
        <p>{{ACCURATE_ANSWER}}</p>
      </details>
    </article>
  </main>

  <footer class="site-footer">
    <div class="footer-inner container">
      <p>&copy; <span data-year></span> NikTool.</p>
      <div class="footer-links">
        <a href="/">Home</a>
        <a href="/#tools">All tools</a>
      </div>
    </div>
  </footer>

  <noscript>
    <p class="noscript">This tool requires JavaScript to work.</p>
  </noscript>

  <script src="/assets/shared.js"></script>
  <script src="/tools/{{SLUG}}/tool.js"></script>
</body>
</html>
```

If visible FAQs are represented as `FAQPage` JSON-LD, the structured questions and answers MUST match the visible page content. Do not add schema for content users cannot see.

## SEO contract

Every tool page MUST contain:

- One unique `<title>`
- One unique meta description
- `index, follow` robots directive
- One self-referencing canonical URL
- Open Graph type, title, description, and URL
- Twitter card type
- One relevant JSON-LD `SoftwareApplication`
- Exactly one visible `<h1>`
- Useful original explanatory content
- Internal links to Home and All tools

Recommended guidelines:

- Title: normally 45-60 characters, but clarity is more important than exact length
- Description: normally 130-160 characters
- H1: human-readable tool name, not a keyword list
- Canonical, Open Graph URL, schema URL, catalog path, and sitemap URL MUST agree
- Use the production origin `https://niktool.in`
- Do not create fake ratings, reviews, download counts, or unsupported claims
- Do not add `og:image` unless the referenced image actually exists
- `meta keywords` is optional and not required; Google does not use it for ranking

SEO metadata MUST be hard-coded in `index.html` because the site has no metadata generation build step.

### Suggested schema categories

| Tool type | `applicationCategory` |
|---|---|
| General utility | `UtilitiesApplication` |
| Developer tool | `DeveloperApplication` |
| Security tool | `SecurityApplication` |
| Design/image tool | `DesignApplication` |

Use the most accurate standard value. Do not invent a misleading category.

## Catalog contract

Create `tools/<slug>/catalog.json` containing one object:

```json
{
  "name": "Example Tool",
  "description": "A specific one-sentence description of the result.",
  "path": "/tools/example-tool/",
  "category": "Text",
  "icon": "text",
  "keywords": ["primary phrase", "synonym", "user intent", "format"],
  "order": 100
}
```

### Required catalog field rules

| Field | Type | Rule |
|---|---|---|
| `name` | string | Unique public tool name |
| `description` | string | Plain text, one sentence, specific outcome |
| `path` | string | Unique `/tools/<slug>/` path with trailing slash |
| `category` | string | Reuse an existing category where sensible |
| `icon` | string | Existing key from `assets/shared.js` |
| `keywords` | array | Non-empty array of lowercase search phrases |
| `order` | integer | Optional non-negative display order; tools without it sort last by name |

Catalog rules:

- Keep valid JSON: no comments and no trailing commas
- Do not duplicate a name or path
- Use plain text only
- Keywords support homepage search; they are not page metadata
- Include user-language synonyms, not keyword spam
- Store exactly one object, not the root catalog array
- Keep the object formatting consistent with neighboring tool manifests
- Do not edit the root `catalog.json`; it is generated

## Sitemap contract

Create `tools/<slug>/sitemap.xml` as a valid sitemap containing exactly one entry:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://niktool.in/tools/example-tool/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

Rules:

- The URL MUST exactly match the canonical URL
- Every public catalog tool MUST appear exactly once
- Do not add local URLs
- Keep valid XML
- Do not edit the root `sitemap.xml`; it is generated
- `robots.txt` normally requires no change because it already points to the root sitemap

## JavaScript contract

Each tool's behavior belongs in `tools/<slug>/tool.js`.

The script MUST:

- Use strict, isolated state
- Query only elements owned by the tool page
- Validate missing elements if failure would otherwise be silent
- Validate input before processing
- Disable actions when input is invalid
- Prevent duplicate processing clicks
- Display human-readable status and error messages
- Restore controls in `finally` after asynchronous processing
- Preserve the underlying error in `console.error` when useful for diagnosis
- Avoid leaking user content into logs
- Avoid global variables unless intentionally exposed
- Avoid using user content with `innerHTML`
- Release object URLs and other temporary resources

Recommended baseline:

```javascript
(() => {
  'use strict';

  const input = document.querySelector('#tool-input');
  const primaryButton = document.querySelector('#primary-action');
  const clearButton = document.querySelector('#clear-action');
  const message = document.querySelector('#tool-message');

  if (!input || !primaryButton || !clearButton || !message) {
    console.error('Tool initialization failed: required page elements are missing.');
    return;
  }

  let processing = false;

  function setMessage(text, type = '') {
    message.textContent = text;
    message.className = `message${type ? ` ${type}` : ''}`;
  }

  function updateControls() {
    const ready = Boolean(input.value.trim());
    primaryButton.disabled = processing || !ready;
    clearButton.disabled = processing || !ready;
  }

  input.addEventListener('input', updateControls);

  clearButton.addEventListener('click', () => {
    input.value = '';
    setMessage('Enter a value to begin.');
    updateControls();
    input.focus();
  });

  primaryButton.addEventListener('click', async () => {
    if (processing || !input.value.trim()) return;

    processing = true;
    updateControls();
    setMessage('Processing...');

    try {
      // Validate, process, and render the result.
      setMessage('Completed successfully.', 'success');
    } catch (error) {
      console.error('Tool processing failed:', error);
      setMessage('Unable to process this input. Check it and try again.', 'error');
    } finally {
      processing = false;
      updateControls();
    }
  });

  updateControls();
})();
```

Adapt this baseline to the tool. Do not copy unused controls or placeholder behavior.

## UI state contract

Every interactive tool MUST define applicable states:

| State | Required behavior |
|---|---|
| Empty | Explain what input is required; primary action disabled |
| Invalid | Explain the exact correction; do not process |
| Ready | Confirm input is ready; primary action enabled |
| Processing | Disable conflicting controls; show progress text |
| Success | Describe result and expose copy/download action |
| Failure | Show actionable error; restore controls |
| Reset | Clear tool-owned state, input, output, messages, and object URLs |

For long operations, show meaningful progress when technically possible. Avoid a frozen interface with only a disabled button.

## Accessibility contract

Every tool MUST:

- Use semantic `<button type="button">` controls
- Associate each input with a visible `<label for="...">`
- Use unique element IDs
- Provide an accessible name for icon-only buttons
- Use `role="status"` and `aria-live="polite"` for non-critical status updates
- Keep focus visible
- Work with keyboard-only navigation
- Avoid color as the only status indicator
- Keep tap targets at least approximately 44px
- Return focus to the most useful control after clearing or recovering
- Respect the shared reduced-motion styles

File reorder controls MUST have file-specific accessible labels such as `Move invoice.pdf up`.

## Privacy and security contract

### Local processing

Only display `Processed locally` when user input is not uploaded to a server.

Loading a library, font, or other asset from a CDN still creates a network request. It does not necessarily upload the user's file, but it affects reliability and privacy. Prefer local dependencies.

### User-controlled content

Use:

- `textContent`
- `value`
- `document.createElement`
- Safe DOM properties

Do not use user-controlled values in:

- `innerHTML`
- `outerHTML`
- Inline event handlers
- `eval`
- `new Function`
- Unvalidated URLs

### Sensitive tools

Password and security tools MUST:

- Use `crypto.getRandomValues` for randomness
- Never use `Math.random` for secrets
- Never log generated secrets
- Avoid storing secrets in local storage unless explicitly required and disclosed

### File tools

File tools MUST:

- Validate file type using more than the filename where practical
- Apply an explicit size limit based on memory risk
- Reject empty files
- Explain unsupported encryption or corruption
- Never log file contents
- Revoke temporary object URLs
- Avoid claiming the original file was modified

## Dependency policy

NikTool has no required package manager or build step. A new dependency therefore requires special care.

Priority order:

1. Use browser platform APIs
2. Reuse an existing audited project dependency
3. Vendor a pinned library locally with its license
4. Use a pinned CDN URL only when local vendoring is not practical and the user accepts the tradeoff

Dependency requirements:

- Pin an exact version
- Do not use `latest`
- Confirm the global/API name actually exposed
- Add a clear engine-load failure message
- Document unsupported formats
- Preserve the library license when vendoring
- Test with the dependency unavailable
- Do not add a package manager solely for one static tool without explicit approval

When using a CDN script, consider `integrity` and `crossorigin` attributes when the provider offers a stable integrity hash.

## PDF tool contract

PDF tools require a PDF manipulation engine; browsers do not natively provide page-editing APIs.

### Required PDF validation order

1. Confirm a file was selected
2. Confirm the file is non-empty
3. Confirm the configured size limit
4. Confirm MIME type or `.pdf` extension
5. Inspect the initial bytes for the `%PDF-` signature where practical
6. Confirm the PDF engine loaded
7. Attempt to parse the PDF
8. Confirm the required page count
9. Perform the operation
10. Save and expose an explicit download

Do not treat a `.pdf` filename as proof that the file is a valid PDF.

### PDF error messages

Distinguish at least:

- PDF engine unavailable
- Invalid or corrupted PDF
- Password-protected/encrypted PDF
- Too few pages for the requested operation
- File exceeds supported size
- Browser ran out of memory or processing failed
- Output generated but automatic download was blocked

Whenever multiple files are processed, identify the failing filename without exposing its contents.

### PDF memory

Browser-side PDF processing may hold original bytes, parsed objects, copied pages, and output bytes simultaneously. A 200 MB input can require much more than 200 MB of memory.

For new PDF tools:

- Choose a conservative default limit
- Consider mobile devices
- Test the chosen limit
- Do not copy an existing limit without analysis
- Explain that complex PDFs may use more memory than their file size suggests

### PDF download behavior

An explicit download link shown after processing is more reliable than only triggering a hidden asynchronous click, especially in mobile Safari and embedded browsers.

Recommended result flow:

```text
Process PDF
  -> create Blob
  -> create object URL
  -> show visible Download button/link
  -> optionally trigger download
  -> revoke previous URL on reset or replacement
```

### Example: Remove Last PDF Page

Core logic with `pdf-lib`:

```javascript
async function removeLastPage(file) {
  const sourceBytes = await file.arrayBuffer();
  const pdf = await PDFLib.PDFDocument.load(sourceBytes);
  const pageCount = pdf.getPageCount();

  if (pageCount < 2) {
    throw new Error('The PDF must contain at least two pages.');
  }

  pdf.removePage(pageCount - 1);
  const outputBytes = await pdf.save();

  return {
    blob: new Blob([outputBytes], { type: 'application/pdf' }),
    originalPageCount: pageCount,
    outputPageCount: pageCount - 1
  };
}
```

This snippet is not a complete tool. The AI must still implement validation, engine checks, UI states, error classification, reset cleanup, accessible download, SEO, catalog registration, sitemap registration, and tests.

## Text tool contract

Text tools SHOULD:

- Update results instantly when that improves usability
- Preserve line breaks when the operation allows it
- Define Unicode behavior
- Avoid destructive transformations without showing output separately or providing undo/reset
- Show character/word counts when relevant
- Handle empty and whitespace-only input explicitly
- Provide a clipboard fallback message

Do not assume ASCII unless the tool's purpose explicitly requires ASCII.

## Developer tool contract

Developer tools SHOULD:

- Never execute user-provided code unless execution is the explicit purpose and is safely sandboxed
- Show parse position or meaningful error details
- Keep original input intact when formatting or transforming
- Distinguish format, validate, minify, and copy actions
- Use monospace output for code-like data
- Avoid silently changing semantic values

## Download and clipboard contract

### Downloads

For generated downloads:

- Use an accurate MIME type
- Use a predictable sanitized filename
- Never include path separators in the filename
- Revoke replaced or abandoned object URLs
- Provide a visible fallback download link
- Report generation success separately from download success

### Clipboard

Clipboard calls can fail because of permissions or browser context. Catch failures and instruct the user to select and copy manually.

## Error-handling contract

Error messages MUST answer at least one of these:

- What failed?
- Which input failed?
- Why is it unsupported?
- What can the user do next?

Bad:

```text
Something went wrong.
```

Better:

```text
report.pdf is password-protected. Unlock it and try again.
```

Do not expose stack traces to users. Log the technical error to the browser console when useful, but never log sensitive user content.

Do not catch all errors and discard their identity. Classify known errors and preserve an actionable generic fallback.

## Content quality contract

The visible content below every tool MUST be original and useful, not filler written only for search engines.

Include:

- A three-step usage guide
- A clear explanation of the result
- Accurate privacy behavior
- Important limitations
- Two or more real FAQs when appropriate

Avoid:

- Repeating the same keyword unnaturally
- Claiming support that was not tested
- Claiming complete privacy while uploading files
- Fake urgency, ratings, or user counts
- Copying paragraphs from another tool with only the tool name replaced

## Automated validation

Run these checks after implementation.

### 1. Validate and generate root metadata

```powershell
node scripts/sync-tool-metadata.cjs
if ($LASTEXITCODE -ne 0) { throw 'Tool metadata sync failed.' }
```

This command checks that every tool folder has valid local metadata, that paths and sitemap URLs match the folder, and that names and paths are unique. It then regenerates the root files for local verification. A tool-only agent that cannot write outside its folder may skip local generation; GitHub Actions will run it after push.

### 2. Validate generated catalog JSON

```powershell
$catalog = Get-Content -Raw catalog.json | ConvertFrom-Json
if (-not $catalog) { throw 'catalog.json is empty.' }
```

### 3. Validate generated sitemap XML

```powershell
[xml]$sitemap = Get-Content -Raw sitemap.xml
if (-not $sitemap.urlset) { throw 'sitemap.xml has no urlset.' }
```

### 4. Validate JavaScript syntax

```powershell
Get-ChildItem tools -Recurse -Filter *.js | ForEach-Object {
  node --check $_.FullName
  if ($LASTEXITCODE -ne 0) {
    throw "JavaScript syntax failed: $($_.FullName)"
  }
}
```

### 5. Validate catalog uniqueness and required fields

```powershell
$catalog = Get-Content -Raw catalog.json | ConvertFrom-Json
$required = @('name', 'description', 'path', 'category', 'icon', 'keywords')

foreach ($tool in $catalog) {
  foreach ($field in $required) {
    if (-not $tool.PSObject.Properties.Name.Contains($field)) {
      throw "$($tool.name): missing catalog field '$field'."
    }
  }

  if ($tool.path -notmatch '^/tools/[a-z0-9]+(?:-[a-z0-9]+)*/$') {
    throw "$($tool.name): invalid path '$($tool.path)'."
  }

  if (-not $tool.keywords -or $tool.keywords.Count -eq 0) {
    throw "$($tool.name): keywords must not be empty."
  }
}

$duplicateNames = $catalog | Group-Object name | Where-Object Count -gt 1
$duplicatePaths = $catalog | Group-Object path | Where-Object Count -gt 1

if ($duplicateNames) { throw 'Duplicate catalog tool names found.' }
if ($duplicatePaths) { throw 'Duplicate catalog paths found.' }
```

### 6. Validate catalog folders and pages

```powershell
$catalog = Get-Content -Raw catalog.json | ConvertFrom-Json

foreach ($tool in $catalog) {
  $relativeFolder = $tool.path.Trim('/') -replace '/', '\\'
  $page = Join-Path (Join-Path $PWD $relativeFolder) 'index.html'

  if (-not (Test-Path -LiteralPath $page)) {
    throw "$($tool.name): missing page $page"
  }
}
```

### 7. Validate sitemap coverage

```powershell
$catalog = Get-Content -Raw catalog.json | ConvertFrom-Json
$sitemapText = Get-Content -Raw sitemap.xml

foreach ($tool in $catalog) {
  $url = "https://niktool.in$($tool.path)"
  $expected = "<loc>$url</loc>"

  if (-not $sitemapText.Contains($expected)) {
    throw "$($tool.name): missing sitemap URL $url"
  }
}
```

### 8. Search for unfinished placeholders

```powershell
$placeholders = rg -n '\{\{[^}]+\}\}|TODO|REPLACE_ME|example-tool|example\.com' tools catalog.json sitemap.xml
if ($LASTEXITCODE -eq 0) {
  $placeholders
  throw 'Unfinished placeholders found.'
}
```

Review the matches before treating all `TODO` text as an error if the project later intentionally uses that word.

### 9. Start the local server

```powershell
node scripts/preview.cjs
```

Open:

```text
http://127.0.0.1:8080
```

Do not open HTML directly with `file://`; absolute paths and `catalog.json` fetches require HTTP.

### 9. Validate all catalog routes

Run while the preview server is active:

```powershell
$catalog = Get-Content -Raw catalog.json | ConvertFrom-Json

foreach ($tool in $catalog) {
  $response = Invoke-WebRequest `
    -Uri ("http://127.0.0.1:8080" + $tool.path) `
    -UseBasicParsing `
    -TimeoutSec 10

  if ($response.StatusCode -ne 200) {
    throw "$($tool.name): route returned $($response.StatusCode)."
  }
}
```

### 10. Validate tool page metadata

For the new page, confirm all of these are present and consistent:

```text
title
meta description
robots
canonical
og:type
og:title
og:description
og:url
twitter:card
JSON-LD
one h1
shared stylesheet
shared.js
tool.js
```

Automated string checks are useful but do not replace a visual or browser test.

## Functional test matrix

Every tool MUST be tested with applicable cases:

| Case | Expected result |
|---|---|
| Empty input | Clear instruction; action disabled or safely rejected |
| Minimum valid input | Correct result |
| Typical input | Correct result |
| Maximum supported input | Completes or shows documented limit |
| Invalid input | Specific actionable error |
| Repeated action | No duplicate state or resource leak |
| Clear/reset | Restores initial state |
| Keyboard-only | Complete workflow is possible |
| Narrow mobile viewport | No horizontal overflow or unusable controls |
| Dependency unavailable | Clear engine/dependency error |
| Copy/download blocked | Visible fallback instruction |

For transformation tools, independently verify the output instead of trusting the success message.

### PDF-specific test matrix

| Case | Expected result |
|---|---|
| Valid two-page PDF | Correct one-page output when removing one page |
| Typical multi-page PDF | Correct page count and content order |
| One-page PDF | Rejected with minimum-page explanation |
| Empty PDF-like file | Rejected |
| Renamed non-PDF | Rejected |
| Corrupted PDF | Invalid/corrupted message |
| Password-protected PDF | Encryption message |
| Large PDF | Completes within tested limit or shows size error |
| Mobile browser | Processing and explicit download usable |
| Engine unavailable | Dependency-load error |

Open the generated PDF and verify its actual page count. A generated Blob alone does not prove the operation is correct.

## Browser review checklist

Inspect the new tool in at least one current Chromium browser. When practical, also test Safari/WebKit behavior for downloads and file APIs.

Verify:

- No console errors
- Page title is correct
- Layout matches the site
- Header and footer links work
- Tool works from the direct URL
- Catalog card appears
- Search finds name and keywords
- Category filter contains the tool
- Button states are understandable
- Long filenames/text do not break layout
- Mobile layout works around 360px width
- Focus order is logical
- Status messages are announced
- Final output is correct

## Git and change-safety rules

Before editing:

```powershell
git status --short
```

After editing:

```powershell
git status --short
git diff -- tools/<slug>/
```

Rules:

- Preserve unrelated modified and untracked files
- Do not reformat the entire repository for one tool
- Do not rename existing tools without explicit approval
- Do not delete legacy files just because they differ from this standard
- Do not manually edit generated root `catalog.json` or `sitemap.xml`
- Do not commit or push unless explicitly requested
- If a required target file has overlapping user edits, integrate carefully or ask before overwriting

## Definition of done

A new tool is complete only when every applicable item is true:

### Structure

- [ ] Slug follows the naming rule
- [ ] `tools/<slug>/index.html` exists
- [ ] `tools/<slug>/tool.js` exists
- [ ] `tools/<slug>/catalog.json` exists
- [ ] `tools/<slug>/sitemap.xml` exists
- [ ] No unnecessary `tool.json` was created
- [ ] Tool does not import another tool's script

### Functionality

- [ ] Input validation is implemented
- [ ] Empty, ready, processing, success, error, and reset states work
- [ ] Core output was independently verified
- [ ] Unsupported inputs have actionable messages
- [ ] Temporary resources are cleaned up

### UX and accessibility

- [ ] Inputs have labels
- [ ] Buttons have `type="button"`
- [ ] Icon-only controls have accessible names
- [ ] Keyboard workflow works
- [ ] Status messages use accessible live regions
- [ ] Mobile layout works

### Privacy and security

- [ ] Privacy wording matches actual data flow
- [ ] No user content is inserted with `innerHTML`
- [ ] Sensitive values are not logged
- [ ] Dependencies are pinned and justified
- [ ] File limits and unsupported formats are documented

### SEO and discovery

- [ ] Unique title and description
- [ ] Correct canonical and Open Graph URLs
- [ ] Correct JSON-LD
- [ ] Exactly one H1
- [ ] Useful original visible content
- [ ] Folder-local catalog entry exists exactly once
- [ ] Folder-local sitemap entry exists exactly once

### Validation

- [ ] Catalog JSON parses
- [ ] Sitemap XML parses
- [ ] JavaScript syntax passes
- [ ] No unfinished placeholders
- [ ] Direct route returns HTTP 200
- [ ] Browser console has no errors
- [ ] Final diff contains only intended changes

If any required item is false, the tool is not done.

## Stop conditions

The AI MUST stop and ask for direction when:

- The tool requires a backend, upload service, paid API, or secret key not authorized by the user
- Two plausible implementations have materially different privacy or cost
- A new dependency requires network download or licensing approval that is unavailable
- Existing user changes overlap the same code and safe integration is unclear
- The requested feature cannot work in a static browser environment
- The user requires write-only changes but also expects guaranteed integration and testing

The AI should not stop for minor naming or UI decisions that can be safely inferred from this guide.

## Required final report format

After adding a tool, report:

```text
Tool added:
Public path:

Files created:
- ...

Files updated:
- ...

Behavior implemented:
- ...

Validation completed:
- JSON parse
- XML parse
- JavaScript syntax
- Route check
- Functional cases
- Browser check

Known limitations:
- ...

Not performed:
- commit / push / deployment, unless explicitly requested
```

Never report a validation item as completed without evidence.

## Prompt template for users

A user can give an AI this prompt:

```text
Read README.md completely and follow it as the authoritative project contract.

Add this NikTool utility:
- Name: <tool name>
- Purpose: <one sentence>
- Input: <input>
- Output: <output>
- Required behavior: <details>
- Known limitations: <details or unknown>

Inspect the repository before editing. Preserve unrelated changes. Implement the tool, add catalog and sitemap entries, run all applicable validation and functional tests from README.md, and report evidence. Do not commit, push, or deploy unless I explicitly ask.
```

Minimal prompt:

```text
Read README.md completely. Add a tool called "Remove Last PDF Page" and follow every required implementation, SEO, integration, testing, and reporting rule. Do not commit or push.
```

## Local preview

Start the dependency-free preview server:

```powershell
node scripts/preview.cjs
```

Then open:

```text
http://127.0.0.1:8080
```

Optional environment variables:

```powershell
$env:PORT = '8081'
$env:HOST = '127.0.0.1'
node scripts/preview.cjs
```

## Cloudflare Pages deployment

For a Git-connected Cloudflare Pages project:

```text
Framework preset: None
Build command: leave empty
Build output directory: .
Root directory: /
```

The root `_headers` file is detected automatically.

When folder-local metadata is pushed, `.github/workflows/sync-tool-metadata.yml` runs the generator and commits any root `catalog.json` or `sitemap.xml` changes as `github-actions[bot]`. In GitHub, set **Settings -> Actions -> General -> Workflow permissions** to **Read and write permissions**. Protected branches must also allow the GitHub Actions bot to push, or the sync commit will be rejected.

For Direct Upload, upload the repository's static site files. No application environment variables are currently required.

Deployment is a separate action. Adding a tool does not authorize an AI to commit, push, deploy, or submit URLs to search engines.

## Scaling note

This document reduces ambiguity and prevents many common integration errors, but documentation alone cannot mathematically guarantee an error rate below one percent.

For stronger scaling guarantees, further automated enforcement can add:

1. A JSON Schema for folder-local `catalog.json`
2. A canonical tool scaffolding script
3. HTML metadata checks
4. Browser smoke tests
5. Pull-request validation that blocks invalid tool changes

The current generator already validates folder coverage, required catalog fields, unique names and paths, sitemap structure, and URL parity. Every AI agent MUST still execute the applicable validation commands and definition-of-done checklist in this README.
