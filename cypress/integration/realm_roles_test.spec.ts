import LoginPage from "../support/pages/LoginPage";
import Masthead from "../support/pages/admin_console/Masthead";
import ModalUtils from "../support/util/ModalUtils";
import ListingPage from "../support/pages/admin_console/ListingPage";
import SidebarPage from "../support/pages/admin_console/SidebarPage";
import CreateRealmRolePage from "../support/pages/admin_console/manage/realm_roles/CreateRealmRolePage";
import AssociatedRolesPage from "../support/pages/admin_console/manage/realm_roles/AssociatedRolesPage";
import {
  keycloakBefore,
  keycloakBeforeEach,
} from "../support/util/keycloak_hooks";

let itemId = "realm_role_crud";
const loginPage = new LoginPage();
const masthead = new Masthead();
const modalUtils = new ModalUtils();
const sidebarPage = new SidebarPage();
const listingPage = new ListingPage();
const createRealmRolePage = new CreateRealmRolePage();
const associatedRolesPage = new AssociatedRolesPage();

describe("Realm roles test", () => {
  describe("Realm roles creation", () => {
    before(() => {
      keycloakBefore();
      loginPage.logIn();
    });

    beforeEach(() => {
      keycloakBeforeEach();
      sidebarPage.goToRealmRoles();
    });

    it("should fail creating realm role", () => {
      listingPage.goToCreateItem();

      createRealmRolePage.save().checkRealmRoleNameRequiredMessage();

      createRealmRolePage.fillRealmRoleData("admin").save();

      // The error should inform about duplicated name/id (THIS MESSAGE DOES NOT HAVE QUOTES AS THE OTHERS)
      masthead.checkNotificationMessage(
        "Could not create role: Role with name admin already exists"
      );
    });

    it("Realm role CRUD test", () => {
      itemId += "_" + (Math.random() + 1).toString(36).substring(7);

      // Create
      listingPage.itemExist(itemId, false).goToCreateItem();

      createRealmRolePage.fillRealmRoleData(itemId).save();

      masthead.checkNotificationMessage("Role created");

      sidebarPage.goToRealmRoles();

      listingPage.searchItem(itemId).itemExist(itemId);

      const fetchUrl = "/auth/admin/realms/test/roles?first=0&max=11";
      cy.intercept(fetchUrl).as("fetch");

      listingPage.deleteItem(itemId);

      cy.wait(["@fetch"]);
      modalUtils.checkModalTitle("Delete role?").confirmModal();
      masthead.checkNotificationMessage("The role has been deleted");

      listingPage.itemExist(itemId, false);
    });

    it("Associated roles test", () => {
      itemId += "_" + (Math.random() + 1).toString(36).substring(7);

      // Create
      listingPage.itemExist(itemId, false).goToCreateItem();

      createRealmRolePage.fillRealmRoleData(itemId).save();

      masthead.checkNotificationMessage("Role created");

      // Add associated realm role
      associatedRolesPage.addAssociatedRealmRole();

      // Add associated client role
      associatedRolesPage.addAssociatedClientRole();
    });
  });
});
