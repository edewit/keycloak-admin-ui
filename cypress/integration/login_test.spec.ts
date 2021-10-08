import LoginPage from "../support/pages/LoginPage";
import Masthead from "../support/pages/admin_console/Masthead";

const username = "admin";
const password = "admin";

const loginPage = new LoginPage();
const masthead = new Masthead();

describe("Logging In", () => {
  beforeEach(() => {
    cy.visit("");
  });

  it("displays errors on wrong credentials", () => {
    loginPage.logIn("wrong", "user{enter}");

    loginPage.checkErrorMessage("Invalid username or password.").isLogInPage();
  });

  it("logs in", () => {
    loginPage.logIn(username, password);

    masthead.isAdminConsole();

    cy.getCookie("KEYCLOAK_SESSION_LEGACY").should("exist");
  });
});
