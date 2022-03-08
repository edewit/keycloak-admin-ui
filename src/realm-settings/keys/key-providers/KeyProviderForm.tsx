import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  AlertVariant,
  FormGroup,
  ValidatedOptions,
  Switch,
  TextInput,
  PageSection,
  ActionGroup,
  Button,
} from "@patternfly/react-core";

import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type { KeyProviderParams, ProviderType } from "../../routes/KeyProvider";
import { useAlerts } from "../../../components/alert/Alerts";
import { useAdminClient, useFetch } from "../../../context/auth/AdminClient";
import { FormAccess } from "../../../components/form-access/FormAccess";
import { HelpItem } from "../../../components/help-enabler/HelpItem";
import { KEY_PROVIDER_TYPE } from "../../../util";
import { ViewHeader } from "../../../components/view-header/ViewHeader";
import AesView from "./aes-generated/View";
import EcdsaView from "./ecdsa-generated/View";
import HmacView from "./hmac-generated/View";
import JavaKeystoreView from "./java-keystore/View";
import RsaView from "./rsa/View";
import RsaGeneratedView from "./rsa-generated/View";

type KeyProviderFormProps = {
  id?: string;
  providerType: ProviderType;
  onClose?: () => void;
};

const SubView = ({ providerType }: { providerType: ProviderType }) => {
  switch (providerType) {
    case "aes-generated":
      return <AesView />;
    case "ecdsa-generated":
      return <EcdsaView />;
    case "hmac-generated":
      return <HmacView />;
    case "java-keystore":
      return <JavaKeystoreView />;
    case "rsa":
      return <RsaView />;
    case "rsa-enc":
      return <RsaView isEnc />;
    case "rsa-enc-generated":
      return <RsaGeneratedView isEnc />;
    case "rsa-generated":
      return <RsaGeneratedView />;

    default:
      return <>invalid view type</>;
  }
};

export const KeyProviderForm = ({
  providerType,
  onClose,
}: KeyProviderFormProps) => {
  const { t } = useTranslation("realm-settings");
  const { id } = useParams<{ id: string }>();
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();

  const form = useForm<ComponentRepresentation>({
    shouldUnregister: false,
    mode: "onChange",
  });
  const { register, control, handleSubmit, errors, reset } = form;

  const save = async (component: ComponentRepresentation) => {
    try {
      if (id) {
        await adminClient.components.update(
          { id },
          {
            ...component,
            providerType: KEY_PROVIDER_TYPE,
          }
        );
        addAlert(t("saveProviderSuccess"), AlertVariant.success);
      } else {
        await adminClient.components.create({
          ...component,
          providerId: providerType,
          providerType: KEY_PROVIDER_TYPE,
          config: { ...component.config, priority: ["0"] },
        });
        addAlert(t("saveProviderSuccess"), AlertVariant.success);
        onClose?.();
      }
    } catch (error) {
      addError("realm-settings:saveProviderError", error);
    }
  };

  useFetch(
    async () => {
      if (id) return await adminClient.components.findOne({ id });
    },
    (result) => {
      if (result) {
        reset({ ...result });
      }
    },
    []
  );

  return (
    <FormAccess isHorizontal role="manage-realm" onSubmit={handleSubmit(save)}>
      {id && (
        <FormGroup
          label={t("providerId")}
          labelIcon={
            <HelpItem
              helpText="client-scopes-help:mapperName"
              fieldLabelId="providerId"
            />
          }
          fieldId="providerId"
          isRequired
        >
          <TextInput
            ref={register}
            id="id"
            type="text"
            name="id"
            isReadOnly
            aria-label={t("providerId")}
            data-testid="providerId-input"
          />
        </FormGroup>
      )}
      <FormGroup
        label={t("common:name")}
        labelIcon={
          <HelpItem
            helpText="client-scopes-help:mapperName"
            fieldLabelId="name"
          />
        }
        fieldId="name"
        isRequired
        validated={
          errors.name ? ValidatedOptions.error : ValidatedOptions.default
        }
        helperTextInvalid={t("common:required")}
      >
        <Controller
          name="name"
          control={control}
          rules={{ required: true }}
          defaultValue={providerType}
          render={({ onChange, value }) => (
            <TextInput
              id="name"
              type="text"
              aria-label={t("common:name")}
              value={value}
              onChange={onChange}
              data-testid="name-input"
            />
          )}
        />
      </FormGroup>
      <FormGroup
        label={t("common:enabled")}
        fieldId="kc-enabled"
        labelIcon={
          <HelpItem
            helpText={t("realm-settings-help:enabled")}
            fieldLabelId="enabled"
          />
        }
      >
        <Controller
          name="config.enabled"
          control={control}
          defaultValue={["true"]}
          render={({ onChange, value }) => (
            <Switch
              id="kc-enabled"
              label={t("common:on")}
              labelOff={t("common:off")}
              isChecked={value[0] === "true"}
              data-testid="enabled"
              onChange={(value) => {
                onChange([value.toString()]);
              }}
            />
          )}
        />
      </FormGroup>
      <FormGroup
        label={t("active")}
        fieldId="kc-active"
        labelIcon={
          <HelpItem
            helpText="realm-settings-help:active"
            fieldLabelId="realm-settings:active"
          />
        }
      >
        <Controller
          name="config.active"
          control={control}
          defaultValue={["true"]}
          render={({ onChange, value }) => {
            return (
              <Switch
                id="kc-active"
                label={t("common:on")}
                labelOff={t("common:off")}
                isChecked={value[0] === "true"}
                data-testid="active"
                onChange={(value) => {
                  onChange([value.toString()]);
                }}
              />
            );
          }}
        />
      </FormGroup>
      <FormProvider {...form}>
        <SubView providerType={providerType} />
      </FormProvider>
      <ActionGroup>
        <Button
          data-testid="add-provider-button"
          variant="primary"
          type="submit"
        >
          {t("common:save")}
        </Button>
        <Button onClick={() => onClose?.()} variant="link">
          {t("common:cancel")}
        </Button>
      </ActionGroup>
    </FormAccess>
  );
};

export default function KeyProviderFormPage() {
  const { t } = useTranslation("realm-settings");
  const params = useParams<KeyProviderParams>();
  return (
    <>
      <ViewHeader titleKey={t("editProvider")} subKey={params.providerType} />
      <PageSection variant="light">
        <KeyProviderForm {...params} />
      </PageSection>
    </>
  );
}
