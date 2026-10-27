# Plan — patricepane-site (statique, Sveltia CMS)

Refonte de `../patricepane-docker` (Next 15 + Payload 3 + Postgres sur VPS) vers la stack
du projet aMu (`~/dev/aMu-pychotherapie-institutionnelle`) : **site 100 % statique, contenu
dans le repo, édition via Sveltia CMS (backend GitHub), hébergement Cloudflare Pages.**
Le front reste en **Next.js** (`output: "export"`) pour reprendre les composants React existants.

Objectif : 0 € récurrent (hors domaine), aucune maintenance serveur, Patrice édite seul.

**Ce qui est en ligne aujourd'hui (vérifié le 27/10/2026)** : `www.patricepane.com` sert encore
l'**ancienne version AWS** (`../patricepane-old` : Next 12 exporté, S3 + CloudFront, admin Amplify,
lambdas `../patricepane-lambda-*`). Fichiers modifiés pour la dernière fois en janvier 2025.
L'apex `patricepane.com` redirige (302) vers `www`. **La version Payload/Docker n'a jamais été mise
en ligne sur ce domaine.**
Domaine : registrar Amazon (expire le 02/09/2027), DNS Route 53. Pas de MX, un seul TXT
(`google-site-verification=…`).

**Ne pas toucher `../patricepane-docker` ni l'infra AWS** avant la bascule (phase 8).
`patricepane-docker` sert de référence de code ; le site AWS en ligne est la référence visuelle et SEO.

---

## Références

| Quoi | Où |
|---|---|
| Ancien site (code front à porter) | `../patricepane-docker/app/components/*`, `app/(frontend)/*`, `lib/` |
| Modèle de données actuel | `../patricepane-docker/collections/{Projects,Pages,Media}.ts` |
| Stack modèle (CMS, auth, sécurité, tests) | `~/dev/aMu-pychotherapie-institutionnelle` (README.md, CLAUDE.md) |
| Config Sveltia modèle | `aMu/public/admin/{config.yml,index.html}` |
| Worker OAuth à copier | `aMu/auth/` (`src/index.ts`, `wrangler.toml`) |
| Test de parité CMS à adapter | `aMu/scripts/test-cms.mjs` |
| Sanitisation markdown | `aMu/src/lib/markdown.ts` |
| En-têtes de sécurité | `aMu/public/_headers` |

## Stack cible

| Brique | Choix |
|---|---|
| Front | Next.js (App Router), `output: "export"`, React 19, Tailwind 4 |
| Images | `next-image-export-optimizer` (variantes webp + srcset générées au build) |
| Contenu | `content/` en Markdown + YAML, lu au build (`gray-matter` + `yaml`), validé par Zod |
| Rendu markdown | `marked` + `sanitize-html` (copie de `aMu/src/lib/markdown.ts`) |
| CMS | Sveltia CMS **auto-hébergé** (`public/admin/sveltia-cms.js`, version figée, dernière stable sur npm) |
| Backend CMS | GitHub, branche `main` (chaque enregistrement = un commit) |
| Auth éditeur | Worker Cloudflare OAuth (copie de `aMu/auth/`, un Worker dédié à ce site) |
| Hébergement | Cloudflare Pages, rebuild à chaque commit |
| Node | 22 (`.nvmrc` + `NODE_VERSION` sur Pages), `npm ci`, lockfile commité |

⚠️ `next-image-export-optimizer` suit les versions de Next avec du retard : **choisir la
version de Next compatible avec la dernière version du paquet** (voir son README / peerDeps)
avant d'installer, puis tout figer via le lockfile.

---

## Modèle de contenu

```
content/
├── projets/<slug>.md      ← un fichier par projet
├── pages/<slug>.md        ← mission, presentation, parcours
├── accueil.yml            ← texte de la page d'accueil (ex-page "home")
└── reglages/site.yml      ← nom, titre, meta description, coordonnées
public/uploads/            ← images (webp, noms ASCII)
```

### Projet — `content/projets/<slug>.md`

```yaml
---
titre: "Rénovation partielle d'une maison à Endoume"
description: "Texte court pour le SEO et les aperçus de partage"
images:
  - { image: /uploads/renovation-cuisine-endoume-zellige-jaune.webp, alt: "Rénovation cuisine Endoume…" }
publie: true
order: 3          # écrit par Sveltia (reorder), ne pas éditer à la main
---
# Titre affiché
## Sous-titre // 2020

Corps en markdown…
```

### Page — `content/pages/<slug>.md`
Mêmes champs que les projets, plus `titre_menu` (libellé du menu, aujourd'hui c'est le slug qui
s'affiche). L'`order` sert à l'ordre du menu. « Projets » (lien vers `/`) reste toujours en premier.

### `content/accueil.yml`
`titre` et `description` (`<title>` et meta description de l'accueil, venus de l'entrée « home »),
`texte` (markdown). Aujourd'hui il est rendu dans un `<article class="rich-content">` de `ProjectsView`.

### `content/reglages/site.yml`
`nom_site`, `titre` (« architecte d'intérieur à marseille »), `metier` (« Architecte d'intérieur »,
sous le nom dans le pied des pages), `adresse` (multiligne), `telephone`, `email`, `instagram` (nom d'utilisateur). On sort de `Address.tsx`, `Title.tsx` et
`metadata.constants.ts` tout ce qui y est codé en dur.

### Ordre manuel (vérifié)
Sveltia gère le glisser-déposer dans la liste des entrées avec **`reorder: true`** sur une
collection folder. L'ordre est stocké dans un champ `order` (à partir de 1) dans chaque fichier.
Option : `reorder: { key: order }`. J'ai vérifié dans la doc (sveltiacms.app/en/docs/collections/entries/operations)
et dans le bundle 0.227 d'aMu. Limite : le réordonnancement est commité directement sur `main`.
Le build trie par `order`, puis par titre en cas d'égalité.

### Brouillons
Un booléen `publie`, comme dans aMu : une entrée non publiée n'est ni générée ni listée.
(Sveltia propose aussi `publish_mode: editorial_workflow`, qui passe par des branches et des PR.
C'est trop lourd pour un seul éditeur, donc on ne l'active pas.)

### Esquisse `public/admin/config.yml`

```yaml
backend:
  name: github
  repo: patrice-pane/patricepane-site
  branch: main
  base_url: https://cms-auth-patricepane.<compte>.workers.dev

media_folder: public/uploads
public_folder: /uploads

media_libraries:
  default:
    config:
      slugify_filename: true
      max_file_size: 15000000
      transformations:
        raster_image: { format: webp, quality: 85, width: 2400, height: 2400 }

slug: { encoding: ascii, clean_accents: true, maxlength: 80 }

collections:
  - name: projets
    label: Projets
    folder: content/projets
    create: true
    reorder: true
    identifier_field: titre
    slug: "{{slug}}"
    summary: "{{titre}}"
    fields:
      - { label: Titre, name: titre, widget: string }
      - { label: Description (SEO), name: description, widget: text, required: false }
      - label: Images
        name: images
        widget: list
        summary: "{{fields.alt}}"
        fields:
          - { label: Image, name: image, widget: image }
          - { label: Texte alternatif, name: alt, widget: string, required: false }
      - { label: Texte, name: body, widget: markdown }
      - { label: Publié, name: publie, widget: boolean, default: true }
  # pages : idem + titre_menu ; accueil et réglages : collections "files"
```

Ces options ont été vérifiées dans le bundle 0.227 (`reorder`, `media_libraries.default.config.transformations.raster_image`).
**À revérifier** avec la version de Sveltia effectivement installée.

**Double schéma** (règle aMu) : tout changement de modèle va dans `public/admin/config.yml` **et**
dans le schéma Zod (`lib/content/schema.ts`). C'est `npm run test:cms` qui contrôle la cohérence.

---

## Phases

Chaque phase se termine par un commit. Ne passer à la suivante que si le critère « Fini quand » est rempli.

### Phase 0 — Squelette
- `git init`, `.gitignore` (node_modules, .next, out, .env*, .DS_Store), `.nvmrc` = 22.
- Choisir les versions de Next et de `next-image-export-optimizer` (voir ⚠️ plus haut), puis installer :
  next, react, react-dom, tailwindcss, @tailwindcss/postcss, next-image-export-optimizer,
  gray-matter, yaml, zod, marked, sanitize-html, image-size (+ types, typescript).
- `next.config.mjs` : `output: "export"`, `trailingSlash: false`, la config du paquet image
  (`images: { loader: "custom" }`, `transpilePackages`, `env.nextImageExportOptimizer_*` :
  dossier `public/uploads`, export `out`, webp, quality 80, blur placeholders).
- Scripts : `dev`, `build` = `next build && next-image-export-optimizer`, `preview` (servir `out/`
  avec `scripts/preview.mjs`, sans dépendance : le paquet `serve` tire une version vulnérable de `compression`),
  `check` (tsc), `test:cms`.
- **Fini quand** `npm run build` produit `out/` avec une page vide.

### Phase 1 — Migration du contenu (`scripts/migrate.mjs`, à usage unique)
- **Source** : l'export AWS déjà fait, qui contient le contenu du site en ligne.
  - `../patricepane-docker/scripts/data/projects.json` : 13 projets, corps en **markdown**,
    `position`, `state`, `images[{key, width, height, alt, position}]`.
  - `../patricepane-docker/scripts/data/pages.json` : 4 pages.
  - `../patricepane-docker/scripts/data/images/` : 127 originaux jpg/png, 192 Mo.

  Pas de conversion Lexical à faire. Pour garantir que l'export est à jour, comparer avec le site
  en ligne, page par page, sur les titres et le nombre d'images.
- Aucun contenu n'a été saisi dans Payload (confirmé par Robin) : l'export AWS est la seule source,
  les backups Payload sont ignorés.
- Images : convertir les originaux en webp (sharp, quality 85, côté max 2400 px). Renommer en ASCII
  slugifié (aujourd'hui les noms contiennent espaces et accents) et garder l'ancien nom descriptif
  comme `alt` par défaut. Écrire dans `public/uploads/`. Respecter l'ordre `position` des images.
- **Les slugs sont conservés à l'identique** (ce sont les URLs indexées). `order` vient de `position`.
  **Exception** : `renovation-maison-année-30-st-barnabe` contient un accent. Le fichier prend un slug
  ASCII (`renovation-maison-annee-30-st-barnabe`) et `public/_redirects` ajoute une 301 depuis
  l'ancienne URL (sous ses formes encodée et non encodée), à tester sur Pages.
- `home` → `content/accueil.yml` ; `mission`, `presentation`, `parcours` → `content/pages/`.
- **Fini quand** `content/` contient 13 projets et 3 pages, avec toutes les images référencées
  présentes. Vérifier le poids total de `public/uploads/` (repère : environ 75 Mo en webp).
- ✅ Fait le 27/10/2026. L'export est identique au `__NEXT_DATA__` du site en ligne (titres, textes,
  descriptions, positions, images, alts). 126 images, 37 Mo : l'image de « home » n'est jamais
  affichée et n'est pas migrée. Les 4 pages sont `DRAFT` dans l'export mais en ligne (l'ancien site
  ignorait `state`) : migrées avec `publie: true`, ordre du menu repris du site (mission,
  présentation, parcours).

### Phase 2 — Couche contenu
- `lib/content/schema.ts` (Zod), `lib/content/index.ts` : `getProjects()`, `getProject(slug)`,
  `getPages()`, `getPage(slug)`, `getAccueil()`, `getSite()`. Seules les entrées `publie` sont
  retournées, triées par `order`. Échouer bruyamment au build si un fichier ne passe pas la validation.
- Dimensions des images via `image-size` au build (exigées par `ExportedImage` pour des chemins
  locaux en string).
- `lib/markdown.ts` : copie de `aMu/src/lib/markdown.ts`. **C'est le seul chemin du markdown vers le HTML.**
- **Fini quand** un script ou test affiche toutes les entrées sans erreur Zod.

### Phase 3 — Port du front
- Copier `app/components/*`, `app/(frontend)/styles.css`, `styles/globals.css` et `lib/hooks`
  depuis l'ancien repo. Remplacer `next/image` par `ExportedImage` et les types `payload-types` par les types Zod.
- Routes : `/` (accueil + carrousel), `/[slug]` (pages), `/projet/[slug]` (projets).
  `generateStaticParams` **sur les deux routes dynamiques** + `export const dynamicParams = false`.
- `not-found.tsx` → `out/404.html`, servi automatiquement par Cloudflare Pages.
- `app/sitemap.ts` et `app/robots.ts` (`dynamic = "force-static"`). `robots` interdit `/admin`.
- Polices : passer de `<link>` Google Fonts à `next/font/google` (Bodoni Moda, Outfit), qui les auto-héberge.
- Corriger au passage :
  - `layout.tsx` : `lang="fr"`, métadonnées réelles (aujourd'hui « Payload Blank Template »).
  - Menu : `titre_menu` au lieu du slug (`navigation.utils.ts`).
  - `Address.tsx` / `Title.tsx` : lire `reglages/site.yml`. Lien Instagram en `https://instagram.com/<user>`
    (le `instagram://` actuel ne marche que sur mobile avec l'app installée).
  - Retirer `"use client"` inutiles (`ProjectsView`, `PageContent`).
  - `NavBar` : basculer mobile/desktop en CSS plutôt que `useMediaQuery`, pour éviter le flash à l'hydratation.
  - Ne pas reprendre le code mort : `my-route`, `Home.module.css`, `lexicalToHTML.ts`, `app.json`, `vercel.svg`.
- **Fini quand** `npm run build && npm run preview` reproduit le site actuel. Comparer page par page
  avec la prod, en desktop et en mobile (≤ 900 px) : carrousel d'accueil, carrousel vertical
  et horizontal des projets, lightbox (flèches, ESC), menu mobile.

### Phase 4 — CMS
- `public/admin/index.html` (copie aMu, `noindex`) et `public/admin/sveltia-cms.js` (installation vérifiée,
  procédure dans le README aMu : `npm pack @sveltia/cms@<VERSION>`).
- `public/admin/config.yml` complet (voir esquisse), libellés en français avec des `hint` pour Patrice.
- `public/_headers` : copie aMu (CSP `default-src 'none'` sur `/uploads/*`, `nosniff`, `X-Frame-Options: DENY` sur `/admin/*`).
- `scripts/test-cms.mjs` adapté d'aMu. Différence : pas de JSON schema Astro, donc exporter le schéma Zod
  (`zod-to-json-schema` ou `z.toJSONSchema` selon la version de zod) et vérifier les marqueurs dans `out/`.
- Dev local : `next dev` ne sert pas `/admin` → ouvrir `http://localhost:3000/admin/index.html`
  dans Chrome (« Work with Local Repository »). En prod, Pages sert `/admin/` normalement.
- **Fini quand** l'édition locale d'un projet, d'une image (upload converti en webp) et de l'ordre
  modifie bien `content/`, et que `npm run test:cms` passe.

### Phase 5 — Repo GitHub *(action manuelle, à confirmer avant)*
- ✅ Fait le 27/10/2026 : organisation `patrice-pane` (gratuite, Robin admin), repo **public**
  `patrice-pane/patricepane-site`, relié comme `origin`.
- Patrice n'a pas encore de compte GitHub : lui en créer un dédié au site (avec 2FA), puis l'ajouter
  comme **Owner** de l'organisation.

### Phase 6 — Auth (Worker OAuth)
- Copier `aMu/auth/` dans `auth/`, nommer le Worker `cms-auth-patricepane`, mettre `account_id` au bon compte Cloudflare.
- `ALLOWED_ORIGINS` = `https://www.patricepane.com,https://<projet>.pages.dev,http://localhost:3000`
  (l'apex redirige vers `www`, donc l'admin tourne sur `www`).
- `OAUTH_SCOPE` = `public_repo` (repo public).
- Créer une OAuth App GitHub (callback `https://cms-auth-patricepane.<compte>.workers.dev/callback`),
  puis `wrangler secret put` GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET / STATE_SECRET.
- Reporter `base_url` dans `config.yml`. Exclure `auth/` du `tsconfig`.

### Phase 7 — Cloudflare Pages
- Pages → Connect to Git → repo, branche `main`. Build : `npm run build`. Output : `out`. `NODE_VERSION=22`.
- Vérifier sur `*.pages.dev` : toutes les URLs actuelles répondent (`/`, `/mission`, `/presentation`,
  `/parcours`, `/projet/<13 slugs>`), le 404, le sitemap, et que `curl -I …/uploads/x.webp` renvoie la CSP.
- Tester une édition de bout en bout depuis `/admin/` avec le compte de Patrice : commit, rebuild, en ligne en 1 à 2 min.

### Phase 8 — Bascule DNS (AWS → Cloudflare) *(action manuelle)*
Situation : registrar Amazon, DNS Route 53. Apex et `www` pointent vers CloudFront. Pas de MX.
Un seul TXT : `google-site-verification=w0QQ2TiXReFcE4LcGSPi929C7qz9ywEYH9qghzPO1V0`.

**L'URL canonique reste `https://www.patricepane.com`**, celle qui est indexée et déclarée dans
le sitemap actuel. L'apex redirige vers `www`, comme aujourd'hui.

1. Cloudflare (compte du site) → *Add a site* → `patricepane.com`, plan Free. Cloudflare importe
   les enregistrements Route 53 : vérifier que le TXT de vérification Google est bien présent.
   **Ne pas changer encore les NS.**
2. Dans la zone Cloudflare, ajouter `www.patricepane.com` et `patricepane.com` comme domaines
   personnalisés du projet Pages. Cloudflare crée les CNAME (proxied). Ajouter une règle
   Redirect apex → `https://www.patricepane.com` (301, chemin conservé).
3. Baisser le TTL dans Route 53 la veille, si on veut une bascule rapide.
4. AWS console → Route 53 → *Registered domains* → `patricepane.com` → *Edit name servers* →
   mettre les 2 NS donnés par Cloudflare. Le domaine **reste enregistré chez Amazon**. Un transfert
   vers Cloudflare Registrar est possible plus tard, facultatif.
5. Attendre que Cloudflare passe la zone en « Active ». Vérifier `dig NS`, le HTTPS sur l'apex
   et sur `www`, toutes les URL du sitemap actuel, et la 301 vers la nouvelle URL de `…année-30…`.
6. Search Console : la propriété reste valide grâce au TXT. Resoumettre `sitemap.xml`.
7. **Décommissionner AWS après 1 à 2 semaines sans souci** :
   - CloudFront, bucket S3 du site, app Amplify (+ Cognito et autres ressources qu'elle a créées),
     les 3 lambdas (`build`, `s3-onUpload`, `s3-onDelete`) ;
   - puis la hosted zone Route 53 (environ 0,50 $/mois) ;
   - **garder** l'enregistrement du domaine (renouvellement auto, échéance 02/09/2027).

   Faire l'inventaire avant de supprimer, pour ne pas toucher d'autres projets sur le même compte AWS.
8. Archiver `patricepane-docker` sur GitHub (jamais mis en ligne). Le VPS n'est pas concerné.

### Phase 9 — Docs
- `README.md` (français) sur le modèle d'aMu : où est le contenu, guide éditeur, accès, modèle
  de sécurité, mise à jour de Sveltia, mise en prod.

---

## Repo privé : est-ce que ça marche ?

Oui, avec ces nuances :
- **Cloudflare Pages** fonctionne avec un repo privé (l'app GitHub Cloudflare y a accès).
  C'est **GitHub Pages** qui exige un compte payant pour publier depuis un repo privé, ce qui explique sans doute le doute.
- **Sveltia + OAuth** : il faut le scope `repo` au lieu de `public_repo`. Le jeton de l'éditeur
  donne alors accès en écriture à **tous les repos privés** de son compte. Comme dans aMu, il vaut mieux
  utiliser un compte GitHub dédié au site pour Patrice.
- **Connexion par token (secours)** : un *fine-grained token* ne marche pas pour un collaborateur
  sur un repo personnel. Seul le propriétaire peut l'utiliser ; sinon il faut un token classique avec le scope `repo`.
  (C'est indiqué dans le README aMu.)
- Choix recommandé : **public** si rien de confidentiel n'y entre (contenu déjà public,
  pas de `.env` ni de backups), ce qui permet le scope minimal `public_repo`. **Privé** sinon, avec un compte dédié.
