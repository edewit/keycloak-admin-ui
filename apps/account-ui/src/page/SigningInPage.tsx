import { CSSProperties, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Button,
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Dropdown,
  DropdownItem,
  EmptyState,
  EmptyStateBody,
  KebabToggle,
  PageSection,
  Spinner,
  Split,
  SplitItem,
  Title,
} from "@patternfly/react-core";

import { useAccountClient, useFetch } from "../context/fetch";
import {
  CredentialContainer,
  CredentialMetadataRepresentation,
  CredentialRepresentation,
} from "../representations";
import useFormatDate from "../context/format-date";
import { ContinueCancelModal } from "./components/continue-cancel/ContinueCancelModel";

type MobileLinkProps = {
  title: string;
  onClick: () => void;
};

const MobileLink = ({ title, onClick }: MobileLinkProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dropdown
        isPlain
        position="right"
        toggle={<KebabToggle onToggle={setOpen} />}
        className="pf-u-display-none-on-lg"
        isOpen={open}
        dropdownItems={[
          <DropdownItem key="1" onClick={onClick}>
            {title}
          </DropdownItem>,
        ]}
      />
      <Button
        variant="link"
        onClick={onClick}
        className="pf-u-display-none pf-u-display-inline-flex-on-lg"
      >
        {title}
      </Button>
    </>
  );
};

export function SigningInPage() {
  const { t } = useTranslation();
  const format = useFormatDate();
  const accountClient = useAccountClient();
  const {
    keycloak: { login },
  } = accountClient;

  const [credentials, setCredentials] = useState<CredentialContainer[]>();

  useFetch(
    (signal) => accountClient.fetchCredentials({ signal }),
    setCredentials,
    []
  );

  const credentialRowCells = (
    credMetadata: CredentialMetadataRepresentation
  ) => {
    const credential = credMetadata.credential;
    const maxWidth = { "--pf-u-max-width--MaxWidth": "300px" } as CSSProperties;
    const items = [
      <DataListCell
        id={`cred-${credMetadata.credential.id}`}
        key="title"
        className="pf-u-max-width"
        style={maxWidth}
      >
        {credential.userLabel || t(credential.type)}
      </DataListCell>,
    ];

    if (credential.createdDate) {
      items.push(
        <DataListCell key={"created" + credential.id}>
          <Trans i18nKey="credentialCreatedAt">
            <strong className="pf-u-mr-md"></strong>
            {{ date: format(new Date(credential.createdDate)) }}
          </Trans>
        </DataListCell>
      );
    }
    return items;
  };

  const label = (credential: CredentialRepresentation) =>
    credential.userLabel || t(credential.type);

  if (!credentials) {
    return <Spinner />;
  }

  return (
    <DataList aria-label="user credential" className="pf-u-mb-xl">
      {credentials.map((container) => (
        <PageSection
          key={container.category}
          variant="light"
          className="pf-u-px-0"
        >
          <Title headingLevel="h2" size="xl">
            {t(container.category)}
          </Title>
          <Split className="pf-u-mt-lg pf-u-mb-lg">
            <SplitItem>
              <Title headingLevel="h3" size="md" className="pf-u-mb-md">
                <span className="cred-title pf-u-display-block">
                  {t(container.displayName)}
                </span>
              </Title>
              {t(container.helptext)}
            </SplitItem>
            {container.createAction && (
              <SplitItem isFilled>
                <div className="pf-u-float-right">
                  <MobileLink
                    onClick={() =>
                      login({
                        action: container.createAction,
                      })
                    }
                    title={t("setUpNew", [t(container.displayName)])}
                  />
                </div>
              </SplitItem>
            )}
          </Split>

          <DataList aria-label="credential list" className="pf-u-mb-xl">
            {container.userCredentialMetadatas.length === 0 && (
              <DataListItem>
                <DataListItemRow className="pf-u-align-items-center pf-p-b-0">
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="0" />,
                      <EmptyState key="1" variant="xs">
                        <EmptyStateBody>
                          {t("notSetUp", [t(container.displayName)])}
                        </EmptyStateBody>
                        ,
                      </EmptyState>,
                      <DataListCell key="2" />,
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            )}

            {container.userCredentialMetadatas.map((meta) => (
              <DataListItem key={meta.credential.id}>
                <DataListItemRow>
                  <DataListItemCells
                    className="pf-u-py-0"
                    dataListCells={[
                      ...credentialRowCells(meta),
                      <DataListAction
                        key="action"
                        id={`action-${meta.credential.id}`}
                        aria-label={t("updateCredAriaLabel")}
                        aria-labelledby={`cred-${meta.credential.id}`}
                      >
                        {container.removeable ? (
                          <ContinueCancelModal
                            buttonTitle="remove"
                            buttonVariant="danger"
                            modalTitle={t("removeCred", [
                              label(meta.credential),
                            ])}
                            modalMessage={t("stopUsingCred", [
                              label(meta.credential),
                            ])}
                            onContinue={() => console.log("delete")}
                          />
                        ) : (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              if (container.updateAction)
                                login({ action: container.updateAction });
                            }}
                          >
                            {t("update")}
                          </Button>
                        )}
                      </DataListAction>,
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            ))}
          </DataList>
        </PageSection>
      ))}
    </DataList>
  );
}
