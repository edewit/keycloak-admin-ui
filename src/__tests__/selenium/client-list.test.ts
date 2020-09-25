import { Page } from "./page"

describe("test", () => {
  it("test", async (done) => {
    const page = new Page();
    page.visit("http://localhost:8080/");
    page.write(await page.findById("username"), "admin");
    page.write(await page.findById("password"), "admin");
    const form = await page.findById("kc-login");
    form.click();
    await page.quit();
    done();
  })
})