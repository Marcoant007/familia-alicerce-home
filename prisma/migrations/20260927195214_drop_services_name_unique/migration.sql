-- "name" é texto de apresentação, não identidade (pode repetir, pode mudar) —
-- unicidade não faz sentido no banco. A idempotência do seed fica só na aplicação.
DROP INDEX "services_name_key";
