import { describe, expect, it } from "vitest";
import { hasRole, isEditor, describeRoles, diff, type Actor } from "./auth-and-audit";

function actorWith(roles: { role: "ADMIN" | "MIDIA" | "LIDER"; ministryId: string | null }[]): Actor {
  return { roles } as Actor;
}

describe("hasRole", () => {
  it("denies a role the actor doesn't have", () => {
    const lider = actorWith([{ role: "LIDER", ministryId: "jovens" }]);
    expect(hasRole(lider, "MIDIA")).toBe(false);
  });

  it("grants any role check to an ADMIN, regardless of ministry", () => {
    const admin = actorWith([{ role: "ADMIN", ministryId: null }]);
    expect(hasRole(admin, "MIDIA")).toBe(true);
    expect(hasRole(admin, "LIDER", "qualquer-ministerio")).toBe(true);
  });

  it("scopes LIDER to the matching ministry only", () => {
    const lider = actorWith([{ role: "LIDER", ministryId: "jovens" }]);
    expect(hasRole(lider, "LIDER", "jovens")).toBe(true);
    expect(hasRole(lider, "LIDER", "casais")).toBe(false);
  });

  it("treats an unspecified ministryId as 'any ministry with this role'", () => {
    const lider = actorWith([{ role: "LIDER", ministryId: "jovens" }]);
    expect(hasRole(lider, "LIDER")).toBe(true);
  });

  it("denies everything for an actor with no roles", () => {
    const noRole = actorWith([]);
    expect(hasRole(noRole, "LIDER")).toBe(false);
    expect(hasRole(noRole, "MIDIA")).toBe(false);
  });
});

describe("isEditor", () => {
  it("is true for MIDIA and ADMIN, false for LIDER-only", () => {
    expect(isEditor(actorWith([{ role: "MIDIA", ministryId: null }]))).toBe(true);
    expect(isEditor(actorWith([{ role: "ADMIN", ministryId: null }]))).toBe(true);
    expect(isEditor(actorWith([{ role: "LIDER", ministryId: "jovens" }]))).toBe(false);
  });
});

describe("describeRoles", () => {
  it("flags an actor with no roles assigned", () => {
    expect(describeRoles(actorWith([]))).toBe("Sem papel atribuído");
  });

  it("de-duplicates repeated roles across ministries", () => {
    const multiMinistryLider = actorWith([
      { role: "LIDER", ministryId: "jovens" },
      { role: "LIDER", ministryId: "casais" },
    ]);
    expect(describeRoles(multiMinistryLider)).toBe("Líder");
  });

  it("joins distinct roles with a middle dot", () => {
    const editorAndLider = actorWith([
      { role: "MIDIA", ministryId: null },
      { role: "LIDER", ministryId: "jovens" },
    ]);
    expect(describeRoles(editorAndLider)).toBe("Mídia · Líder");
  });
});

describe("diff", () => {
  it("only reports fields that actually changed", () => {
    const before = { title: "Culto", status: "DRAFT", updatedAt: new Date(0), updatedById: "a" };
    const after = { title: "Culto novo", status: "DRAFT", updatedAt: new Date(1), updatedById: "b" };

    expect(diff(before, after)).toEqual({ title: { from: "Culto", to: "Culto novo" } });
  });

  it("ignores bookkeeping fields even when they change", () => {
    const before = { updatedAt: new Date(0), updatedById: "a" };
    const after = { updatedAt: new Date(1), updatedById: "b" };

    expect(diff(before, after)).toEqual({});
  });
});
