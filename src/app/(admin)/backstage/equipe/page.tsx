import type { Metadata } from "next";
import { Suspense } from "react";
import { UserPlus, Settings } from "lucide-react";
import { getActor, hasRole } from "@/lib/auth-and-audit";
import { getStaffMembers } from "@/lib/queries/staff";
import { getMinistries } from "@/lib/queries/ministries";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { Panel } from "@/components/admin/Panel";
import { InviteMemberDialog } from "@/components/admin/InviteMemberDialog";
import { StaffRolesDialog } from "@/components/admin/StaffRolesDialog";
import { ToggleActiveButton } from "@/components/admin/ToggleActiveButton";
import { PanelTokenCard } from "@/components/admin/PanelTokenCard";
import { SaveSuccessDialog } from "@/components/admin/SaveSuccessDialog";

export const metadata: Metadata = { title: "Equipe" };

const ROLE_LABELS = { ADMIN: "Admin", MIDIA: "Mídia", LIDER: "Líder" } as const;

export default async function EquipePage() {
  const actor = await getActor();
  if (!hasRole(actor, "ADMIN")) {
    return <p className="text-soft">Só admins gerenciam a equipe.</p>;
  }

  const [members, ministries, settings] = await Promise.all([
    getStaffMembers(),
    getMinistries(),
    getSiteSettings(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <SaveSuccessDialog
          messages={{ invite: "Convite enviado!", role: "Papel concedido!", active: "Acesso reativado!" }}
        />
      </Suspense>

      <PanelTokenCard setAt={settings.panelAccessTokenSetAt} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Equipe</h1>
        <InviteMemberDialog
          ministries={ministries}
          trigger={
            <span className="flex items-center gap-2">
              <UserPlus size={18} strokeWidth={2} aria-hidden="true" /> Convidar
            </span>
          }
          triggerClassName="rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-paper"
        />
      </div>

      <Panel className="p-0">
        {members.length === 0 ? (
          <p className="p-8 text-soft">Nenhuma pessoa na equipe ainda.</p>
        ) : (
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-line text-xs font-extrabold text-soft uppercase">
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Papéis</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className={`border-b border-line last:border-0 ${!member.active ? "opacity-50" : ""}`}>
                  <td className="px-6 py-4 font-bold">
                    {member.name}
                    {member.id === actor.id ? <span className="ml-2 text-xs font-bold text-soft">(você)</span> : null}
                  </td>
                  <td className="px-6 py-4 text-soft">{member.email}</td>
                  <td className="px-6 py-4">
                    {member.roles.length === 0 ? (
                      <span className="text-soft">Sem papel</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {member.roles.map((role) => (
                          <span key={role.id} className="rounded-full bg-sand px-3 py-1 text-xs font-extrabold text-ink">
                            {ROLE_LABELS[role.role]}
                            {role.ministry ? ` · ${role.ministry.name}` : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-soft">{member.active ? "Ativo" : "Desativado"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <StaffRolesDialog
                        staffMemberId={member.id}
                        staffName={member.name}
                        roles={member.roles}
                        ministries={ministries}
                        trigger={<Settings size={18} strokeWidth={2} aria-hidden="true" />}
                        triggerClassName="flex size-9 items-center justify-center rounded-lg text-soft hover:bg-sand hover:text-ink"
                      />
                      <ToggleActiveButton
                        staffMemberId={member.id}
                        staffName={member.name}
                        active={member.active}
                        isSelf={member.id === actor.id}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
