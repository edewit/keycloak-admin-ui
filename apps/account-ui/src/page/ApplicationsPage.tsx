import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DataList,
  DataListItem,
  DataListItemRow,
  DataListToggle,
  DataListItemCells,
  DataListCell,
  Button,
  DataListContent,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Grid,
  GridItem,
  Spinner,
} from "@patternfly/react-core";
import {
  ExternalLinkAltIcon,
  CheckIcon,
  InfoAltIcon,
} from "@patternfly/react-icons";

import { useAccountClient, useFetch } from "../context/fetch";
import { ClientRepresentation } from "../representations";
import { ContinueCancelModal } from "./components/continue-cancel/ContinueCancelModel";
import { useAlerts } from "../context/alerts";

type Application = ClientRepresentation & {
  open: boolean;
};

export function ApplicationsPage() {
  const { t } = useTranslation();
  const accountClient = useAccountClient();
  const { addAlert, addError } = useAlerts();

  const [applications, setApplications] = useState<Application[]>();
  const [key, setKey] = useState(1);
  const refresh = () => setKey(key + 1);

  useFetch(
    (signal) => accountClient.fetchApplications({ signal }),
    (clients) => setApplications(clients.map((c) => ({ ...c, open: false }))),
    [key]
  );

  const toggleOpen = (clientId: string) => {
    setApplications([
      ...applications!.map((a) =>
        a.clientId === clientId ? { ...a, open: !a.open } : a
      ),
    ]);
  };

  const removeConsent = async (id: string) => {
    try {
      await accountClient.deleteConcent(id);
      refresh();
      addAlert("removeConsentSuccess");
    } catch (error) {
      addError("removeConsentError", error);
    }
  };

  if (!applications) {
    return <Spinner />;
  }

  return (
    <DataList id="applications-list" aria-label={t("applicationsPageTitle")}>
      <DataListItem
        id="applications-list-header"
        aria-labelledby="Columns names"
      >
        <DataListItemRow>
          <span style={{ visibility: "hidden", height: 55 }}>
            <DataListToggle
              id="applications-list-header-invisible-toggle"
              aria-controls="hidden"
            />
          </span>
          <DataListItemCells
            dataListCells={[
              <DataListCell
                key="applications-list-client-id-header"
                width={2}
                className="pf-u-pt-md"
              >
                <strong>{t("applicationName")}</strong>
              </DataListCell>,
              <DataListCell
                key="applications-list-app-type-header"
                width={2}
                className="pf-u-pt-md"
              >
                <strong>{t("applicationType")}</strong>
              </DataListCell>,
              <DataListCell
                key="applications-list-status"
                width={2}
                className="pf-u-pt-md"
              >
                <strong>{t("status")}</strong>
              </DataListCell>,
            ]}
          />
        </DataListItemRow>
      </DataListItem>
      {applications.map((application) => (
        <DataListItem
          key={application.clientId}
          aria-labelledby="applications-list"
          isExpanded={application.open}
        >
          <DataListItemRow className="pf-u-align-items-center">
            <DataListToggle
              onClick={() => toggleOpen(application.clientId)}
              isExpanded={application.open}
              id={`toggle-${application.clientId}`}
            />
            <DataListItemCells
              className="pf-u-align-items-center"
              dataListCells={[
                <DataListCell width={2} key={`client${application.clientId}`}>
                  <Button
                    className="pf-u-pl-0 title-case"
                    component="a"
                    variant="link"
                    onClick={() => window.open(application.effectiveUrl)}
                  >
                    {application.clientName || application.clientId}{" "}
                    <ExternalLinkAltIcon />
                  </Button>
                </DataListCell>,
                <DataListCell width={2} key={`internal${application.clientId}`}>
                  {application.userConsentRequired
                    ? t("thirdPartyApp")
                    : t("internalApp")}
                  {application.offlineAccess ? ", " + t("offlineAccess") : ""}
                </DataListCell>,
                <DataListCell width={2} key={`status${application.clientId}`}>
                  {application.inUse ? t("inUse") : t("notInUse")}
                </DataListCell>,
              ]}
            />
          </DataListItemRow>

          <DataListContent
            className="pf-u-pl-4xl"
            aria-label={t("applicationDetails")}
            isHidden={!application.open}
          >
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>{t("client")}</DescriptionListTerm>
                <DescriptionListDescription>
                  {application.clientId}
                </DescriptionListDescription>
              </DescriptionListGroup>
              {application.description && (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t("description")}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {application.description}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {application.effectiveUrl && (
                <DescriptionListGroup>
                  <DescriptionListTerm>URL</DescriptionListTerm>
                  <DescriptionListDescription>
                    {application.effectiveUrl.split('"')}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {application.consent && (
                <>
                  <DescriptionListGroup>
                    <DescriptionListTerm>Has access to</DescriptionListTerm>
                    {application.consent.grantedScopes.map((scope) => (
                      <DescriptionListDescription key={`scope${scope.id}`}>
                        <CheckIcon /> {t(scope.name)}
                      </DescriptionListDescription>
                    ))}
                  </DescriptionListGroup>
                  {application.tosUri && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>
                        {t("termsOfService")}
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        {application.tosUri}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                  {application.policyUri && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t("policy")}</DescriptionListTerm>
                      <DescriptionListDescription>
                        {application.policyUri}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                  {application.logoUri && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t("logo")}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <img src={application.logoUri} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                  <DescriptionListGroup>
                    <DescriptionListTerm>
                      {t("accessGrantedOn") + ": "}
                    </DescriptionListTerm>
                    <DescriptionListDescription>
                      {new Intl.DateTimeFormat("en", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                      }).format(application.consent.createdDate)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </>
              )}
            </DescriptionList>
            {(application.consent || application.offlineAccess) && (
              <Grid hasGutter>
                <hr />
                <GridItem>
                  <ContinueCancelModal
                    buttonTitle="removeButton"
                    buttonVariant="secondary"
                    modalTitle="removeModalTitle"
                    modalMessage={t("removeModalMessage", [
                      application.clientId,
                    ])}
                    continueLabel="confirmButton"
                    onContinue={() => removeConsent(application.clientId)} // required
                  />
                </GridItem>
                <GridItem>
                  <InfoAltIcon /> {t("infoMessage")}
                </GridItem>
              </Grid>
            )}
          </DataListContent>
        </DataListItem>
      ))}
    </DataList>
  );
}
