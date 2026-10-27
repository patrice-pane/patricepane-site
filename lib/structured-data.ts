import type { Accueil, Site } from "./content/schema.ts";
import type { Image } from "./content/image.ts";
import { SITE_URL } from "./metadata.ts";

// Address as typed in the CMS: "street\npostcode, city". Parsed so Google gets a PostalAddress;
// if it is written otherwise, the whole text goes into streetAddress (still valid).
function postalAddress(adresse: string) {
  const lines = adresse.split("\n").map((l) => l.trim()).filter(Boolean);
  const city = lines.at(-1)?.match(/^(\d{5}),?\s*(.+)$/);
  return {
    "@type": "PostalAddress",
    streetAddress: city ? lines.slice(0, -1).join(", ") : lines.join(", "),
    ...(city && { postalCode: city[1], addressLocality: city[2] }),
    addressCountry: "FR",
  };
}

// "06 29 53 56 07" → "+33 6 29 53 56 07" (international format, as Google recommends).
const internationalPhone = (phone: string) => phone.trim().replace(/^0/, "+33 ");

// JSON-LD for the home page: the business behind the site (Google: LocalBusiness, most specific
// subtype; HomeAndConstructionBusiness covers interior renovation).
export function businessJsonLd(site: Site, accueil: Accueil, cover?: Image) {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE_URL}/#entreprise`,
    name: site.nom_site,
    // Name of the Google Business Profile, so Google matches the profile and the site.
    alternateName: `${site.nom_site} Architecture Intérieure`,
    description: accueil.description || undefined,
    url: `${SITE_URL}/`,
    telephone: internationalPhone(site.telephone),
    email: site.email,
    address: postalAddress(site.adresse),
    areaServed: { "@type": "City", name: "Marseille" },
    ...(cover && { image: `${SITE_URL}${cover.src}` }),
    sameAs: [`https://www.instagram.com/${site.instagram}/`, ...(site.fiche_google ? [site.fiche_google] : [])],
  };
}

// Serialized for a <script type="application/ld+json">: "<" escaped so CMS text cannot close the tag.
export const jsonLdScript = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
