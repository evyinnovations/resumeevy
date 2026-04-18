import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SettingsPage } from "@/components/dashboard/settings-page";

export default async function Settings() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, createdAt: true },
  });

  return <SettingsPage user={user} />;
}
