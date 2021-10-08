export default class ModalUtils {
  private modalTitle = ".pf-c-modal-box .pf-c-modal-box__title-text";
  private modalMessage = ".pf-c-modal-box .pf-c-modal-box__body";

  private confirmModalBtn = "modalConfirm";
  private cancelModalBtn = "#modal-cancel";
  private closeModalBtn = ".pf-c-modal-box .pf-m-plain";

  confirmModal() {
    cy.findByTestId(this.confirmModalBtn).click();

    return this;
  }

  cancelModal() {
    cy.get(this.cancelModalBtn).click();

    return this;
  }

  closeModal() {
    cy.get(this.closeModalBtn).click();

    return this;
  }

  checkModalTitle(title: string) {
    cy.get(this.modalTitle).invoke("text").should("eq", title);

    return this;
  }

  checkModalMessage(message: string) {
    cy.get(this.modalMessage).invoke("text").should("eq", message);

    return this;
  }
}
