import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { DropdownItem, PageSection } from "@patternfly/react-core";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { ViewHeader } from "../components/view-header/ViewHeader";
import { useAdminClient } from "../context/auth/AdminClient";
import helpUrls from "../help-urls";
import { RevocationModal } from "./RevocationModal";
import SessionsTable from "./SessionsTable";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { useAlerts } from "../components/alert/Alerts";
import { useRealm } from "../context/realm-context/RealmContext";

import "./SessionsSection.css";

export default function SessionsSection() {
  const { t } = useTranslation("sessions");

  const adminClient = useAdminClient();
  const { addError } = useAlerts();
  const { realm } = useRealm();

  const [revocationModalOpen, setRevocationModalOpen] = useState(false);
  const [activeClientDetails, setActiveClientDetails] = useState<
    ClientRepresentation[]
  >([]);
  const [noSessions, setNoSessions] = useState(false);

  const handleRevocationModalToggle = () => {
    setRevocationModalOpen(!revocationModalOpen);
  };

  const loader = async () => {
    const activeClients = await adminClient.sessions.find();
    const clientSessions = (
      await Promise.all(
        activeClients.map((client) =>
          adminClient.clients.listSessions({ id: client.id })
        )
      )
    ).flat();

    setNoSessions(clientSessions.length === 0);

    const allClients = await adminClient.clients.find();

    const getActiveClientDetails = allClients.filter((x) =>
      activeClients.map((y) => y.id).includes(x.id)
    );

    setActiveClientDetails(getActiveClientDetails);

    const userIds = Array.from(
      new Set(clientSessions.map((session) => session.userId))
    );
    const userSessions = (
      await Promise.all(
        userIds.map((userId) => adminClient.users.listSessions({ id: userId! }))
      )
    ).flat();

    return userSessions;
  };

  const [toggleLogoutDialog, LogoutConfirm] = useConfirmDialog({
    titleKey: "sessions:logoutAllSessions",
    messageKey: "sessions:logoutAllDescription",
    continueButtonLabel: "common:confirm",
    onConfirm: async () => {
      try {
        await adminClient.realms.logoutAll({ realm });
        adminClient.keycloak?.logout({ redirectUri: "" });
      } catch (error) {
        addError("sessions:logoutAllSessionsError", error);
      }
    },
  });

  const dropdownItems = [
    <DropdownItem
      key="toggle-modal"
      data-testid="revocation"
      component="button"
      onClick={() => handleRevocationModalToggle()}
    >
      {t("revocation")}
    </DropdownItem>,
    <DropdownItem
      key="delete-role"
      data-testid="logout-all"
      component="button"
      isDisabled={noSessions}
      onClick={toggleLogoutDialog}
    >
      {t("signOutAllActiveSessions")}
    </DropdownItem>,
  ];

  return (
    <>
      <LogoutConfirm />
      <ViewHeader
        dropdownItems={dropdownItems}
        titleKey="sessions:title"
        subKey="sessions:sessionExplain"
        helpUrl={helpUrls.sessionsUrl}
      />
      <PageSection variant="light" className="pf-u-p-0">
        {revocationModalOpen && (
          <RevocationModal
            handleModalToggle={handleRevocationModalToggle}
            activeClients={activeClientDetails}
            save={() => {
              handleRevocationModalToggle();
            }}
          />
        )}
        <SessionsTable loader={loader} />
      </PageSection>
    </>
  );
}
