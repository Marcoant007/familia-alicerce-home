import { test, expect, type Page } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";

/**
 * Grava qualquer exceção JS não tratada (ex.: "shadcn is not defined") e falha
 * o teste se alguma acontecer — é o teste que teria pego o bug da tela em branco.
 * Só escuta `pageerror` (exceção real) — não `console.error`, que também dispara
 * pra coisas esperadas (ex.: o 404 de uma URL que a gente testa de propósito).
 */
function trackPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

test.describe("proteção do /backstage", () => {
  test("sem sessão, /backstage redireciona pro /login com o redirect_url certo", async ({ page }) => {
    const errors = trackPageErrors(page);

    const response = await page.goto("/backstage");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/login\?redirect_url=/);
    expect(new URL(page.url()).searchParams.get("redirect_url")).toContain("/backstage");

    expect(errors, `Erros de JS na página: ${errors.join("\n")}`).toEqual([]);
  });

  test("a página de /login renderiza o formulário de verdade do Clerk (não fica em branco)", async ({ page }) => {
    const errors = trackPageErrors(page);

    await page.goto("/login");

    // Regressão do bug "Uncaught ReferenceError: shadcn is not defined": o
    // widget do Clerk precisa montar e mostrar um campo pra digitar o e-mail.
    await expect(page.locator("input[name='identifier'], input[type='email']").first()).toBeVisible({
      timeout: 15_000,
    });

    expect(errors, `Erros de JS na página: ${errors.join("\n")}`).toEqual([]);
  });
});

test.describe("navegação em rota inexistente", () => {
  test("uma URL que não existe mostra 404 e voltar não deixa a aplicação num estado quebrado", async ({ page }) => {
    const errors = trackPageErrors(page);

    await page.goto("/");
    await page.goto("/essa-rota-nao-existe-1234");
    expect(page.url()).toContain("/essa-rota-nao-existe-1234");
    await expect(page.getByText(/404|não encontrada|not found/i).first()).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL("/");
    // A home precisa continuar funcional depois do "voltar" — não uma página em branco.
    await expect(page.locator("body")).not.toBeEmpty();

    expect(errors, `Erros de JS na página: ${errors.join("\n")}`).toEqual([]);
  });
});

test.describe("sessão autenticada", () => {
  test.skip(!process.env.E2E_ADMIN_EMAIL, "defina E2E_ADMIN_EMAIL no .env.local pra rodar este teste");

  test("um admin de verdade consegue logar e chegar no painel", async ({ page }) => {
    const errors = trackPageErrors(page);

    await setupClerkTestingToken({ page });
    await page.goto("/login");
    await clerk.signIn({ page, emailAddress: process.env.E2E_ADMIN_EMAIL! });

    await page.goto("/backstage");
    await expect(page).toHaveURL("/backstage");

    // Segunda camada além do Clerk (src/lib/panel-gate.ts): se algum admin já
    // gerou um token em /backstage/equipe, essa tela aparece antes do painel.
    // Sem token gerado ainda no banco, `checkPanelToken` libera qualquer valor
    // não vazio — por isso o fallback abaixo funciona no ambiente de dev/e2e
    // "limpo"; se um token real já foi gerado, defina E2E_PANEL_TOKEN.
    const tokenInput = page.getByPlaceholder("Token de acesso");
    if (await tokenInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await tokenInput.fill(process.env.E2E_PANEL_TOKEN ?? "e2e-test-token");
      await page.getByRole("button", { name: "Entrar" }).click();

      const wrongToken = page.getByText("Token incorreto.");
      const painel = page.getByText("Painel da equipe");
      await expect(wrongToken.or(painel)).toBeVisible();
      test.skip(
        await wrongToken.isVisible(),
        "há um token de acesso ao painel já configurado nesse banco — defina E2E_PANEL_TOKEN no .env.local com o valor correto"
      );
    }

    await expect(page.getByText("Painel da equipe")).toBeVisible();

    expect(errors, `Erros de JS na página: ${errors.join("\n")}`).toEqual([]);
  });
});
