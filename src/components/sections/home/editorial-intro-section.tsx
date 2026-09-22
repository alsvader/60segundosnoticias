import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { ResolvedEditorialIntro } from "@/lib/home/resolve-home-blocks";

type EditorialIntroSectionProps = {
  editorialIntro: ResolvedEditorialIntro;
};

/**
 * Introductory editorial composition (Home Block V1 #8, approved during
 * manual visual review, inspired by docs/references/home-reference.jpeg).
 * Not a news Hero (no Post) and not a Banner (not secondary/promotional) -
 * a distinct visual identity: one CMS-managed backgroundImage spanning the
 * section, one CMS-managed foregroundImage beside the copy, a two-color
 * headline. Neither image renders as a generic bordered card.
 */
export function EditorialIntroSection({
  editorialIntro,
}: EditorialIntroSectionProps) {
  return (
    <section className="relative isolate overflow-hidden py-12 md:py-20">
      {/* `unoptimized`: src may be a runtime-only S3 host - see responsive-media.tsx. */}
      <Image
        src={editorialIntro.backgroundImage.src}
        alt={editorialIntro.backgroundImage.alt}
        fill
        sizes="100vw"
        unoptimized
        className="absolute inset-0 -z-10 object-cover"
      />
      <Container className="grid items-center gap-10 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-5">
          <h2 className="type-display-xl uppercase">
            <span className="text-[var(--ink-950)]">
              {editorialIntro.headlinePrimary}{" "}
            </span>
            <span className="text-[var(--brand-red-500)]">
              {editorialIntro.headlineAccent}
            </span>
          </h2>
          <p className="type-lead max-w-prose text-[var(--ink-700)]">
            {editorialIntro.description}
          </p>
          <Button asChild className="w-fit">
            <Link href={editorialIntro.cta.href}>
              {editorialIntro.cta.label}
            </Link>
          </Button>
        </div>
        <div className="relative aspect-square w-full max-w-md justify-self-center lg:justify-self-end">
          <Image
            src={editorialIntro.foregroundImage.src}
            alt={editorialIntro.foregroundImage.alt}
            fill
            sizes="(min-width: 1024px) 40vw, 80vw"
            unoptimized
            className="object-contain drop-shadow-xl"
          />
        </div>
      </Container>
    </section>
  );
}
