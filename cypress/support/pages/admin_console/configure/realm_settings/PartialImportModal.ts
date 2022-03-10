export default class GroupModal {
  private openPartialImport = "openPartialImportModal";

  open() {
    cy.findByTestId(this.openPartialImport).click();
    return this;
  }

  typeResourceFile = (filename: string) => {
    cy.get("#partial-import-file-filename").attachFile(
      "./partial-import-test-data/" + filename,
      { subjectType: "drag-n-drop" }
    );
  };

  importButton() {
    return cy.findByTestId("import-button");
  }

  cancelButton() {
    return cy.findByTestId("cancel-button");
  }

  closeButton() {
    return cy.findByTestId("close-button");
  }

  usersCheckbox() {
    return cy.findByTestId("users-checkbox");
  }

  clientsCheckbox() {
    return cy.findByTestId("clients-checkbox");
  }

  groupsCheckbox() {
    return cy.findByTestId("groups-checkbox");
  }

  idpCheckbox() {
    return cy.findByTestId("identityProviders-checkbox");
  }

  realmRolesCheckbox() {
    return cy.findByTestId("realmRoles-checkbox");
  }

  clientRolesCheckbox() {
    return cy.findByTestId("clientRoles-checkbox");
  }

  userCount() {
    return this.usersCheckbox().get("label");
  }

  clientCount() {
    return this.clientsCheckbox().get("label");
  }

  groupCount() {
    return this.groupsCheckbox().get("label");
  }

  idpCount() {
    return this.idpCheckbox().get("label");
  }

  realmRolesCount() {
    return this.realmRolesCheckbox().get("label");
  }

  clientRolesCount() {
    return this.clientRolesCheckbox().get("label");
  }

  realmSelector() {
    return cy.get("#realm-selector");
  }

  selectRealm(realm: string) {
    this.realmSelector().click();
    cy.findByTestId(realm + "-select-option").click();
  }
}
