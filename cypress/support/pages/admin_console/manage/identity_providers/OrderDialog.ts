const expect = chai.expect;

export default class OrderDialog {
  private manageDisplayOrder = "manageDisplayOrder";
  private list = "manageOrderDataList";

  openDialog() {
    cy.findByTestId(this.manageDisplayOrder).click({ force: true });
    return this;
  }

  moveRowTo(from: string, to: string) {
    cy.findByTestId(to).as("target");
    cy.findByTestId(from).drag("@target");
    return this;
  }

  clickSave() {
    cy.get("#modal-confirm").click();
    return this;
  }

  checkOrder(providerNames: string[]) {
    cy.findByTestId(this.list)
      .find("li")
      .should((providers) => {
        expect(providers).to.have.length(providerNames.length);
        providerNames.forEach((providerName, index) =>
          expect(providers.eq(index)).to.contain(providerName)
        );
      });
  }
}
