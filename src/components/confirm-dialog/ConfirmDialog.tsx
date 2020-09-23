import React, { ReactNode, useState } from "react";
import { Button, ButtonVariant, Modal } from "@patternfly/react-core";
import { useTranslation } from "react-i18next";

export type ConfirmDialogProps = {
  titleKey: string;
  messageKey?: string;
  cancelButtonLabel?: string;
  continueButtonLabel?: string;
  continueButtonVariant?: ButtonVariant;
  onConfirm: () => void;
  onCancel?: () => void;
  children?: ReactNode;
};

export const ConfirmDialog = ({
  titleKey,
  messageKey,
  cancelButtonLabel,
  continueButtonLabel,
  continueButtonVariant,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  return (
    <Modal
      title={t(titleKey)}
      isOpen={open}
      onClose={() => setOpen(false)}
      actions={[
        <Button
          id="modal-confirm"
          key="confirm"
          variant={continueButtonVariant || ButtonVariant.danger}
          onClick={() => {
            onConfirm();
            setOpen(false);
          }}
        >
          {t(continueButtonLabel || "common:continue")}
        </Button>,
        <Button
          id="modal-cancel"
          key="cancel"
          variant={ButtonVariant.secondary}
          onClick={() => {
            if (onCancel) onCancel();
            setOpen(false);
          }}
        >
          {t(cancelButtonLabel || "common:cancel")}
        </Button>,
      ]}
    >
      {!messageKey && children}
      {messageKey && t(messageKey)}
    </Modal>
  );
};
