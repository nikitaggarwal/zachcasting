import { redirect } from "next/navigation";

/** Site root resolves to the cast roster (`/roster`). */
export default function HomeRedirect() {
  redirect("/roster");
}
