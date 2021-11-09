import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  PageSection,
} from "@patternfly/react-core";

import type ResourceRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation";
import { KeycloakDataTable } from "../../components/table-toolbar/KeycloakDataTable";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";

type ResourcesProps = {
  clientId: string;
};

export const AuthorizationResources = ({ clientId }: ResourcesProps) => {
  const { t } = useTranslation("clients");
  const adminClient = useAdminClient();

  //useFetch(() => adminClient.clients.listResources({ id: clientId }), )

  const loader = async (first?: number, max?: number, search?: string) => {
    const params = {
      first,
      max,
      deep: false,
      search,
    };
    return await adminClient.clients.listResources({ ...params, id: clientId });
  };

  const UriRenderer = (row: ResourceRepresentation) => (
    <>
      {row.uris?.[0]}{" "}
      {row.uris?.length > 1 && (
        <Label color="blue">
          {t("common:more", { count: row.uris.length - 1 })}
        </Label>
      )}
    </>
  );

  const DetailCell = ({ id }: { id: string }) => {
    const [scope, setScope] = useState<{ id: string; name: string }[]>();
    useFetch(
      () =>
        adminClient.clients.listScopesByResource({
          id: clientId,
          resourceName: id,
        }),
      setScope,
      []
    );
    return (
      <DescriptionList isHorizontal className="keycloak_eventsection_details">
        {scope?.map((scope) => (
          <DescriptionListGroup key={scope.name}>
            <DescriptionListTerm>{scope.name}</DescriptionListTerm>
          </DescriptionListGroup>
        ))}
        {/* {Object.entries(row.uris!).map(([key, value]) => (
          <DescriptionListGroup key={key}>
            <DescriptionListTerm>{key}</DescriptionListTerm>
            <DescriptionListDescription>{value}</DescriptionListDescription>
          </DescriptionListGroup>
        ))} */}
      </DescriptionList>
    );
  };

  const DetailRenderer = (row: ResourceRepresentation) => {
    console.log(row);
    return <DetailCell id={row._id!} />;
  };

  return (
    <PageSection variant="light" className="pf-u-p-0">
      <KeycloakDataTable
        loader={loader}
        isPaginated
        ariaLabelKey="clients:clientList"
        searchPlaceholderKey="clients:searchForClient"
        detailColumns={[
          {
            name: "details",
            enabled: () => true,
            cellRenderer: DetailRenderer,
          },
        ]}
        columns={[
          {
            name: "name",
            displayKey: "common:name",
          },
          {
            name: "type",
            displayKey: "common:type",
          },
          {
            name: "owner.name",
            displayKey: "clients:owner",
          },
          {
            name: "uris",
            displayKey: "clients:uris",
            cellRenderer: UriRenderer,
          },
        ]}
      />
    </PageSection>
  );
};
