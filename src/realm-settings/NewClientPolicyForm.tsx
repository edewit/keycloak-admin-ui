import React, { useState } from "react";
import {
  ActionGroup,
  AlertVariant,
  Button,
  ButtonVariant,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Divider,
  DropdownItem,
  Flex,
  FlexItem,
  FormGroup,
  PageSection,
  Text,
  TextArea,
  TextInput,
  TextVariants,
  ValidatedOptions,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { FormAccess } from "../components/form-access/FormAccess";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { Link, useHistory, useParams } from "react-router-dom";
import { useRealm } from "../context/realm-context/RealmContext";
import { useAlerts } from "../components/alert/Alerts";
import { useAdminClient, useFetch } from "../context/auth/AdminClient";
import { HelpItem } from "../components/help-enabler/HelpItem";
import { PlusCircleIcon, TrashIcon } from "@patternfly/react-icons";
import "./RealmSettingsSection.css";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import type ClientPolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientPolicyRepresentation";
import { toClientPolicies } from "./routes/ClientPolicies";
import { toNewClientPolicyCondition } from "./routes/AddCondition";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import type { EditClientPolicyParams } from "./routes/EditClientPolicy";
import { AddClientProfileModal } from "./AddClientProfileModal";
import type ClientProfileRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientProfileRepresentation";

type NewClientPolicyForm = Required<ClientPolicyRepresentation>;

const defaultValues: NewClientPolicyForm = {
  name: "",
  description: "",
  conditions: [],
  enabled: true,
  profiles: [],
};

type PolicyDetailAttributes = {
  idx: number;
  name: string;
};

export default function NewClientPolicyForm() {
  const { t } = useTranslation("realm-settings");
  const { errors, reset: resetForm } = useForm<NewClientPolicyForm>({
    defaultValues,
  });
  const { realm } = useRealm();
  const { addAlert, addError } = useAlerts();
  const adminClient = useAdminClient();
  const [policies, setPolicies] = useState<ClientPolicyRepresentation[]>([]);
  const [clientProfiles, setClientProfiles] = useState<
    ClientProfileRepresentation[]
  >([]);

  const [currentPolicy, setCurrentPolicy] =
    useState<ClientPolicyRepresentation>();
  const [
    showAddConditionsAndProfilesForm,
    setShowAddConditionsAndProfilesForm,
  ] = useState(false);

  const [conditionToDelete, setConditionToDelete] =
    useState<PolicyDetailAttributes>();

  const [profilesModalOpen, setProfilesModalOpen] = useState(false);

  const [profileToDelete, setProfileToDelete] =
    useState<PolicyDetailAttributes>();

  const { policyName } = useParams<EditClientPolicyParams>();

  const history = useHistory();
  const form = useForm<ClientPolicyRepresentation>({ mode: "onChange" });
  const { handleSubmit } = form;

  const [key, setKey] = useState(0);
  const refresh = () => setKey(new Date().getTime());

  useFetch(
    async () => {
      const [policies, profiles] = await Promise.all([
        adminClient.clientPolicies.listPolicies(),
        adminClient.clientPolicies.listProfiles({
          includeGlobalProfiles: true,
        }),
      ]);

      return { policies, profiles };
    },
    ({ policies, profiles }) => {
      const currentPolicy = policies.policies?.find(
        (item) => item.name === policyName
      );

      const allClientProfiles = [
        ...(profiles.globalProfiles ?? []),
        ...(profiles.profiles ?? []),
      ];

      setPolicies(policies.policies ?? []);
      if (currentPolicy) {
        setupForm(currentPolicy);
        setClientProfiles(allClientProfiles);
        setCurrentPolicy(currentPolicy);
        setShowAddConditionsAndProfilesForm(true);
      }
    },
    [key]
  );

  const setupForm = (policy: ClientPolicyRepresentation) => {
    resetForm();
    Object.entries(policy).map(([key, value]) => {
      form.setValue(key, value);
    });
  };

  const policy = policies.filter((policy) => policy.name === policyName);
  const policyConditions = policy[0]?.conditions || [];
  const policyProfiles = policy[0]?.profiles || [];

  const serverInfo = useServerInfo();

  const conditionTypes =
    serverInfo.componentTypes?.[
      "org.keycloak.services.clientpolicy.condition.ClientPolicyConditionProvider"
    ];

  const formValues = form.getValues();

  const save = async () => {
    const createdForm = formValues;
    const createdPolicy = {
      ...createdForm,
      profiles: [],
      conditions: [],
    };

    const policyNameExists = policies.find(
      (policy) => policy.name === createdPolicy.name
    );

    const res = policies.map((policy) =>
      policy.name === createdPolicy.name ? createdPolicy : policy
    );

    const allPolicies = policyNameExists ? res : policies.concat(createdForm);

    try {
      await adminClient.clientPolicies.updatePolicy({
        policies: allPolicies,
      });
      addAlert(
        t("realm-settings:createClientPolicySuccess"),
        AlertVariant.success
      );
      history.push(
        `/${realm}/realm-settings/clientPolicies/${formValues.name}/edit-policy`
      );
      setShowAddConditionsAndProfilesForm(true);
      refresh();
    } catch (error) {
      addError("realm-settings:createClientPolicyError", error);
    }
  };

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: t("deleteClientPolicyConfirmTitle"),
    messageKey: t("deleteClientPolicyConfirm", {
      policyName: policyName,
    }),
    continueButtonLabel: t("delete"),
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      const updatedPolicies = policies.filter(
        (policy) => policy.name !== policyName
      );

      try {
        await adminClient.clientPolicies.updatePolicy({
          policies: updatedPolicies,
        });
        addAlert(t("deleteClientPolicySuccess"), AlertVariant.success);
        history.push(toClientPolicies({ realm }));
      } catch (error) {
        addError(t("deleteClientPolicyError"), error);
      }
    },
  });

  const [toggleDeleteConditionDialog, DeleteConditionConfirm] =
    useConfirmDialog({
      titleKey: t("deleteClientPolicyConditionConfirmTitle"),
      messageKey: t("deleteClientPolicyConditionConfirm", {
        condition: conditionToDelete?.name,
      }),
      continueButtonLabel: t("delete"),
      continueButtonVariant: ButtonVariant.danger,
      onConfirm: async () => {
        if (conditionToDelete?.name) {
          currentPolicy?.conditions?.splice(conditionToDelete.idx!, 1);
          try {
            await adminClient.clientPolicies.updatePolicy({
              policies: policies,
            });
            addAlert(t("deleteConditionSuccess"), AlertVariant.success);
            history.push(
              `/${realm}/realm-settings/clientPolicies/${formValues.name}/edit-policy`
            );
            refresh();
          } catch (error) {
            addError(t("deleteConditionError"), error);
          }
        } else {
          const updatedPolicies = policies.filter(
            (policy) => policy.name !== policyName
          );

          try {
            await adminClient.clientPolicies.updatePolicy({
              policies: updatedPolicies,
            });
            addAlert(t("deleteClientSuccess"), AlertVariant.success);
            history.push(toClientPolicies({ realm }));
          } catch (error) {
            addError(t("deleteClientError"), error);
          }
        }
      },
    });

  const [toggleDeleteProfileDialog, DeleteProfileConfirm] = useConfirmDialog({
    titleKey: t("deleteClientPolicyProfileConfirmTitle"),
    messageKey: t("deleteClientPolicyProfileConfirm", {
      profileName: profileToDelete?.name,
      policyName,
    }),
    continueButtonLabel: t("delete"),
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      if (profileToDelete?.name) {
        currentPolicy?.profiles?.splice(profileToDelete.idx!, 1);
        try {
          await adminClient.clientPolicies.updatePolicy({
            policies: policies,
          });
          addAlert(t("deleteClientPolicyProfileSuccess"), AlertVariant.success);
          history.push(
            `/${realm}/realm-settings/clientPolicies/${formValues.name}/edit-policy`
          );
        } catch (error) {
          addError(t("deleteClientPolicyProfileError"), error);
        }
      } else {
        const updatedPolicies = policies.filter(
          (policy) => policy.name !== policyName
        );

        try {
          await adminClient.clientPolicies.updatePolicy({
            policies: updatedPolicies,
          });
          addAlert(t("deleteClientSuccess"), AlertVariant.success);
          history.push(toClientPolicies({ realm }));
        } catch (error) {
          addError(t("deleteClientError"), error);
        }
      }
    },
  });

  const reset = () => {
    form.setValue("name", currentPolicy?.name);
    form.setValue("description", currentPolicy?.description);
  };

  const toggleModal = () => {
    setProfilesModalOpen(!profilesModalOpen);
  };

  const addProfiles = async (profiles: string[]) => {
    const createdPolicy = {
      ...currentPolicy,
      profiles: (currentPolicy?.profiles ?? []).concat(profiles),
      conditions: currentPolicy?.conditions,
    };

    const index = policies.findIndex(
      (policy) => createdPolicy.name === policy.name
    );

    if (index === -1) {
      return;
    }

    const newPolicies = [
      ...policies.slice(0, index),
      createdPolicy,
      ...policies.slice(index + 1),
    ];

    try {
      await adminClient.clientPolicies.updatePolicy({
        policies: newPolicies,
      });
      setPolicies(newPolicies);
      history.push(
        `/${realm}/realm-settings/clientPolicies/${formValues.name}/edit-policy`
      );
      addAlert(
        t("realm-settings:addClientProfileSuccess"),
        AlertVariant.success
      );
      refresh();
    } catch (error) {
      addError("realm-settings:addClientProfileError", error);
    }
  };

  console.log("NY", policyConditions);

  return (
    <>
      <DeleteConfirm />
      <DeleteConditionConfirm />
      <DeleteProfileConfirm />
      <AddClientProfileModal
        onConfirm={(profiles: ClientProfileRepresentation[]) => {
          addProfiles(profiles.map((item) => item.name!));
        }}
        allProfiles={policyProfiles}
        open={profilesModalOpen}
        toggleDialog={toggleModal}
      />
      <ViewHeader
        titleKey={
          showAddConditionsAndProfilesForm || policyName
            ? policyName!
            : t("createPolicy")
        }
        divider
        dropdownItems={
          showAddConditionsAndProfilesForm || policyName
            ? [
                <DropdownItem
                  key="delete"
                  value="delete"
                  onClick={() => {
                    toggleDeleteDialog();
                  }}
                  data-testid="deleteClientPolicyDropdown"
                >
                  {t("deleteClientPolicy")}
                </DropdownItem>,
              ]
            : undefined
        }
      />
      <PageSection variant="light">
        <FormAccess
          onSubmit={handleSubmit(save)}
          isHorizontal
          role="view-realm"
          className="pf-u-mt-lg"
        >
          <FormGroup
            label={t("common:name")}
            fieldId="kc-name"
            isRequired
            helperTextInvalid={t("common:required")}
            validated={
              errors.name ? ValidatedOptions.error : ValidatedOptions.default
            }
          >
            <TextInput
              ref={form.register({ required: true })}
              type="text"
              id="kc-client-profile-name"
              name="name"
              data-testid="client-policy-name"
            />
          </FormGroup>
          <FormGroup label={t("common:description")} fieldId="kc-description">
            <TextArea
              name="description"
              aria-label={t("description")}
              ref={form.register()}
              type="text"
              id="kc-client-policy-description"
              data-testid="client-policy-description"
            />
          </FormGroup>
          <ActionGroup>
            <Button
              variant="primary"
              type="submit"
              data-testid="saveCreatePolicy"
              isDisabled={!formValues.name}
            >
              {t("common:save")}
            </Button>
            <Button
              id="cancelCreatePolicy"
              variant="secondary"
              onClick={() =>
                showAddConditionsAndProfilesForm || policyName
                  ? reset()
                  : history.push(toClientPolicies({ realm }))
              }
              data-testid="cancelCreatePolicy"
            >
              {showAddConditionsAndProfilesForm
                ? t("common:revert")
                : t("common:cancel")}
            </Button>
          </ActionGroup>
          {(showAddConditionsAndProfilesForm || form.formState.isSubmitted) && (
            <>
              <Flex>
                <FlexItem>
                  <Text className="kc-conditions" component={TextVariants.h1}>
                    {t("conditions")}
                    <HelpItem
                      helpText={t("realm-settings-help:conditions")}
                      forLabel={t("conditionsHelpItem")}
                      forID={t("conditions")}
                    />
                  </Text>
                </FlexItem>
                <FlexItem align={{ default: "alignRight" }}>
                  <Button
                    id="addCondition"
                    component={(props) => (
                      <Link
                        {...props}
                        to={toNewClientPolicyCondition({
                          realm,
                          policyName: formValues.name!,
                        })}
                      ></Link>
                    )}
                    variant="link"
                    className="kc-addCondition"
                    data-testid="cancelCreateProfile"
                    icon={<PlusCircleIcon />}
                  >
                    {t("realm-settings:addCondition")}
                  </Button>
                </FlexItem>
              </Flex>
              {policyConditions.length > 0 ? (
                <DataList aria-label={t("conditions")} isCompact>
                  {policyConditions.map((condition, idx) => (
                    <DataListItem
                      aria-labelledby="conditions-list-item"
                      key={`list-item-${idx}`}
                      id={condition.condition}
                      data-testid="conditions-list-item"
                    >
                      <DataListItemRow data-testid="conditions-list-row">
                        <DataListItemCells
                          dataListCells={[
                            <DataListCell
                              key={`name-${idx}`}
                              data-testid="condition-type"
                            >
                              {Object.keys(condition.configuration!).length !==
                              0 ? (
                                <Link
                                  key={condition.condition}
                                  data-testid="condition-type-link"
                                  to={""}
                                  className="kc-condition-link"
                                >
                                  {condition.condition}
                                </Link>
                              ) : (
                                condition.condition
                              )}
                              {conditionTypes?.map(
                                (type) =>
                                  type.id === condition.condition && (
                                    <>
                                      <HelpItem
                                        helpText={type.helpText}
                                        forLabel={t("conditionTypeHelpText")}
                                        forID={t(`common:helpLabel`, {
                                          label: t("conditionTypeHelpText"),
                                        })}
                                      />
                                      <Button
                                        variant="link"
                                        isInline
                                        icon={
                                          <TrashIcon
                                            className="kc-conditionType-trash-icon"
                                            data-testid="deleteClientProfileDropdown"
                                            onClick={() => {
                                              toggleDeleteConditionDialog();
                                              setConditionToDelete({
                                                idx: idx,
                                                name: type.id!,
                                              });
                                            }}
                                          />
                                        }
                                      ></Button>
                                    </>
                                  )
                              )}
                            </DataListCell>,
                          ]}
                        />
                      </DataListItemRow>
                    </DataListItem>
                  ))}
                </DataList>
              ) : (
                <>
                  <Divider />
                  <Text
                    className="kc-emptyConditions"
                    component={TextVariants.h6}
                  >
                    {t("realm-settings:emptyConditions")}
                  </Text>
                </>
              )}
            </>
          )}
          {(showAddConditionsAndProfilesForm || form.formState.isSubmitted) && (
            <>
              <Flex>
                <FlexItem>
                  <Text
                    className="kc-client-profiles"
                    component={TextVariants.h1}
                  >
                    {t("clientProfiles")}
                    <HelpItem
                      helpText={t("realm-settings-help:clientProfiles")}
                      forLabel={t("clientProfilesHelpItem")}
                      forID={t("clientProfiles")}
                    />
                  </Text>
                </FlexItem>
                <FlexItem align={{ default: "alignRight" }}>
                  <Button
                    id="addClientProfile"
                    variant="link"
                    className="kc-addClientProfile"
                    data-testid="cancelCreateProfile"
                    icon={<PlusCircleIcon />}
                    onClick={toggleModal}
                  >
                    {t("realm-settings:addClientProfile")}
                  </Button>
                </FlexItem>
              </Flex>
              {policyProfiles.length > 0 ? (
                <DataList aria-label={t("profiles")} isCompact>
                  {policyProfiles.map((profile, idx) => (
                    <DataListItem
                      aria-labelledby={`${profile}-profile-list-item`}
                      key={profile}
                      id={`${profile}-profile-list-item`}
                      data-testid={"profile-list-item"}
                    >
                      <DataListItemRow data-testid="profile-list-row">
                        <DataListItemCells
                          dataListCells={[
                            <DataListCell key="name" data-testid="profile-name">
                              {profile && (
                                <Link
                                  key={profile}
                                  data-testid="profile-name-link"
                                  to={""}
                                  className="kc-profile-link"
                                >
                                  {profile}
                                </Link>
                              )}
                              {policyProfiles
                                .filter((type) => type === profile)
                                .map((type) => (
                                  <>
                                    <HelpItem
                                      helpText={
                                        clientProfiles.find(
                                          (profile) => type === profile.name
                                        )?.description
                                      }
                                      forLabel={profile}
                                      forID={t(`common:helpLabel`, {
                                        label: profile,
                                      })}
                                    />
                                    <Button
                                      variant="link"
                                      isInline
                                      icon={
                                        <TrashIcon
                                          className="kc-conditionType-trash-icon"
                                          data-testid="deleteClientProfileDropdown"
                                          onClick={() => {
                                            toggleDeleteProfileDialog();
                                            setProfileToDelete({
                                              idx: idx,
                                              name: type!,
                                            });
                                          }}
                                        />
                                      }
                                    ></Button>
                                  </>
                                ))}
                            </DataListCell>,
                          ]}
                        />
                      </DataListItemRow>
                    </DataListItem>
                  ))}
                </DataList>
              ) : (
                <>
                  <Divider />
                  <Text
                    className="kc-emptyClientProfiles"
                    component={TextVariants.h6}
                  >
                    {t("realm-settings:emptyProfiles")}
                  </Text>
                </>
              )}
            </>
          )}
        </FormAccess>
      </PageSection>
    </>
  );
}
