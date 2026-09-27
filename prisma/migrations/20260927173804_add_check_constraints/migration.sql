-- Regras que o Prisma não expressa no schema.

-- Evento termina depois de começar
ALTER TABLE "events" ADD CONSTRAINT "events_ends_after_start" CHECK ("ends_at" > "starts_at");

-- Link de inscrição só https
ALTER TABLE "events" ADD CONSTRAINT "events_registration_https"
  CHECK ("registration_url" IS NULL OR "registration_url" ~ '^https://');

-- Janela do aviso
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_window"
  CHECK ("unpublish_at" IS NULL OR "unpublish_at" > "publish_at");

-- Cor no formato #RRGGBB e uma única linha de configurações
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_accent_hex" CHECK ("accent_color" ~ '^#[0-9A-Fa-f]{6}$');
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_single_row" CHECK ("id" = 1);
INSERT INTO "site_settings" ("id", "accent_color", "updated_at") VALUES (1, '#FFC53D', now());

-- Dia da semana do culto
ALTER TABLE "services" ADD CONSTRAINT "services_weekday" CHECK ("weekday" BETWEEN 0 AND 6);

-- Papéis: LIDER sempre com ministério; ADMIN e MIDIA sem ministério
ALTER TABLE "staff_roles" ADD CONSTRAINT "staff_roles_ministry_rule"
  CHECK (("role" = 'LIDER' AND "ministry_id" IS NOT NULL) OR ("role" <> 'LIDER' AND "ministry_id" IS NULL));

-- Evita ADMIN/MIDIA duplicado (o @@unique não pega porque ministry_id é NULL)
CREATE UNIQUE INDEX "staff_roles_global_unique" ON "staff_roles" ("staff_member_id", "role") WHERE "ministry_id" IS NULL;

-- Auditoria só aceita inserção: bloqueia UPDATE e DELETE
CREATE FUNCTION audit_logs_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs é somente inserção';
END $$;
CREATE TRIGGER audit_logs_no_change BEFORE UPDATE OR DELETE ON "audit_logs"
  FOR EACH ROW EXECUTE FUNCTION audit_logs_immutable();
