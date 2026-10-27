# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Static rebuild of patricepane.com (interior architect portfolio, Marseille): home (title + project
carousel + intro text), content pages (`/mission`, `/presentation`, `/parcours`) and project pages
(`/projet/<slug>`). The live site (www.patricepane.com) is still the old AWS stack
(`../patricepane-old`: S3 + CloudFront + Amplify, DNS on Route 53); it is the visual and SEO reference.
`../patricepane-docker` (Next + Payload, never deployed on the domain) is the code reference for
the components. Touch neither until the DNS switch. Canonical origin: `https://www.patricepane.com`.

Stack is modeled on `~/dev/aMu-pychotherapie-institutionnelle` (read its README.md and CLAUDE.md):
Next.js `output: "export"` + Sveltia CMS (self-hosted bundle, GitHub backend) + Cloudflare Pages,
editors sign in through this site's own OAuth Worker (`auth/`).
Hard constraints: zero recurring cost, zero maintenance after delivery, one non-technical editor.

**The work plan is `PLAN.md` (French). Follow its phases in order; each ends with a commit and a
"Fini quand" check. Phases 5 and 8 are manual/outward-facing: ask before doing them.**

## Key rules

- Keep the current URLs exactly (`/`, `/<page-slug>`, `/projet/<slug>`): they are indexed.
- **Dual schema**: any content-model change goes to BOTH `public/admin/config.yml` and the Zod
  schema; `npm run test:cms` must pass before every commit.
- **Security invariant**: admin and site share one origin and editors' GitHub tokens live in
  localStorage. CMS markdown reaches the DOM only through `renderMarkdown()` (marked +
  sanitize-html). Keep `public/_headers` rules.
- Images: `ExportedImage` from `next-image-export-optimizer`, never plain `next/image`.
- No runtime CDN (fonts via `next/font`, Sveltia bundle committed). No scheduled jobs.
- Install with `npm ci`; no dependency auto-updates. Node version pinned in `.nvmrc`.
- Code comments and identifiers in English; UI copy and editor-facing CMS labels in French.
