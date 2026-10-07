import { test, expect } from "@playwright/test";
test("primeiro acesso pela tela: código inválido recusado, senha privada e login por usuário", async ({
  page,
}) => {
  const base =
    test.info().project.name === "mobile"
      ? "http://localhost:3102"
      : "http://localhost:3101";
  await page.goto(base + "/login");
  await page
    .getByRole("link", { name: "Sou Anelise — configurar meu primeiro acesso" })
    .click();
  await expect(page.getByLabel("Usuário da administradora")).toHaveValue(
    "anelisepiedade",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: `/tmp/pops-first-access-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page
    .getByLabel("Código de ativação", { exact: false })
    .fill("invalid-activation-code-for-test-12345");
  await page
    .getByLabel("Crie sua senha", { exact: false })
    .fill(process.env.E2E_PASSWORD!);
  await page.getByLabel("Confirme sua senha").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Ativar minha conta" }).click();
  await expect(page.getByText("Código de ativação inválido.")).toBeVisible();
  await page
    .getByLabel("Código de ativação", { exact: false })
    .fill(process.env.ADMIN_SETUP_CODE!);
  await page
    .getByLabel("Crie sua senha", { exact: false })
    .fill(process.env.E2E_PASSWORD!);
  await page.getByLabel("Confirme sua senha").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Ativar minha conta" }).click();
  await expect(
    page.getByRole("heading", { name: "Seu acervo, seu cuidado." }),
  ).toBeVisible();
  await page.goto(base + "/primeiro-acesso");
  await expect(page).toHaveURL(base + "/admin");
  if (test.info().project.name === "mobile")
    await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.getByRole("button", { name: "Sair da conta" }).click();
  await expect(page).toHaveURL(base + "/login");
  await expect(
    page.getByRole("link", {
      name: "Sou Anelise — configurar meu primeiro acesso",
    }),
  ).toHaveCount(0);
  await page.getByLabel("Usuário ou e-mail").fill("anelisepiedade");
  await page
    .getByLabel("Senha", { exact: true })
    .fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Entrar no acervo" }).click();
  await expect(page).toHaveURL(base + "/");
});
