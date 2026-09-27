import { Sidebar, type SidebarPermissions } from "@/components/admin/Sidebar";

export function AdminShell({
  children,
  actorName,
  roleLabel,
  permissions,
}: {
  children: React.ReactNode;
  actorName: string;
  roleLabel: string;
  permissions: SidebarPermissions;
}) {
  return (
    <div className="flex min-h-screen bg-sand">
      <Sidebar actorName={actorName} roleLabel={roleLabel} permissions={permissions} />
      <main className="flex-1 px-6 py-8 md:px-12 md:py-10">{children}</main>
    </div>
  );
}
