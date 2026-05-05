import type { Metadata } from "next";
import { RosterHomePage } from "@/components/RosterHomePage";

export const metadata: Metadata = {
  title: "Cast roster",
};

export const dynamic = "force-dynamic";

export default function RosterRoutePage() {
  return <RosterHomePage />;
}
