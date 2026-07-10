import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { fetchArtists } from "@/lib/actions";
import { ArtistsBrowseClient } from "./_components/ArtistsBrowseClient";

type ArtistSort = "name" | "workCount";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "artistList" });
  return {
    title: `${t("title")} — M·art`,
  };
}

export default async function ArtistsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const { sort: sortParam } = await searchParams;
  const sort: ArtistSort = sortParam === "name" ? "name" : "workCount";
  const artists = await fetchArtists(sort);

  return (
    <ArtistsBrowseClient artists={artists} initialSort={sort} locale={locale} />
  );
}
