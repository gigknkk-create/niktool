# NikTool

A dependency-free, mobile-first catalog of browser tools built for static hosting on Cloudflare Pages.

## Project structure

```text
.
├── index.html                 # Searchable home/catalog page
├── catalog.json               # Tool cards and search keywords
├── assets/
│   ├── styles.css             # Shared design system
│   └── shared.js              # Shared icons and helpers
├── tools/
│   └── tool-name/
│       ├── index.html         # Independent SEO page
│       └── tool.js            # Isolated tool behavior
├── sitemap.xml                # URLs for search engines
├── robots.txt
├── _headers                   # Cloudflare response headers
└── 404.html
```

## Add a new tool

1. Copy one existing folder in `tools/` and rename it with a lowercase, hyphenated slug.
2. Update its `index.html` content and its independent SEO fields: `title`, description, canonical, Open Graph tags, and JSON-LD.
3. Implement the feature in that folder's `tool.js`. It can use shared styles and `window.NikTool` helpers but should not import another tool's script.
4. Add one object to `catalog.json`:

```json
{
  "name": "Example Tool",
  "description": "A clear one-sentence description.",
  "path": "/tools/example-tool/",
  "category": "Text",
  "icon": "text",
  "keywords": ["example", "useful search phrase"]
}
```

Available icons are `text`, `code`, and `shield`. Add more SVG icon strings in `assets/shared.js` when needed.

5. Add the public URL to `sitemap.xml`.

The home page automatically creates its card, category filter, and search terms from the catalog.

## Customize before launch

The production domain is already configured as `https://niktool.in`. You only need to customize the product identity if desired:

- `NikTool` — your product name

Also review the homepage description, favicon, privacy wording, and footer.

## Preview locally

Serve the directory over HTTP so absolute paths and the catalog request work correctly:

```powershell
node scripts/preview.cjs
```

Then visit `http://localhost:8080`.

## Deploy to Cloudflare Pages

For a Git-connected Pages project:

- Framework preset: `None`
- Build command: leave empty
- Build output directory: `.`
- Root directory: `/`

Push the repository and Cloudflare will publish the static files. The `_headers` file is detected automatically.

For Direct Upload, upload this directory as the site assets. No build step or environment variables are required.

## SEO checklist for every tool

- Use one specific `<h1>` and a unique title and meta description.
- Replace every canonical and Open Graph URL with the final public URL.
- Keep the `SoftwareApplication` JSON-LD accurate.
- Include useful, original explanatory copy below the interactive tool.
- Link the page from `catalog.json` and `sitemap.xml`.
- Test on a narrow mobile screen and with keyboard navigation.
