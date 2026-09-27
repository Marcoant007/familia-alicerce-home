import { getActor, hasRole, describeRoles } from "@/lib/auth-and-audit";
import { AdminShell } from "@/components/admin/AdminShell";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  const permissions = {
    isAdmin: hasRole(actor, "ADMIN"),
    isEditor: hasRole(actor, "MIDIA"),
  };

  return (
    <AdminShell actorName={actor.name} roleLabel={describeRoles(actor)} permissions={permissions}>
      {children}
      <Toaster position="bottom-right" />
    </AdminShell>
  );
}
