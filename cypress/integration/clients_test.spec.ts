import LoginPage from "../support/pages/LoginPage";
import Masthead from "../support/pages/admin_console/Masthead";
import ListingPage, {
  Filter,
  FilterAssignedType,
} from "../support/pages/admin_console/ListingPage";
import SidebarPage from "../support/pages/admin_console/SidebarPage";
import CreateClientPage from "../support/pages/admin_console/manage/clients/CreateClientPage";
import ModalUtils from "../support/util/ModalUtils";
import AdvancedTab from "../support/pages/admin_console/manage/clients/AdvancedTab";
import AdminClient from "../support/util/AdminClient";
import InitialAccessTokenTab from "../support/pages/admin_console/manage/clients/InitialAccessTokenTab";
import {
  keycloakBefore,
  keycloakBeforeEach,
} from "../support/util/keycloak_hooks";
import RoleMappingTab from "../support/pages/admin_console/manage/RoleMappingTab";
import KeysTab from "../support/pages/admin_console/manage/clients/KeysTab";
import ClientScopesTab from "../support/pages/admin_console/manage/clients/ClientScopesTab";

let itemId = "client_crud";
const loginPage = new LoginPage();
const masthead = new Masthead();
const sidebarPage = new SidebarPage();
const listingPage = new ListingPage();
const createClientPage = new CreateClientPage();
const modalUtils = new ModalUtils();

describe("Clients test", () => {
  describe("Client details - Client scopes subtab", () => {
    const client = new AdminClient();
    const clientScopesTab = new ClientScopesTab();
    const clientId = "client-scopes-subtab-test";
    const clientScopeName = "client-scope-test";
    const clientScopeNameDefaultType = "client-scope-test-default-type";
    const clientScopeNameOptionalType = "client-scope-test-optional-type";
    const clientScope = {
      name: clientScopeName,
      description: "",
      protocol: "openid-connect",
      attributes: {
        "include.in.token.scope": "true",
        "display.on.consent.screen": "true",
        "gui.order": "1",
        "consent.screen.text": "",
      },
    };
    const msgScopeMappingRemoved = "Scope mapping successfully removed";

    before(async () => {
      client.createClient({
        clientId,
        protocol: "openid-connect",
        publicClient: false,
      });
      for (let i = 0; i < 5; i++) {
        clientScope.name = clientScopeName + i;
        await client.createClientScope(clientScope);
        await client.addDefaultClientScopeInClient(
          clientScopeName + i,
          clientId
        );
      }
      clientScope.name = clientScopeNameDefaultType;
      await client.createClientScope(clientScope);
      clientScope.name = clientScopeNameOptionalType;
      await client.createClientScope(clientScope);
    });

    beforeEach(() => {
      keycloakBefore();
      loginPage.logIn();
      sidebarPage.goToClients();
      cy.intercept("/auth/admin/realms/master/clients/*").as("fetchClient");
      listingPage.searchItem(clientId).goToItemDetails(clientId);
      cy.wait("@fetchClient");
      clientScopesTab.goToClientScopesTab();
    });

    after(async () => {
      client.deleteClient(clientId);
      for (let i = 0; i < 5; i++) {
        await client.deleteClientScope(clientScopeName + i);
      }
      await client.deleteClientScope(clientScopeNameDefaultType);
      await client.deleteClientScope(clientScopeNameOptionalType);
    });

    it("should list client scopes", () => {
      listingPage.itemsGreaterThan(1).itemExist(clientScopeName + 0);
    });

    it("should search existing client scope by name", () => {
      listingPage
        .searchItem(clientScopeName + 0, false)
        .itemExist(clientScopeName + 0)
        .itemsEqualTo(1);
    });

    it("should search non-existent client scope by name", () => {
      const itemName = "non-existent-item";
      listingPage.searchItem(itemName, false).checkTableExists(false);
    });

    it("should search existing client scope by assigned type", () => {
      listingPage
        .selectFilter(Filter.AssignedType)
        .selectSecondaryFilterAssignedType(FilterAssignedType.Default)
        .itemExist(FilterAssignedType.Default)
        .itemExist(FilterAssignedType.Optional, false)
        .selectSecondaryFilterAssignedType(FilterAssignedType.Optional)
        .itemExist(FilterAssignedType.Default, false)
        .itemExist(FilterAssignedType.Optional)
        .selectSecondaryFilterAssignedType(FilterAssignedType.AllTypes)
        .itemExist(FilterAssignedType.Default)
        .itemExist(FilterAssignedType.Optional);
    });

    /*it("should empty search", () => {

    });*/

    const newItemsWithExpectedAssignedTypes = [
      [clientScopeNameOptionalType, FilterAssignedType.Optional],
      [clientScopeNameDefaultType, FilterAssignedType.Default],
    ];
    newItemsWithExpectedAssignedTypes.forEach(($type) => {
      const [itemName, assignedType] = $type;
      it(`should add client scope ${itemName} with ${assignedType} assigned type`, () => {
        listingPage.clickPrimaryButton();
        modalUtils.checkModalTitle("Add client scopes to " + clientId);
        listingPage.clickItemCheckbox(itemName);
        modalUtils.confirmModalWithItem(assignedType);
        masthead.checkNotificationMessage("Scope mapping successfully updated");
        listingPage
          .searchItem(itemName, false)
          .itemExist(itemName)
          .itemExist(assignedType);
      });
    });

    const expectedItemAssignedTypes = [
      FilterAssignedType.Optional,
      FilterAssignedType.Default,
    ];
    expectedItemAssignedTypes.forEach(($assignedType) => {
      const itemName = clientScopeName + 0;
      it(`should change item ${itemName} AssignedType to ${$assignedType} from search bar`, () => {
        listingPage
          .searchItem(itemName, false)
          .clickItemCheckbox(itemName)
          .changeTypeToOfSelectedItems($assignedType);
        masthead.checkNotificationMessage("Scope mapping updated");
        listingPage.searchItem(itemName, false).itemExist($assignedType);
      });
    });

    it("should show items on next page are more than 11", () => {
      listingPage.showNextPageTableItems().itemsGreaterThan(1);
    });

    it("should remove client scope from item bar", () => {
      const itemName = clientScopeName + 0;
      listingPage.searchItem(itemName, false).removeItem(itemName);
      masthead.checkNotificationMessage(msgScopeMappingRemoved);
      listingPage.searchItem(itemName, false).checkTableExists(false);
    });

    /*it("should remove client scope from search bar", () => {
      //covered by next test
    });*/

    // TODO: https://github.com/keycloak/keycloak-admin-ui/issues/1854
    it("should remove multiple client scopes from search bar", () => {
      const itemName1 = clientScopeName + 1;
      const itemName2 = clientScopeName + 2;
      listingPage
        .clickSearchBarActionButton()
        .checkDropdownItemIsDisabled("Remove")
        .searchItem(clientScopeName, false)
        .clickItemCheckbox(itemName1)
        .clickItemCheckbox(itemName2)
        .clickSearchBarActionButton()
        .clickSearchBarActionItem("Remove");
      masthead.checkNotificationMessage(msgScopeMappingRemoved);
      listingPage
        .searchItem(clientScopeName, false)
        .itemExist(itemName1, false)
        .itemExist(itemName2, false)
        .clickSearchBarActionButton();
      //.checkDropdownItemIsDisabled("Remove");
    });

    //TODO: https://github.com/keycloak/keycloak-admin-ui/issues/1874
    /* it("should show initial items after filtering", () => { 
      listingPage
        .selectFilter(Filter.AssignedType)
        .selectFilterAssignedType(FilterAssignedType.Optional)
        .selectFilter(Filter.Name)
        .itemExist(FilterAssignedType.Default)
        .itemExist(FilterAssignedType.Optional);
    });*/
  });

  describe("Client creation", () => {
    before(() => {
      keycloakBefore();
      loginPage.logIn();
    });

    beforeEach(() => {
      keycloakBeforeEach();
      sidebarPage.goToClients();
    });

    it("should fail creating client", () => {
      listingPage.goToCreateItem();

      createClientPage.continue().checkClientIdRequiredMessage();

      createClientPage
        .fillClientData("")
        .selectClientType("openid-connect")
        .continue()
        .checkClientIdRequiredMessage();

      createClientPage.fillClientData("account").continue().continue();

      // The error should inform about duplicated name/id
      masthead.checkNotificationMessage(
        "Could not create client: 'Client account already exists'"
      );
    });

    it("Client CRUD test", () => {
      itemId += "_" + (Math.random() + 1).toString(36).substring(7);

      // Create
      listingPage.itemExist(itemId, false).goToCreateItem();

      createClientPage
        .selectClientType("openid-connect")
        .fillClientData(itemId)
        .continue()
        .continue();

      masthead.checkNotificationMessage("Client created successfully");

      sidebarPage.goToClients();

      listingPage.searchItem(itemId).itemExist(itemId);

      // Delete
      listingPage.deleteItem(itemId);
      modalUtils.checkModalTitle(`Delete ${itemId} ?`).confirmModal();

      masthead.checkNotificationMessage("The client has been deleted");

      listingPage.itemExist(itemId, false);
    });

    it("Initial access token", () => {
      const initialAccessTokenTab = new InitialAccessTokenTab();
      initialAccessTokenTab.goToInitialAccessTokenTab().shouldBeEmpty();
      initialAccessTokenTab.createNewToken(1, 1).save();

      modalUtils.checkModalTitle("Initial access token details").closeModal();

      initialAccessTokenTab.shouldNotBeEmpty();

      initialAccessTokenTab.getFistId((id) => {
        listingPage.deleteItem(id);
        modalUtils
          .checkModalTitle("Delete initial access token?")
          .confirmModal();
        masthead.checkNotificationMessage(
          "initial access token created successfully"
        );
      });
    });
  });

  describe("Advanced tab test", () => {
    const advancedTab = new AdvancedTab();
    let client: string;

    before(() => {
      keycloakBefore();
      loginPage.logIn();
    });

    beforeEach(() => {
      keycloakBeforeEach();
      sidebarPage.goToClients();

      client = "client_" + (Math.random() + 1).toString(36).substring(7);

      listingPage.goToCreateItem();

      createClientPage
        .selectClientType("openid-connect")
        .fillClientData(client)
        .continue()
        .continue();

      advancedTab.goToAdvancedTab();
    });

    afterEach(() => {
      new AdminClient().deleteClient(client);
    });

    it("Clustering", () => {
      advancedTab.expandClusterNode();

      advancedTab.registerNodeManually().fillHost("localhost").saveHost();
      advancedTab.checkTestClusterAvailability(true);
    });

    it("Fine grain OpenID connect configuration", () => {
      const algorithm = "ES384";
      advancedTab
        .selectAccessTokenSignatureAlgorithm(algorithm)
        .saveFineGrain();

      advancedTab
        .selectAccessTokenSignatureAlgorithm("HS384")
        .revertFineGrain();
      advancedTab.checkAccessTokenSignatureAlgorithm(algorithm);
    });
  });

  describe("Service account tab test", () => {
    const serviceAccountTab = new RoleMappingTab();
    const serviceAccountName = "service-account-client";

    before(() => {
      keycloakBefore();
      loginPage.logIn();
      new AdminClient().createClient({
        protocol: "openid-connect",
        clientId: serviceAccountName,
        publicClient: false,
        authorizationServicesEnabled: true,
        serviceAccountsEnabled: true,
        standardFlowEnabled: true,
      });
    });

    beforeEach(() => {
      keycloakBeforeEach();
      sidebarPage.goToClients();
    });

    after(() => {
      new AdminClient().deleteClient(serviceAccountName);
    });

    it("list", () => {
      listingPage
        .searchItem(serviceAccountName)
        .goToItemDetails(serviceAccountName);
      serviceAccountTab
        .goToServiceAccountTab()
        .checkRoles(["manage-account", "offline_access", "uma_authorization"]);
    });

    it("assign", () => {
      listingPage.goToItemDetails(serviceAccountName);
      serviceAccountTab
        .goToServiceAccountTab()
        .assignRole(false)
        .selectRow("create-realm")
        .assign();
      masthead.checkNotificationMessage("Role mapping updated");
      serviceAccountTab.selectRow("create-realm").unAssign();
      modalUtils.checkModalTitle("Remove mapping?").confirmModal();
      masthead.checkNotificationMessage("Scope mapping successfully removed");
    });
  });

  describe("Mapping tab", () => {
    const mappingClient = "mapping-client";
    beforeEach(() => {
      keycloakBefore();
      loginPage.logIn();
      sidebarPage.goToClients();
      listingPage.searchItem(mappingClient).goToItemDetails(mappingClient);
    });

    before(() => {
      new AdminClient().createClient({
        protocol: "openid-connect",
        clientId: mappingClient,
        publicClient: false,
      });
    });

    after(() => {
      new AdminClient().deleteClient(mappingClient);
    });

    it("add mapping to openid client", () => {
      cy.get("#pf-tab-mappers-mappers").click();
      cy.findByText("Add predefined mapper").click();
      cy.get("table input").first().click();
      cy.findByTestId("modalConfirm").click();
      masthead.checkNotificationMessage("Mapping successfully created");
    });
  });

  describe("Keys tab test", () => {
    const keysName = "keys-client";
    beforeEach(() => {
      keycloakBeforeEach();
      sidebarPage.goToClients();
      listingPage.searchItem(keysName).goToItemDetails(keysName);
    });

    before(() => {
      keycloakBefore();
      loginPage.logIn();
      new AdminClient().createClient({
        protocol: "openid-connect",
        clientId: keysName,
        publicClient: false,
      });
    });

    after(() => {
      new AdminClient().deleteClient(keysName);
    });

    it("change use JWKS Url", () => {
      const keysTab = new KeysTab();
      keysTab.goToTab().checkSaveDisabled();
      keysTab.toggleUseJwksUrl().checkSaveDisabled(false);
    });

    it("generate new keys", () => {
      const keysTab = new KeysTab();
      keysTab.goToTab().clickGenerate();

      keysTab.fillGenerateModal("keyname", "123", "1234").clickConfirm();

      masthead.checkNotificationMessage(
        "New key pair and certificate generated successfully"
      );
    });
  });

  describe("Realm client", () => {
    const clientName = "master-realm";

    before(() => {
      keycloakBefore();
      loginPage.logIn();
      sidebarPage.goToClients();
      listingPage.searchItem(clientName).goToItemDetails(clientName);
    });

    beforeEach(() => {
      keycloakBeforeEach();
    });

    it("displays the correct tabs", () => {
      cy.findByTestId("client-tabs")
        .find("#pf-tab-settings-settings")
        .should("exist");

      cy.findByTestId("client-tabs")
        .find("#pf-tab-roles-roles")
        .should("exist");

      cy.findByTestId("client-tabs")
        .find("#pf-tab-advanced-advanced")
        .should("exist");

      cy.findByTestId("client-tabs").find("li").should("have.length", 3);
    });

    it("hides the delete action", () => {
      cy.findByTestId("action-dropdown").click();
      cy.findByTestId("delete-client").should("not.exist");
    });
  });

  describe("Bearer only", () => {
    const clientId = "bearer-only";

    before(() => {
      keycloakBefore();
      loginPage.logIn();
      new AdminClient().createClient({
        clientId,
        protocol: "openid-connect",
        publicClient: false,
        bearerOnly: true,
      });
      sidebarPage.goToClients();
      cy.intercept("/auth/admin/realms/master/clients/*").as("fetchClient");
      listingPage.searchItem(clientId).goToItemDetails(clientId);
      cy.wait("@fetchClient");
    });

    after(() => {
      new AdminClient().deleteClient(clientId);
    });

    beforeEach(() => {
      keycloakBeforeEach();
    });

    it("shows an explainer text for bearer only clients", () => {
      cy.findByTestId("bearer-only-explainer-label").trigger("mouseenter");
      cy.findByTestId("bearer-only-explainer-tooltip").should("exist");
    });

    it("hides the capability config section", () => {
      cy.findByTestId("capability-config-form").should("not.exist");
      cy.findByTestId("jump-link-capability-config").should("not.exist");
    });
  });
});
