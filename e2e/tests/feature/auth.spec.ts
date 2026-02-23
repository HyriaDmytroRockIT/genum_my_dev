import fs from "node:fs";
import { test } from "../../fixtures/test";
import { authCredentialsPath } from "../../config/env";

test("user can log out and log in again", async ({ layoutPage, authPage }) => {
  const credentials = JSON.parse(fs.readFileSync(authCredentialsPath, "utf-8")) as {
    email: string;
    password: string;
  };

  await test.step("Go to app", async () => {
    await layoutPage.openHome();
  });

  await test.step("Open user menu and logout", async () => {
    await layoutPage.logoutByUserEmail(credentials.email);
  });

  await test.step("Login again", async () => {
    await authPage.login(credentials.email, credentials.password);
  });
});
