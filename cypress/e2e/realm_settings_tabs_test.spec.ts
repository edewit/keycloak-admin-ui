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

  it("Go to login tab", () => {
    sidebarPage.goToRealmSettings();
    cy.findByTestId("rs-login-tab").click();
    realmSettingsPage.toggleSwitch(realmSettingsPage.userRegSwitch);

    realmSettingsPage.toggleSwitch(realmSettingsPage.forgotPwdSwitch);

    realmSettingsPage.toggleSwitch(realmSettingsPage.rememberMeSwitch);

    realmSettingsPage.toggleSwitch(realmSettingsPage.loginWithEmailSwitch);

    // Check values
    cy.findByTestId(realmSettingsPage.userRegSwitch).should("have.value", "on");
    cy.findByTestId(realmSettingsPage.forgotPwdSwitch).should(
      "have.value",
      "on"
    );
    cy.findByTestId(realmSettingsPage.rememberMeSwitch).should(
      "have.value",
      "on"
    );
    cy.findByTestId(realmSettingsPage.emailAsUsernameSwitch).should(
      "have.value",
      "off"
    );
    cy.findByTestId(realmSettingsPage.loginWithEmailSwitch).should(
      "have.value",
      "off"
    );

    cy.findByTestId(realmSettingsPage.duplicateEmailsSwitch).should(
      "have.value",
      "on"
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
