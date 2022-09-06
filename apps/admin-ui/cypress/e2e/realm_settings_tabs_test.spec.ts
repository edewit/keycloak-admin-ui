import SidebarPage from "../support/pages/admin_console/SidebarPage";
import LoginPage from "../support/pages/LoginPage";
import RealmSettingsPage from "../support/pages/admin_console/manage/realm_settings/RealmSettingsPage";
import Masthead from "../support/pages/admin_console/Masthead";
import { keycloakBefore } from "../support/util/keycloak_hooks";
import adminClient from "../support/util/AdminClient";

const loginPage = new LoginPage();
const sidebarPage = new SidebarPage();
const masthead = new Masthead();
const realmSettingsPage = new RealmSettingsPage();

describe("Realm settings tabs tests", () => {
  const realmName = "Realm_" + (Math.random() + 1).toString(36).substring(7);

  beforeEach(() => {
    keycloakBefore();
    loginPage.logIn();
    sidebarPage.goToRealm(realmName);
  });

  before(async () => {
    await adminClient.createRealm(realmName);
  });

  after(async () => {
    await adminClient.deleteRealm(realmName);
  });

  it("shows the 'user profile' tab if enabled", () => {
    sidebarPage.goToRealmSettings();
    cy.findByTestId(realmSettingsPage.userProfileTab).should("not.exist");
    realmSettingsPage.toggleSwitch(
      realmSettingsPage.profileEnabledSwitch,
      false
    );
    realmSettingsPage.save(realmSettingsPage.generalSaveBtn);
    masthead.checkNotificationMessage("Realm successfully updated");
    cy.findByTestId(realmSettingsPage.userProfileTab).should("exist");
  });

  // Clicking multiple toggles in succession causes quick re-renderings of the screen
  // and there will be a noticeable flicker during the test.
  // Sometimes, this will screw up the test and cause Cypress to hang.
  // Clicking to another section each time fixes the problem.
  function reloadRealm() {
    sidebarPage.goToClientScopes();
    sidebarPage.goToRealmSettings();
    cy.findByTestId("rs-login-tab").click();
  }

  function testToggle(realmSwitch: string, expectedValue: string) {
    realmSettingsPage.toggleSwitch(realmSwitch);
    reloadRealm();
    cy.findByTestId(realmSwitch).should("have.value", expectedValue);
  }

  it("Go to login tab", () => {
    sidebarPage.goToRealmSettings();
    cy.findByTestId("rs-login-tab").click();

    testToggle(realmSettingsPage.userRegSwitch, "on");
    testToggle(realmSettingsPage.forgotPwdSwitch, "on");
    testToggle(realmSettingsPage.rememberMeSwitch, "on");
    testToggle(realmSettingsPage.loginWithEmailSwitch, "off");
    testToggle(realmSettingsPage.duplicateEmailsSwitch, "on");

    // Check other values
    cy.findByTestId(realmSettingsPage.emailAsUsernameSwitch).should(
      "have.value",
      "off"
    );

    cy.findByTestId(realmSettingsPage.verifyEmailSwitch).should(
      "have.value",
      "off"
    );
  });

  it("Go to email tab", () => {
    const msg: string = "Error! Failed to send email.";
    sidebarPage.goToRealmSettings();
    cy.findByTestId("rs-email-tab").click();
    realmSettingsPage.addSenderEmail("example@example.com");
    realmSettingsPage.toggleCheck(realmSettingsPage.enableSslCheck);
    realmSettingsPage.toggleCheck(realmSettingsPage.enableStartTlsCheck);
    realmSettingsPage.fillHostField("localhost");
    cy.intercept(`/admin/realms/${realmName}/users/*`).as("load");
    cy.findByTestId(realmSettingsPage.testConnectionButton).click();
    cy.wait("@load");

    realmSettingsPage.fillEmailField(
      "example" + (Math.random() + 1).toString(36).substring(7) + "@example.com"
    );
    cy.findByTestId(realmSettingsPage.modalTestConnectionButton).click();
    masthead.checkNotificationMessage(msg, true);
  });

  it("Go to themes tab", () => {
    sidebarPage.goToRealmSettings();
    cy.findByTestId("rs-themes-tab").click();

    realmSettingsPage.selectLoginThemeType("keycloak");
    realmSettingsPage.selectAccountThemeType("keycloak");
    realmSettingsPage.selectAdminThemeType("base");
    realmSettingsPage.selectEmailThemeType("base");

    realmSettingsPage.saveThemes();
  });
});
