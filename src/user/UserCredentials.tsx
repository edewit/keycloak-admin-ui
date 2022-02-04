import React, { Fragment, useMemo, useState } from "react";
import {
  AlertVariant,
  Button,
  ButtonVariant,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  FormGroup,
  KebabToggle,
  TextInput,
} from "@patternfly/react-core";
import { TableComposable, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { PencilAltIcon, CheckIcon, TimesIcon } from "@patternfly/react-icons";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useTranslation } from "react-i18next";
import { useAlerts } from "../components/alert/Alerts";
import { ListEmptyState } from "../components/list-empty-state/ListEmptyState";
import { useAdminClient, useFetch } from "../context/auth/AdminClient";
import { useWhoAmI } from "../context/whoami/WhoAmI";
import { useForm } from "react-hook-form";
import { HelpItem } from "../components/help-enabler/HelpItem";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import type CredentialRepresentation from "@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation";
import { FormAccess } from "../components/form-access/FormAccess";
import { CredentialDataDialog } from "./user-credentials/CredentialDataDialog";
import { ResetPasswordDialog } from "./user-credentials/ResetPasswordDialog";
import { ResetCredentialDialog } from "./user-credentials/ResetCredentialDialog";

import "./user-credentials.css";

type UserCredentialsProps = {
  user: UserRepresentation;
};

type UserLabelForm = {
  userLabel: string;
};

const userLabelDefaultValues: UserLabelForm = {
  userLabel: "",
};

type ExpandableCredentialRepresentation = {
  key: string;
  value: CredentialRepresentation[];
  isExpanded: boolean;
};

export const UserCredentials = ({ user }: UserCredentialsProps) => {
  const { t } = useTranslation("users");
  const { whoAmI } = useWhoAmI();
  const { addAlert, addError } = useAlerts();
  const [key, setKey] = useState(0);
  const refresh = () => setKey(key + 1);
  const [isOpen, setIsOpen] = useState(false);
  const [openCredentialReset, setOpenCredentialReset] = useState(false);
  const [kebabOpen, setKebabOpen] = useState({
    status: false,
    rowKey: "",
  });
  const adminClient = useAdminClient();
  const userLabelForm = useForm<UserLabelForm>({
    defaultValues: userLabelDefaultValues,
  });
  const {
    getValues: getValues1,
    handleSubmit: handleSubmit1,
    register: register1,
  } = userLabelForm;
  const [userCredentials, setUserCredentials] = useState<
    CredentialRepresentation[]
  >([]);
  const [groupedUserCredentials, setGroupedUserCredentials] = useState<
    ExpandableCredentialRepresentation[]
  >([]);
  const [selectedCredential, setSelectedCredential] =
    useState<CredentialRepresentation>({});
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showData, setShowData] = useState(false);
  const [editedUserCredential, setEditedUserCredential] =
    useState<CredentialRepresentation>({});
  const [isUserLabelEdit, setIsUserLabelEdit] = useState<{
    status: boolean;
    rowKey: string;
  }>();

  useFetch(
    () => adminClient.users.getCredentials({ id: user.id! }),
    (credentials) => {
      setUserCredentials(credentials);

      const groupedCredentials = credentials.reduce((r, a) => {
        r[a.type!] = r[a.type!] || [];
        r[a.type!].push(a);
        return r;
      }, Object.create(null));

      const groupedCredentialsArray = Object.keys(groupedCredentials).map(
        (key) => ({ key, value: groupedCredentials[key] })
      );

      setGroupedUserCredentials(
        groupedCredentialsArray.map((groupedCredential) => ({
          ...groupedCredential,
          isExpanded: false,
        }))
      );
    },
    [key]
  );

  const passwordTypeFinder = userCredentials.find(
    (credential) => credential.type === "password"
  );

  const toggleModal = () => setIsOpen(!isOpen);

  const toggleCredentialsResetModal = () => {
    setOpenCredentialReset(!openCredentialReset);
  };

  const resetPassword = () => {
    setIsResetPassword(true);
    toggleModal();
  };

  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: t("deleteCredentialsConfirmTitle"),
    messageKey: t("deleteCredentialsConfirm"),
    continueButtonLabel: t("common:delete"),
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      try {
        await adminClient.users.deleteCredential({
          id: user.id!,
          credentialId: selectedCredential.id!,
        });
        addAlert(t("deleteCredentialsSuccess"), AlertVariant.success);
        setKey((key) => key + 1);
      } catch (error) {
        addError("users:deleteCredentialsError", error);
      }
    },
  });

  const rows = useMemo(() => {
    if (!selectedCredential.credentialData) {
      return [];
    }

    const credentialData = JSON.parse(selectedCredential.credentialData);
    const locale = whoAmI.getLocale();

    return Object.entries(credentialData)
      .sort(([a], [b]) => a.localeCompare(b, locale))
      .map<[string, string]>(([key, value]) => {
        if (typeof value === "string") {
          return [key, value];
        }

        return [key, JSON.stringify(value)];
      });
  }, [selectedCredential.credentialData]);

  const saveUserLabel = async () => {
    const credentialToEdit = userCredentials.find(
      (credential) => credential.id === editedUserCredential.id
    );

    const userLabelFormValue = getValues1();

    if (!credentialToEdit) {
      return;
    }

    try {
      await adminClient.users.updateCredentialLabel(
        {
          id: user.id!,
          credentialId: credentialToEdit.id!,
        },
        userLabelFormValue.userLabel || ""
      );
      refresh();
      addAlert(t("updateCredentialUserLabelSuccess"), AlertVariant.success);
      setEditedUserCredential({});
    } catch (error) {
      addError("users:updateCredentialUserLabelError", error);
    }

    setIsUserLabelEdit({
      status: false,
      rowKey: credentialToEdit.id!,
    });
  };

  return (
    <>
      {isOpen && (
        <ResetPasswordDialog
          user={user}
          isResetPassword={isResetPassword}
          onClose={() => setIsOpen(false)}
        />
      )}
      {openCredentialReset && (
        <ResetCredentialDialog
          userId={user.id!}
          onClose={() => setOpenCredentialReset(false)}
        />
      )}
      <DeleteConfirm />
      {showData && Object.keys(selectedCredential).length !== 0 && (
        <CredentialDataDialog
          credentialData={rows}
          onClose={() => {
            setShowData(false);
            setSelectedCredential({});
          }}
        />
      )}
      {userCredentials.length !== 0 && passwordTypeFinder === undefined && (
        <>
          <Button
            key={`confirmSaveBtn-table-${user.id}`}
            className="kc-setPasswordBtn-tbl"
            data-testid="setPasswordBtn-table"
            variant="primary"
            form="userCredentials-form"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            {t("savePassword")}
          </Button>
          <Divider />
        </>
      )}
      {groupedUserCredentials.length !== 0 ? (
        <>
          {user.email && (
            <Button
              className="resetCredentialBtn-header"
              variant="primary"
              data-testid="credentialResetBtn"
              onClick={() => setOpenCredentialReset(true)}
            >
              {t("credentialResetBtn")}
            </Button>
          )}
          <TableComposable aria-label="password-data-table" variant={"compact"}>
            <Thead>
              <Tr>
                <Th>
                  <HelpItem
                    helpText="users:userCredentialsHelpText"
                    fieldLabelId="users:userCredentialsHelpTextLabel"
                  />
                </Th>
                <Th>{t("type")}</Th>
                <Th>{t("userLabel")}</Th>
                <Th>{t("data")}</Th>
                <Th />
                <Th />
              </Tr>
            </Thead>
            {groupedUserCredentials.map((groupedCredential, rowIndex) => (
              <Fragment key={`table-${groupedCredential.key}`}>
                <Tr>
                  {groupedCredential.value.length > 1 ? (
                    <Td
                      className="kc-expandRow-btn"
                      expand={{
                        rowIndex,
                        isExpanded: groupedCredential.isExpanded,
                        onToggle: (_, rowIndex) => {
                          const rows = groupedUserCredentials.map(
                            (credential, index) =>
                              index === rowIndex
                                ? {
                                    ...credential,
                                    isExpanded: !credential.isExpanded,
                                  }
                                : credential
                          );
                          setGroupedUserCredentials(rows);
                        },
                      }}
                    />
                  ) : (
                    <Td />
                  )}
                  <Td
                    key={`table-item-${groupedCredential.key}`}
                    dataLabel={`columns-${groupedCredential.key}`}
                    className="kc-notExpandableRow-credentialType"
                  >
                    {groupedCredential.key.charAt(0).toUpperCase()! +
                      groupedCredential.key.slice(1)}
                  </Td>
                  {groupedCredential.value.length <= 1 &&
                    groupedCredential.value.map((credential) => (
                      <>
                        <Td>
                          <FormAccess
                            isHorizontal
                            role="view-users"
                            className="kc-form-userLabel"
                          >
                            <FormGroup
                              fieldId="kc-userLabel"
                              className="kc-userLabel-row"
                            >
                              <div className="kc-form-group-userLabel">
                                {isUserLabelEdit?.status &&
                                isUserLabelEdit.rowKey === credential.id ? (
                                  <>
                                    <TextInput
                                      name="userLabel"
                                      ref={register1()}
                                      type="text"
                                      className="kc-userLabel"
                                      aria-label={t("userLabel")}
                                      data-testid="user-label-fld"
                                    />
                                    <div className="kc-userLabel-actionBtns">
                                      <Button
                                        key={`editUserLabel-accept-${credential.id}`}
                                        variant="link"
                                        className="kc-editUserLabel-acceptBtn"
                                        onClick={() => {
                                          handleSubmit1(saveUserLabel)();
                                          setIsUserLabelEdit({
                                            status: false,
                                            rowKey: credential.id!,
                                          });
                                        }}
                                        data-testid="editUserLabel-acceptBtn"
                                        icon={<CheckIcon />}
                                      />
                                      <Button
                                        key={`editUserLabel-cancel-${credential.id}`}
                                        variant="link"
                                        className="kc-editUserLabel-cancelBtn"
                                        onClick={() =>
                                          setIsUserLabelEdit({
                                            status: false,
                                            rowKey: credential.id!,
                                          })
                                        }
                                        data-testid="editUserLabel-cancelBtn"
                                        icon={<TimesIcon />}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {credential.userLabel ?? ""}
                                    <Button
                                      key={`editUserLabel-${credential.id}`}
                                      variant="link"
                                      className="kc-editUserLabel-btn"
                                      onClick={() => {
                                        setEditedUserCredential(credential);
                                        setIsUserLabelEdit({
                                          status: true,
                                          rowKey: credential.id!,
                                        });
                                      }}
                                      data-testid="editUserLabelBtn"
                                      icon={<PencilAltIcon />}
                                    />
                                  </>
                                )}
                              </div>
                            </FormGroup>
                          </FormAccess>
                        </Td>
                        <Td>
                          <Button
                            className="kc-showData-btn"
                            variant="link"
                            data-testid="showDataBtn"
                            onClick={() => {
                              setShowData(true);
                              setSelectedCredential(credential);
                            }}
                          >
                            {t("showDataBtn")}
                          </Button>
                        </Td>
                        {credential.type === "password" ? (
                          <Td>
                            <Button
                              variant="secondary"
                              data-testid="resetPasswordBtn"
                              onClick={resetPassword}
                            >
                              {t("resetPasswordBtn")}
                            </Button>
                          </Td>
                        ) : (
                          <Td />
                        )}
                        <Td>
                          <Dropdown
                            isPlain
                            position={DropdownPosition.right}
                            toggle={
                              <KebabToggle
                                onToggle={(status) =>
                                  setKebabOpen({
                                    status,
                                    rowKey: credential.id!,
                                  })
                                }
                              />
                            }
                            isOpen={
                              kebabOpen.status &&
                              kebabOpen.rowKey === credential.id
                            }
                            onSelect={() => {
                              setSelectedCredential(credential);
                            }}
                            dropdownItems={[
                              <DropdownItem
                                key={`delete-dropdown-item-${credential.id}`}
                                data-testid="deleteDropdownItem"
                                component="button"
                                onClick={() => {
                                  toggleDeleteDialog();
                                  setKebabOpen({
                                    status: false,
                                    rowKey: credential.id!,
                                  });
                                }}
                              >
                                {t("deleteBtn")}
                              </DropdownItem>,
                            ]}
                          />
                        </Td>
                      </>
                    ))}
                </Tr>
                {groupedCredential.isExpanded &&
                  groupedCredential.value.map((credential) => (
                    <Tr key={`child-key-${credential.id}`}>
                      <Td />
                      <Td
                        key={`child-item-${credential.id}`}
                        dataLabel={`child-columns-${credential.id}`}
                        className="kc-expandableRow-credentialType"
                      >
                        {credential.type!.charAt(0).toUpperCase()! +
                          credential.type!.slice(1)}
                      </Td>
                      <Td>
                        <FormAccess
                          isHorizontal
                          role="view-users"
                          className="kc-form-userLabel"
                        >
                          <FormGroup
                            fieldId="kc-userLabel"
                            className="kc-userLabel-row"
                          >
                            <div className="kc-form-group-userLabel">
                              {isUserLabelEdit?.status &&
                              isUserLabelEdit.rowKey === credential.id ? (
                                <>
                                  <TextInput
                                    name="userLabel"
                                    ref={register1()}
                                    type="text"
                                    className="kc-userLabel"
                                    aria-label={t("userLabel")}
                                    data-testid="user-label-fld"
                                  />
                                  <div className="kc-userLabel-actionBtns">
                                    <Button
                                      key={`editUserLabel-accept-${credential.id}`}
                                      variant="link"
                                      className="kc-editUserLabel-acceptBtn"
                                      onClick={() => {
                                        handleSubmit1(saveUserLabel)();
                                        setIsUserLabelEdit({
                                          status: false,
                                          rowKey: credential.id!,
                                        });
                                      }}
                                      data-testid="editUserLabel-acceptBtn"
                                      icon={<CheckIcon />}
                                    />
                                    <Button
                                      key={`editUserLabel-cancel-${credential.id}`}
                                      variant="link"
                                      className="kc-editUserLabel-cancelBtn"
                                      onClick={() =>
                                        setIsUserLabelEdit({
                                          status: false,
                                          rowKey: credential.id!,
                                        })
                                      }
                                      data-testid="editUserLabel-cancelBtn"
                                      icon={<TimesIcon />}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  {credential.userLabel ?? ""}
                                  <Button
                                    key={`editUserLabel-${credential.id}`}
                                    variant="link"
                                    className="kc-editUserLabel-btn"
                                    onClick={() => {
                                      setEditedUserCredential(credential);
                                      setIsUserLabelEdit({
                                        status: true,
                                        rowKey: credential.id!,
                                      });
                                    }}
                                    data-testid="editUserLabelBtn"
                                    icon={<PencilAltIcon />}
                                  />
                                </>
                              )}
                            </div>
                          </FormGroup>
                        </FormAccess>
                      </Td>
                      <Td>
                        <Button
                          className="kc-showData-btn"
                          variant="link"
                          data-testid="showDataBtn"
                          onClick={() => {
                            setShowData(true);
                            setSelectedCredential(credential);
                          }}
                        >
                          {t("showDataBtn")}
                        </Button>
                      </Td>
                      <Td />
                      <Td>
                        <Dropdown
                          isPlain
                          position={DropdownPosition.right}
                          toggle={
                            <KebabToggle
                              onToggle={(status) =>
                                setKebabOpen({
                                  status,
                                  rowKey: credential.id!,
                                })
                              }
                            />
                          }
                          isOpen={
                            kebabOpen.status &&
                            kebabOpen.rowKey === credential.id
                          }
                          onSelect={() => {
                            setSelectedCredential(credential);
                          }}
                          dropdownItems={[
                            <DropdownItem
                              key={`delete-dropdown-item-${credential.id}`}
                              data-testid="deleteDropdownItem"
                              component="button"
                              onClick={() => {
                                toggleDeleteDialog();
                                setKebabOpen({
                                  status: false,
                                  rowKey: credential.id!,
                                });
                              }}
                            >
                              {t("deleteBtn")}
                            </DropdownItem>,
                          ]}
                        />
                      </Td>
                    </Tr>
                  ))}
              </Fragment>
            ))}
          </TableComposable>
        </>
      ) : (
        <ListEmptyState
          hasIcon={true}
          message={t("noCredentials")}
          instructions={t("noCredentialsText")}
          primaryActionText={t("setPassword")}
          onPrimaryAction={toggleModal}
          secondaryActions={
            user.email
              ? [
                  {
                    text: t("credentialResetBtn"),
                    onClick: toggleCredentialsResetModal,
                    type: ButtonVariant.link,
                  },
                ]
              : undefined
          }
        />
      )}
    </>
  );
};
