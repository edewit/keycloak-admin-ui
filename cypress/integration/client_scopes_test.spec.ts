import LoginPage from "../support/pages/LoginPage";
import Masthead from "../support/pages/admin_console/Masthead";
import ListingPage from "../support/pages/admin_console/ListingPage";
import SidebarPage from "../support/pages/admin_console/SidebarPage";
import CreateClientScopePage from "../support/pages/admin_console/manage/client_scopes/CreateClientScopePage";
import {
  keycloakBefore,
  keycloakBeforeEach,
} from "../support/util/keycloak_hooks";
import RoleMappingTab from "../support/pages/admin_console/manage/RoleMappingTab";
import ModalUtils from "../support/util/ModalUtils";

let itemId = "client_scope_crud";
const loginPage = new LoginPage();
const masthead = new Masthead();
const sidebarPage = new SidebarPage();
const listingPage = new ListingPage();
const createClientScopePage = new CreateClientScopePage();
const modalUtils = new ModalUtils();

describe("Client Scopes test", () => {
  describe("Client Scope creation", () => {
    before(() => {
      keycloakBefore();
      loginPage.logIn();
    });

    beforeEach(() => {
      keycloakBeforeEach();
      sidebarPage.goToClientScopes();
    });

    it("should fail creating client scope", () => {
      listingPage.goToCreateItem();

      createClientScopePage.save().checkClientNameRequiredMessage();

      createClientScopePage
        .fillClientScopeData("address")
        .save()
        .checkClientNameRequiredMessage(false);

      // The error should inform about duplicated name/id
      masthead.checkNotificationMessage(
        "Could not create client scope: 'Client Scope address already exists'"
      );
    });

    it("Client scope CRUD test", () => {
      itemId += "_" + (Math.random() + 1).toString(36).substring(7);

      // Create
      listingPage.itemExist(itemId, false).goToCreateItem();

      createClientScopePage.fillClientScopeData(itemId).save();

      masthead.checkNotificationMessage("Client scope created");

      sidebarPage.goToClientScopes();
      sidebarPage.waitForPageLoad();

      // Delete
      listingPage
        .searchItem(itemId, false)
        .itemExist(itemId)
        .deleteItem(itemId);

      modalUtils
        .checkModalMessage("Are you sure you want to delete this client scope")
        .confirmModal();

      masthead.checkNotificationMessage("The client scope has been deleted");

      listingPage.itemExist(itemId, false);
    });
  });

  describe("Scope test", () => {
    const scopeTab = new RoleMappingTab();
    const scopeName = "address";

    before(() => {
      keycloakBefore();
      loginPage.logIn();
    });

    beforeEach(() => {
      keycloakBeforeEach();
      sidebarPage.goToClientScopes();
    });

    it("Assign role", () => {
      const role = "offline_access";
      listingPage.searchItem(scopeName, false).goToItemDetails(scopeName);
      scopeTab.goToScopeTab().clickAssignRole().selectRow(role).clickAssign();
      masthead.checkNotificationMessage("Role mapping updated");
      scopeTab.checkRoles([role]);
      scopeTab.hideInheritedRoles().selectRow(role).clickUnAssign();
      modalUtils.checkModalTitle("Remove mapping?").confirmModal();
      scopeTab.checkRoles([]);
    });
  });
});
