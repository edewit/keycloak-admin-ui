export default class CreateRealmRolePage {
  realmRoleNameInput: string;
  realmRoleNameError: string;
  realmRoleDescriptionInput: string;
  saveBtn: string;
  cancelBtn: string;

  constructor() {
    this.realmRoleNameInput = "#kc-name";
    this.realmRoleNameError = "#kc-name-helper";
    this.realmRoleDescriptionInput = "#kc-role-description";

    this.saveBtn = "realm-roles-save-button";
    this.cancelBtn = '[type="button"]';
  }

  //#region General Settings
  fillRealmRoleData(name: string, description = "") {
    cy.get(this.realmRoleNameInput).clear();

    if (name) {
      cy.get(this.realmRoleNameInput).type(name);
    }

    if (description !== "") {
      this.updateDescription(description);
    }
    return this;
  }

  checkRealmRoleNameRequiredMessage(exist = true) {
    cy.get(this.realmRoleNameError).should((!exist ? "not." : "") + "exist");

    return this;
  }
  //#endregion

  clickActionMenu(item: string) {
    cy.findByTestId("action-dropdown")
      .click()
      .within(() => {
        cy.findByText(item).click();
      });
    return this;
  }

  checkNameDisabled() {
    cy.get(this.realmRoleNameInput).should("have.attr", "readonly", "readonly");
    return this;
  }

  checkDescription(description: string) {
    cy.get(this.realmRoleDescriptionInput).should("have.value", description);
    return this;
  }

  updateDescription(description: string) {
    cy.get(this.realmRoleDescriptionInput).clear().type(description);
    return this;
  }

  save() {
    cy.findByTestId(this.saveBtn).click();

    return this;
  }

  cancel() {
    cy.get(this.cancelBtn).click();

    return this;
  }
}
