-- Remove duplicatas de "services" (o seed rodou mais de uma vez sem unicidade);
-- os dados são idênticos por nome, então mantém só uma linha de cada.
DELETE FROM "services" a USING "services" b
WHERE a.name = b.name AND a."id" > b."id";

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");
