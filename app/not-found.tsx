import type { Metadata } from "next";
import Link from "next/link";
import NavBar from "@/app/components/NavBar";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="main-grid">
      <div className="navbar-grid-area">
        <NavBar />
      </div>
      <div className="[grid-area:5/4/9/10] flex flex-col items-center justify-center gap-4 text-center max-md:[grid-area:4/2/9/12]">
        <h1 className="m-0 text-4xl font-thin text-[#8b8a8a]">Page introuvable</h1>
        <p className="m-0 text-sm font-extralight text-[#525252]">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="mt-6 px-6 py-2 text-sm font-extralight border border-[#8b8a8a] text-[#8b8a8a] transition-colors hover:bg-[#8b8a8a] hover:text-white"
        >
          Voir les projets
        </Link>
      </div>
    </main>
  );
}
