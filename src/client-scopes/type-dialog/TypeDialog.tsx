import React, { ReactElement, useState } from "react";
import { Form, Radio } from "@patternfly/react-core";

import { ConfirmDialogModal } from "../../components/confirm-dialog/ConfirmDialog";
import { Controller, useForm } from "react-hook-form";

type TypeDialogProps = {
  numberOfClients: number;
  onConfirm: (type: string) => void;
  onCancel: () => void;
};

export const typeDialog = ({
  numberOfClients,
  onConfirm,
  onCancel,
}: TypeDialogProps): [() => void, () => ReactElement] => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);
  const { control, trigger, getValues } = useForm();
  const Dialog = () => (
    <ConfirmDialogModal
      titleKey="Change type"
      open={open}
      toggleDialog={toggle}
      onConfirm={() => {
        if (trigger()) {
          onConfirm(getValues("type"));
        }
      }}
      onCancel={onCancel}
    >
      <Form>
        {numberOfClients} selected client scopes will be change to
        <Controller
          name="type"
          defaultValue={""}
          control={control}
          render={({ onChange, value }) => (
            <Radio
              id="default-type"
              name="type"
              label="Default type"
              value={value}
              onChange={() => onChange("default")}
            />
          )}
        />
        <Controller
          name="type"
          defaultValue={""}
          control={control}
          render={({ onChange, value }) => (
            <Radio
              id="optional-type"
              name="type"
              label="Optional type"
              value={value}
              onChange={() => onChange("optional")}
            />
          )}
        />
      </Form>
    </ConfirmDialogModal>
  );
  return [toggle, Dialog];
};
