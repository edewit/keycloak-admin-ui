import React, { useEffect } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ActionGroup,
  AlertVariant,
  Button,
  ButtonVariant,
  FormGroup,
  PageSection,
  Popover,
  Select,
  SelectOption,
  SelectVariant,
  Switch,
  Text,
  TextContent,
  TextInput,
} from "@patternfly/react-core";
import { QuestionCircleIcon } from "@patternfly/react-icons";

import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { convertFormValuesToObject, convertToFormValues } from "../../util";
import { useAdminClient } from "../../context/auth/AdminClient";
import { useRealm } from "../../context/realm-context/RealmContext";
import { FormAccess } from "../../components/form-access/FormAccess";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { useHelp } from "../../components/help-enabler/HelpHeader";
import useToggle from "../../utils/useToggle";
import { useAlerts } from "../../components/alert/Alerts";
import { TimeSelector } from "../../components/time-selector/TimeSelector";
import { MultiLineInput } from "../../components/multi-line-input/MultiLineInput";

import "./webauthn-policy.css";

const SIGNATURE_ALGORITHMS = [
  "ES256",
  "ES384",
  "ES512",
  "RS256",
  "RS384",
  "RS512",
  "RS1",
] as const;
const ATTESTATION_PREFERENCE = [
  "not specified",
  "none",
  "indirect",
  "direct",
] as const;

const AUTHENTICATOR_ATTACHMENT = [
  "not specified",
  "platform",
  "cross-platform",
] as const;

const RESIDENT_KEY_OPTIONS = ["not specified", "Yes", "No"] as const;

const USER_VERIFY = [
  "not specified",
  "required",
  "preferred",
  "discouraged",
] as const;

type WeauthnSelectProps = {
  name: string;
  options: readonly string[];
  labelPrefix?: string;
  isMultiSelect?: boolean;
};

const WebauthnSelect = ({
  name,
  options,
  labelPrefix,
  isMultiSelect = false,
}: WeauthnSelectProps) => {
  const { t } = useTranslation("authentication");
  const { control } = useFormContext();

  const [open, toggle] = useToggle();
  return (
    <FormGroup
      label={t(name)}
      labelIcon={
        <HelpItem
          helpText={`authentication-help:${name}`}
          fieldLabelId={`authentication:${name}`}
        />
      }
      fieldId={name}
    >
      <Controller
        name={name}
        defaultValue={options[0]}
        control={control}
        render={({ onChange, value }) => (
          <Select
            toggleId={name}
            onToggle={toggle}
            onSelect={(_, selectedValue) => {
              if (isMultiSelect) {
                const changedValue = value.find(
                  (item: string) => item === selectedValue
                )
                  ? value.filter((item: string) => item !== selectedValue)
                  : [...value, selectedValue];
                onChange(changedValue);
              } else {
                onChange(selectedValue.toString());
                toggle();
              }
            }}
            selections={labelPrefix ? t(`${labelPrefix}.${value}`) : value}
            variant={
              isMultiSelect
                ? SelectVariant.typeaheadMulti
                : SelectVariant.single
            }
            aria-label={t(name)}
            isOpen={open}
          >
            {options.map((option) => (
              <SelectOption
                selected={option === value}
                key={option}
                value={option}
              >
                {labelPrefix ? t(`${labelPrefix}.${option}`) : option}
              </SelectOption>
            ))}
          </Select>
        )}
      />
    </FormGroup>
  );
};

type WebauthnPolicyProps = {
  realm: RealmRepresentation;
  realmUpdated: (realm: RealmRepresentation) => void;
};

export const WebauthnPolicy = ({
  realm,
  realmUpdated,
}: WebauthnPolicyProps) => {
  const { t } = useTranslation("authentication");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();
  const { realm: realmName } = useRealm();
  const { enabled } = useHelp();
  const form = useForm({ mode: "onChange", shouldUnregister: false });
  const {
    control,
    register,
    setValue,
    errors,
    handleSubmit,
    formState: { isDirty },
  } = form;

  const setupForm = (realm: RealmRepresentation) =>
    convertToFormValues(realm, setValue, ["webAuthnPolicyAcceptableAaguids"]);

  useEffect(() => setupForm(realm), []);

  const save = async (realm: RealmRepresentation) => {
    const submittedRealm = convertFormValuesToObject(realm, [
      "webAuthnPolicyAcceptableAaguids",
    ]);
    try {
      await adminClient.realms.update({ realm: realmName }, submittedRealm);
      realmUpdated(submittedRealm);
      setupForm(submittedRealm);
      addAlert(t("webAuthnUpdateSuccess"), AlertVariant.success);
    } catch (error) {
      addError("authentication:webAuthnUpdateError", error);
    }
  };

  return (
    <PageSection variant="light">
      {enabled && (
        <Popover bodyContent={t("authentication-help:webauthnFormHelp")}>
          <TextContent className="keycloak__webauthn_policies__intro">
            <Text>
              <QuestionCircleIcon /> {t("authentication-help:webauthnIntro")}
            </Text>
          </TextContent>
        </Popover>
      )}

      <FormAccess
        role="manage-realm"
        isHorizontal
        onSubmit={handleSubmit(save)}
        className="keycloak__webauthn_policies_authentication__form"
      >
        <FormGroup
          label={t("webAuthnPolicyRpEntityName")}
          fieldId="webAuthnPolicyRpEntityName"
          helperTextInvalid={t("common:required")}
          validated={errors.webAuthnPolicyRpEntityName ? "error" : "default"}
          isRequired
          labelIcon={
            <HelpItem
              helpText="authentication-help:webAuthnPolicyRpEntityName"
              fieldLabelId="authentication:webAuthnPolicyRpEntityName"
            />
          }
        >
          <TextInput
            ref={register({ required: true })}
            name="webAuthnPolicyRpEntityName"
            id="webAuthnPolicyRpEntityName"
            data-testid="webAuthnPolicyRpEntityName"
            validated={errors.webAuthnPolicyRpEntityName ? "error" : "default"}
          />
        </FormGroup>
        <FormProvider {...form}>
          <WebauthnSelect
            name="webAuthnPolicySignatureAlgorithms"
            options={SIGNATURE_ALGORITHMS}
            isMultiSelect
          />
          <FormGroup
            label={t("webAuthnPolicyRpId")}
            labelIcon={
              <HelpItem
                helpText="authentication-help:webAuthnPolicyRpId"
                fieldLabelId="authentication:webAuthnPolicyRpId"
              />
            }
            fieldId="webAuthnPolicyRpId"
          >
            <TextInput
              id="webAuthnPolicyRpId"
              name="webAuthnPolicyRpId"
              ref={register()}
              data-testid="webAuthnPolicyRpId
            "
            />
          </FormGroup>
          <WebauthnSelect
            name="webAuthnPolicyAttestationConveyancePreference"
            options={ATTESTATION_PREFERENCE}
            labelPrefix="attestationPreference"
          />
          <WebauthnSelect
            name="webAuthnPolicyAuthenticatorAttachment"
            options={AUTHENTICATOR_ATTACHMENT}
            labelPrefix="authenticatorAttachment"
          />
          <WebauthnSelect
            name="webAuthnPolicyRequireResidentKey"
            options={RESIDENT_KEY_OPTIONS}
            labelPrefix="residentKey"
          />
          <WebauthnSelect
            name="webAuthnPolicyUserVerificationRequirement"
            options={USER_VERIFY}
            labelPrefix="userVerify"
          />
          <FormGroup
            label={t("webAuthnPolicyCreateTimeout")}
            fieldId="webAuthnPolicyCreateTimeout"
            helperTextInvalid={t("webAuthnPolicyCreateTimeoutHint")}
            validated={errors.webAuthnPolicyCreateTimeout ? "error" : "default"}
            labelIcon={
              <HelpItem
                helpText="authentication-help:webAuthnPolicyCreateTimeout"
                fieldLabelId="authentication:webAuthnPolicyCreateTimeout"
              />
            }
          >
            <Controller
              name="webAuthnPolicyCreateTimeout"
              defaultValue={0}
              control={control}
              rules={{ min: 0, max: 31536 }}
              render={({ onChange, value }) => (
                <TimeSelector
                  data-testid="webAuthnPolicyCreateTimeout"
                  aria-label={t("webAuthnPolicyCreateTimeout")}
                  value={value}
                  onChange={onChange}
                  units={["seconds", "minutes", "hours"]}
                  validated={
                    errors.webAuthnPolicyCreateTimeout ? "error" : "default"
                  }
                />
              )}
            />
          </FormGroup>
          <FormGroup
            label={t("webAuthnPolicyAvoidSameAuthenticatorRegister")}
            fieldId="webAuthnPolicyAvoidSameAuthenticatorRegister"
            labelIcon={
              <HelpItem
                helpText="authentication-help:webAuthnPolicyAvoidSameAuthenticatorRegister"
                fieldLabelId="authentication:webAuthnPolicyAvoidSameAuthenticatorRegister"
              />
            }
          >
            <Controller
              name="webAuthnPolicyAvoidSameAuthenticatorRegister"
              defaultValue={false}
              control={control}
              render={({ onChange, value }) => (
                <Switch
                  id="webAuthnPolicyAvoidSameAuthenticatorRegister"
                  label={t("common:on")}
                  labelOff={t("common:off")}
                  isChecked={value}
                  onChange={onChange}
                />
              )}
            />
          </FormGroup>
          <FormGroup
            label={t("webAuthnPolicyAcceptableAaguids")}
            fieldId="webAuthnPolicyAcceptableAaguids"
            labelIcon={
              <HelpItem
                helpText="authentication-help:webAuthnPolicyAcceptableAaguids"
                fieldLabelId="authentication:webAuthnPolicyAcceptableAaguids"
              />
            }
          >
            <MultiLineInput
              name="webAuthnPolicyAcceptableAaguids"
              aria-label={t("webAuthnPolicyAcceptableAaguids")}
              addButtonLabel="authentication:addAaguids"
            />
          </FormGroup>
        </FormProvider>

        <ActionGroup>
          <Button
            data-testid="save"
            variant="primary"
            type="submit"
            isDisabled={!isDirty}
          >
            {t("common:save")}
          </Button>
          <Button
            data-testid="reload"
            variant={ButtonVariant.link}
            onClick={() => setupForm(realm)}
          >
            {t("common:reload")}
          </Button>
        </ActionGroup>
      </FormAccess>
    </PageSection>
  );
};
