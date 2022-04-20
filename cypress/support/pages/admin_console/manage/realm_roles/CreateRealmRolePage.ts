class CreateRealmRolePage {
  private realmRoleNameInput = "#kc-name";
  private realmRoleNameError = "#kc-name-helper";
  private realmRoleDescriptionInput = "#kc-role-description";
  private saveBtn = "realm-roles-save-button";
  private cancelBtn = "cancel";

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
    cy.findByTestId(this.cancelBtn).click();

    return this;
  }

  goToAttributesTab() {
    cy.intercept("admin/realms/master/roles-by-id/*").as("load");
    cy.get(".kc-attributes-tab > button").click();
    cy.wait(["@load", "@load"]);
    return this;
  }
}

export default new CreateRealmRolePage();
