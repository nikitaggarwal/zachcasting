import { notFound } from "next/navigation";
import { getCastProfile } from "@/lib/data";
import { CastProfileView } from "@/components/CastProfileView";

type Props = { params: Promise<{ slug: string }> };

export default async function CastPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getCastProfile(slug);
  if (!profile) notFound();
  return <CastProfileView profile={profile} />;
}
