import { keycloakBefore } from "../support/util/keycloak_hooks";
import Masthead from "../support/pages/admin_console/Masthead";
import LoginPage from "../support/pages/LoginPage";
import SidebarPage from "../support/pages/admin_console/SidebarPage";
import OTPPolicies from "../support/pages/admin_console/manage/authentication/OTPPolicies";
import WebAuthnPolicies from "../support/pages/admin_console/manage/authentication/WebAuthnPolicies";

describe("Policies", () => {
  const masthead = new Masthead();
  const loginPage = new LoginPage();
  const sidebarPage = new SidebarPage();

  describe("OTP policies tab", () => {
    const otpPoliciesPage = new OTPPolicies();
    beforeEach(() => {
      keycloakBefore();
      loginPage.logIn();
      sidebarPage.goToAuthentication();
      otpPoliciesPage.goToTab();
    });

    it("should change to hotp", () => {
      otpPoliciesPage.checkSupportedActions("FreeOTP, Google Authenticator");
      otpPoliciesPage.setPolicyType("hotp").increaseInitialCounter().save();
      masthead.checkNotificationMessage("OTP policy successfully updated");
      otpPoliciesPage.checkSupportedActions("FreeOTP");
    });
  });

  describe("Webauthn policies tabs", () => {
    const webauthnPage = new WebAuthnPolicies();
    beforeEach(() => {
      keycloakBefore();
      loginPage.logIn();
      sidebarPage.goToAuthentication();
    });

    it("should fill webauthn settings", () => {
      webauthnPage.goToTab();
      webauthnPage.fillSelects({
        webAuthnPolicyAttestationConveyancePreference: "Indirect",
        webAuthnPolicyRequireResidentKey: "Yes",
        webAuthnPolicyUserVerificationRequirement: "Preferred",
      });
      webauthnPage.webAuthnPolicyCreateTimeout(30).save();
      masthead.checkNotificationMessage(
        "Updated webauthn policies successfully"
      );
    });

    it("should fill webauthn passwordless settings", () => {
      webauthnPage.goToPasswordlessTab();
      webauthnPage
        .fillSelects(
          {
            webAuthnPolicyAttestationConveyancePreference: "Indirect",
            webAuthnPolicyRequireResidentKey: "Yes",
            webAuthnPolicyUserVerificationRequirement: "Preferred",
          },
          true
        )
        .save();
      masthead.checkNotificationMessage(
        "Updated webauthn policies successfully"
      );
    });
  });
});
