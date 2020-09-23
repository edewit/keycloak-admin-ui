import React from "react";
import { mount } from "enzyme";
import { ConfirmDialog } from "../ConfirmDialog";

describe("Confirmation dialog", () => {
  it("renders simple confirm dialog", () => {
    const onConfirm = jest.fn();
    const simple = mount(
      <ConfirmDialog
        titleKey="Delete app02?"
        messageKey="If you delete this client, all associated data will be removed."
        continueButtonLabel="Delete"
        onConfirm={onConfirm}
      />
    );

    const button = simple.find("#modal-confirm").find("button");
    expect(button).not.toBeNull();
    
    button!.simulate("click");
    expect(onConfirm).toBeCalled();

    expect(simple).toMatchSnapshot();
  });
});
