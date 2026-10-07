import { test, expect } from "@playwright/test";
const password = process.env.E2E_PASSWORD!;
async function login(
  page: import("@playwright/test").Page,
  email = "admin@example.test",
) {
  await page.goto("/login");
  await page.getByLabel("Usuário ou e-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar no acervo" }).click();
  await expect(
    page.getByRole("heading", { name: "Conhecimento na Palma da Mão." }),
  ).toBeVisible();
}
async function nav(page: import("@playwright/test").Page, label: string) {
  if (test.info().project.name === "mobile")
    await page.getByRole("button", { name: "Abrir menu" }).click();
  await page
    .getByRole("navigation", { name: "Menu principal" })
    .getByRole("link", { name: label, exact: true })
    .click();
}
test("consulta: login, pesquisa, categorias, favoritos persistentes, QR e navegação sem overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/pops");
  await expect(page).toHaveURL(/\/login$/);
  await login(page);
  await page.screenshot({
    path: `/tmp/pops-home-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.screenshot({
    path: `/tmp/pops-home-${test.info().project.name}-viewport.png`,
  });
  await page
    .getByRole("textbox", { name: "Pesquisar POP", exact: true })
    .fill("higienizacao");
  await expect(
    page
      .locator(".search-results")
      .getByRole("link", { name: /Higienização das Mãos/ }),
  ).toBeVisible();
  await page
    .locator(".search-results")
    .getByRole("link", { name: /Higienização das Mãos/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Higienização das Mãos", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Adicionar aos favoritos" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remover dos favoritos" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Gerar QR Code" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByAltText("QR Code da página atual")).toHaveAttribute(
    "src",
    /^data:image\/png;base64,/,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await nav(page, "Meus favoritos");
  await expect(page.locator(".pop-card")).toHaveCount(1);
  await nav(page, "Categorias");
  await page.getByRole("link", { name: /Controle de Infecção/ }).click();
  await expect(page.locator(".pop-card")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Pesquisar POPs" }).fill("zzzzzz");
  await expect(
    page.getByRole("heading", { name: "Nenhum POP encontrado" }),
  ).toBeVisible();
  for (const route of [
    "/pops",
    "/sobre",
    "/contato",
    "/categorias",
    "/admin",
    "/admin/pops",
    "/admin/pops/novo",
    "/admin/equipe",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  expect(errors).toEqual([]);
  await page.screenshot({
    path: `/tmp/pops-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("administradora cadastra e atualiza POP com PDF; integrante só consulta; arquivos exigem login", async ({
  page,
  browser,
}) => {
  await login(page);
  await page.goto("/admin/pops/novo");
  const suffix = test.info().project.name;
  const title = "Documento de teste " + suffix;
  const code = "E2E-" + suffix;
  await page.getByLabel("Nome do POP").fill(title);
  await page.getByLabel("Código", { exact: true }).fill(code);
  await page
    .getByLabel("Breve descrição")
    .fill(
      "Documento de teste de navegação e upload, sem conteúdo assistencial.",
    );
  await page.getByLabel("Aprovado por").fill("Equipe de testes");
  await page
    .getByLabel("Objetivo", { exact: true })
    .fill("Validar o funcionamento do cadastro.");
  // PDF válido de uma página, produzido pela biblioteca de impressão do Chromium.
  const pdfPage = await browser.newPage();
  await pdfPage.setContent(
    "<h1>Documento de teste</h1><p>Sem conteúdo clínico. Apenas teste do visualizador.</p><div style='break-before:page'><h1>Segunda página de teste</h1><p>Validação da navegação entre páginas.</p></div>",
  );
  const pdfBuffer = await pdfPage.pdf();
  await pdfPage.close();
  await page.locator("input[type=file]").setInputFiles({
    name: "test.pdf",
    mimeType: "application/pdf",
    buffer: pdfBuffer,
  });
  await page.getByRole("button", { name: "Salvar POP", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  const popUrl = page.url();
  const fileUrl = await page
    .getByRole("link", { name: "Abrir documento completo" })
    .getAttribute("href");
  expect(fileUrl).toBeTruthy();
  const authenticated = await page.request.get(fileUrl!);
  expect(authenticated.status()).toBe(200);
  expect(authenticated.headers()["content-type"]).toBe("application/pdf");
  await page
    .getByRole("button", { name: "Visualizar PDF", exact: true })
    .click();
  await expect(page.getByText("Página 1 de 2 carregada.")).toBeVisible();
  await page.getByText("Texto desta página", { exact: true }).click();
  await expect(page.locator(".pdf-text")).toContainText("Documento de teste");
  await expect(page.locator(".pdf-text")).toContainText(
    "Sem conteúdo clínico.",
  );
  await page
    .locator(".pdf-canvas-wrap")
    .screenshot({ path: `/tmp/pops-pdf-${test.info().project.name}.png` });
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Baixar PDF", exact: true }).click();
  expect((await download).suggestedFilename()).toBe(code + ".pdf");
  await page.getByRole("link", { name: "Editar POP" }).click();
  await page.getByLabel("Versão", { exact: true }).fill("2.0");
  await page.getByRole("button", { name: "Salvar POP", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Versão 2.0", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Versão 1.0", { exact: true })).toBeVisible();
  const anonymous = await browser.newContext();
  expect(
    (await anonymous.request.get("http://localhost:3100" + fileUrl)).status(),
  ).toBe(401);
  await anonymous.close();
  const memberContext = await browser.newContext();
  const member = await memberContext.newPage();
  await login(member, "member@example.test");
  await member.goto(popUrl);
  await expect(
    member.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await expect(member.getByRole("link", { name: "Editar POP" })).toHaveCount(0);
  await member.goto("/admin/pops/novo");
  await expect(member).toHaveURL("http://localhost:3100/");
  await page.goto(popUrl);
  await page.getByRole("link", { name: "Editar POP" }).click();
  await page
    .getByRole("combobox", { name: "Status", exact: true })
    .selectOption("inactive");
  await page.getByRole("button", { name: "Salvar POP", exact: true }).click();
  await member.goto(popUrl);
  await expect(
    member.getByRole("heading", { name: "Página não encontrada" }),
  ).toBeVisible();
  expect((await member.request.get(fileUrl!)).status()).toBe(404);
  await memberContext.close();
  await page.goto("/admin/pops");
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Excluir " + title, exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Excluir " + title, exact: true }),
  ).toHaveCount(0);
});

test("gerenciamento de equipe: cadastro, suspensão, reativação e redefinição de senha", async ({
  page,
  browser,
}) => {
  await login(page);
  await page.goto("/admin/equipe");
  const email = `new-${test.info().project.name}@example.test`;
  await page
    .getByLabel("Nome completo")
    .fill("Nova integrante " + test.info().project.name);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha inicial", { exact: false }).fill(password);
  await page.getByRole("button", { name: "Cadastrar integrante" }).click();
  await expect(
    page.getByText(
      "Integrante cadastrado. Entregue as credenciais por um canal privado.",
    ),
  ).toBeVisible();
  const row = page.locator(".team-member").filter({ hasText: email });
  const context = await browser.newContext();
  const member = await context.newPage();
  await login(member, email);
  await row.getByRole("button", { name: "Suspender acesso" }).click();
  await expect(
    row.getByRole("button", { name: "Reativar acesso" }),
  ).toBeVisible();
  await member.goto("/pops");
  await expect(member).toHaveURL(/\/login$/);
  await row.getByRole("button", { name: "Reativar acesso" }).click();
  await expect(
    row.getByRole("button", { name: "Suspender acesso" }),
  ).toBeVisible();
  await login(member, email);
  await row.getByText("Redefinir senha", { exact: true }).click();
  await row.getByLabel("Nova senha").fill(password + "new");
  await row.getByRole("button", { name: "Salvar senha" }).click();
  await expect(
    row.getByText("Senha redefinida e sessões anteriores encerradas."),
  ).toBeVisible();
  await member.goto("/pops");
  await expect(member).toHaveURL(/\/login$/);
  await member.getByLabel("Usuário ou e-mail").fill(email);
  await member.getByLabel("Senha", { exact: true }).fill(password + "new");
  await member.getByRole("button", { name: "Entrar no acervo" }).click();
  await expect(member).toHaveURL("http://localhost:3100/");
  await context.close();
});
