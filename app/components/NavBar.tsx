import Link from "next/link";
import { getPages } from "@/lib/content/index.ts";
import MobileMenu from "./MobileMenu";

// "Projets" (home) always comes first, then the pages in their CMS order.
export default function NavBar({ current }: { current?: string }) {
  const links = [
    { href: "/", label: "Projets" },
    ...getPages().map((p) => ({ href: `/${p.slug}`, label: p.titre_menu })),
  ];

  return (
    <MobileMenu>
      <nav>
        <ul className="mt-[7px] p-0">
          {links.map(({ href, label }) => (
            // 21px: the live site's "normal" line height with Google's Outfit (next/font's copy rounds to 20px).
            <li
              key={href}
              className="leading-[21px] list-none before:content-[''] before:inline-block before:w-[30px] before:h-3.5 before:mr-2.5 before:mb-0.5 before:border-b-[1.25px] before:border-[#666565] before:transition-[width] before:duration-300 before:ease-in-out has-[>a:hover]:before:w-10 has-[>a[aria-current]]:before:w-10"
            >
              <Link
                href={href}
                aria-current={href === current ? "page" : undefined}
                className={`text-sm leading-[14px] text-black lowercase tracking-[2px] ${
                  href === current ? "font-normal" : "font-extralight"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </MobileMenu>
  );
}
