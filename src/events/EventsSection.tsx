import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import moment from "moment";
import {
  Button,
  PageSection,
  Tab,
  TabTitleText,
  ToolbarItem,
} from "@patternfly/react-core";
import { CheckCircleIcon, WarningTriangleIcon } from "@patternfly/react-icons";
import EventRepresentation from "keycloak-admin/lib/defs/eventRepresentation";

import { useAdminClient } from "../context/auth/AdminClient";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { KeycloakDataTable } from "../components/table-toolbar/KeycloakDataTable";
import { RealmContext } from "../context/realm-context/RealmContext";
import { AdminEvents } from "./AdminEvents";
import { ListEmptyState } from "../components/list-empty-state/ListEmptyState";
import { KeycloakTabs } from "../components/keycloak-tabs/KeycloakTabs";
import { cellWidth } from "@patternfly/react-table";

export const EventsSection = () => {
  const { t } = useTranslation("events");
  const adminClient = useAdminClient();
  const { realm } = useContext(RealmContext);

  const [key, setKey] = useState(0);
  const refresh = () => setKey(new Date().getTime());

  const loader = async (first?: number, max?: number, search?: string) => {
    const params = {
      first: first!,
      max: max!,
      realm,
    };
    if (search) {
      console.log("how to search?", search);
    }
    return await adminClient.realms.findEvents({ ...params });
  };

  const StatusRow = (event: EventRepresentation) => {
    const error = event.type?.indexOf("ERROR") !== -1;
    return (
      <>
        <>
          {error && <WarningTriangleIcon color="orange" />}
          {!error && <CheckCircleIcon color="green" />}
        </>{" "}
        {event.type}
      </>
    );
  };

  const UserDetailLink = (event: EventRepresentation) => (
    <>
      <Link key={event.userId} to={`/${realm}/users/${event.userId}/details`}>
        {event.userId}
      </Link>
    </>
  );

  return (
    <>
      <ViewHeader
        titleKey="events:title"
        subKey={
          <Trans i18nKey="events:eventExplain">
            If you want to configure user events, Admin events or Event
            listeners, please enter
            <Link to={`/${realm}/`}>{t("eventConfig")}</Link>
            page realm settings to configure.
          </Trans>
        }
        divider={false}
      />
      <PageSection variant="light" className="pf-u-p-0">
        <KeycloakTabs isBox>
          <Tab
            eventKey="userEvents"
            title={<TabTitleText>{t("userEvents")}</TabTitleText>}
          >
            <KeycloakDataTable
              key={key}
              loader={loader}
              isPaginated
              ariaLabelKey="events:title"
              searchPlaceholderKey="events:searchForEvent"
              toolbarItem={
                <>
                  <ToolbarItem>
                    <Button onClick={refresh}>{t("refresh")}</Button>
                  </ToolbarItem>
                </>
              }
              columns={[
                {
                  name: "time",
                  displayKey: "events:time",
                  cellRenderer: (row) => moment(row.time).format("LLL"),
                },
                {
                  name: "userId",
                  displayKey: "events:user",
                  cellRenderer: UserDetailLink,
                },
                {
                  name: "type",
                  displayKey: "events:eventType",
                  cellRenderer: StatusRow,
                },
                {
                  name: "ipAddress",
                  displayKey: "events:ipAddress",
                  transforms: [cellWidth(10)],
                },
                {
                  name: "clientId",
                  displayKey: "events:client",
                },
              ]}
              emptyState={
                <ListEmptyState
                  message={t("emptyEvents")}
                  instructions={t("emptyEventsInstructions")}
                />
              }
            />
          </Tab>
          <Tab
            eventKey="adminEvents"
            title={<TabTitleText>{t("adminEvents")}</TabTitleText>}
          >
            <AdminEvents />
          </Tab>
        </KeycloakTabs>
      </PageSection>
    </>
  );
};
