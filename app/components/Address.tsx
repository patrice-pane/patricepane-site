import type { Site } from "@/lib/content/schema.ts";

export function Insta({ site, size, color, className = "" }: { site: Site; size: number; color: string; className?: string }) {
  return (
    <a
      href={`https://www.instagram.com/${site.instagram}/`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Instagram de ${site.nom_site}`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M18.437 20.937H5.563C4.89996 20.937 4.26407 20.6736 3.79523 20.2048C3.32639 19.7359 3.063 19.1 3.063 18.437V5.563C3.063 4.89996 3.32639 4.26408 3.79523 3.79524C4.26407 3.3264 4.89996 3.063 5.563 3.063H18.437C19.1 3.063 19.7359 3.3264 20.2048 3.79524C20.6736 4.26408 20.937 4.89996 20.937 5.563V18.437C20.937 19.1 20.6736 19.7359 20.2048 20.2048C19.7359 20.6736 19.1 20.937 18.437 20.937ZM5.563 4.063C5.16518 4.063 4.78364 4.22104 4.50234 4.50234C4.22104 4.78365 4.063 5.16518 4.063 5.563V18.437C4.063 18.8348 4.22104 19.2164 4.50234 19.4977C4.78364 19.779 5.16518 19.937 5.563 19.937H18.437C18.8348 19.937 19.2164 19.779 19.4977 19.4977C19.779 19.2164 19.937 18.8348 19.937 18.437V5.563C19.937 5.16518 19.779 4.78365 19.4977 4.50234C19.2164 4.22104 18.8348 4.063 18.437 4.063H5.563Z" fill={color} />
        <path d="M12 16.594C11.0914 16.593 10.2034 16.3227 9.44841 15.8171C8.69341 15.3116 8.10523 14.5935 7.75824 13.7537C7.41126 12.914 7.32103 11.9902 7.49898 11.0991C7.67692 10.2081 8.11504 9.38982 8.75796 8.74773C9.40089 8.10565 10.2197 7.6686 11.111 7.49181C12.0023 7.31503 12.926 7.40646 13.7653 7.75455C14.6046 8.10263 15.3219 8.69174 15.8264 9.44741C16.331 10.2031 16.6002 11.0914 16.6 12C16.5984 13.219 16.1131 14.3874 15.2506 15.2488C14.3881 16.1102 13.219 16.594 12 16.594V16.594ZM12 8.40001C11.2894 8.40099 10.595 8.61255 10.0046 9.00796C9.41418 9.40336 8.95418 9.96487 8.6827 10.6216C8.41122 11.2783 8.34045 12.0007 8.47932 12.6976C8.6182 13.3945 8.96049 14.0346 9.46295 14.5371C9.96542 15.0395 10.6055 15.3818 11.3024 15.5207C11.9993 15.6596 12.7217 15.5888 13.3784 15.3173C14.0351 15.0458 14.5966 14.5858 14.992 13.9954C15.3875 13.405 15.599 12.7106 15.6 12C15.6 11.0452 15.2207 10.1296 14.5456 9.45442C13.8705 8.77929 12.9548 8.40001 12 8.40001V8.40001Z" fill={color} />
        <path d="M17.2 7.905C17.7937 7.905 18.275 7.42371 18.275 6.83C18.275 6.2363 17.7937 5.755 17.2 5.755C16.6063 5.755 16.125 6.2363 16.125 6.83C16.125 7.42371 16.6063 7.905 17.2 7.905Z" fill={color} />
      </svg>
    </a>
  );
}

// Home: postal address with the Instagram logo; other pages: name and trade. Phone and email on both.
export default function Address({ site, isHome = false }: { site: Site; isHome?: boolean }) {
  const lines = isHome ? site.adresse.split("\n") : [site.nom_site, site.metier];
  return (
    <address
      className={`text-xs md:text-[13px] leading-[13px] font-extralight text-[#525252] text-right ${
        isHome ? "relative ml-10 md:text-left" : ""
      }`}
    >
      {isHome && <Insta site={site} size={28} color="grey" className="hidden md:block absolute -left-8 top-0" />}
      {lines.map((line) => (
        <p className="m-0" key={line}>
          {line}
        </p>
      ))}
      <p className="m-0">{site.telephone}</p>
      <a href={`mailto:${site.email}`} className="text-[#525252]">
        {site.email}
      </a>
    </address>
  );
}
