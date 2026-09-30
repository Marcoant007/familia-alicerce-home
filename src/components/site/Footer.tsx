import Link from "next/link";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { SITE_NAME } from "@/lib/site-config";

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="flex flex-col items-center gap-2 border-t border-line px-5 py-10 text-sm text-soft md:flex-row md:justify-between md:px-20">
      <span>
        © {SITE_NAME}
        {settings.instagram ? (
          <>
            {" · "}
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              Instagram
            </a>
          </>
        ) : null}
        {settings.youtube ? (
          <>
            {" · "}
            <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              YouTube
            </a>
          </>
        ) : null}
      </span>
      <Link href="/backstage" className="text-soft hover:text-ink">
        Área da equipe
      </Link>
    </footer>
  );
}
