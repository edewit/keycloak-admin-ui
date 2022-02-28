export default class KeysTab {
  private keysTab = "rs-keys-tab";
  private providersTab = "rs-providers-tab";
  private addProviderDropdown = "addProviderDropdown";

  goToKeysTab() {
    cy.findByTestId(this.keysTab).click();

    return this;
  }

  goToProvidersTab() {
    this.goToKeysTab();
    cy.findByTestId(this.providersTab).click();

    return this;
  }

  addProvider(provider: string) {
    cy.findByTestId(this.addProviderDropdown).click();
    cy.findByTestId(`option-${provider}`).click();

    return this;
  }
}
