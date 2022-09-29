import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@patternfly/react-table";

import { useAccountClient, useFetch } from "../../context/fetch";
import { Resource } from "../../representations";
import { Links } from "../../context/parse-links";
import { ResourceToolbar } from "./ResourceToolbar";
import { PermissionRequest } from "./PermissionRequest";

export const ResourcesTab = () => {
  const { t } = useTranslation();
  const accountClient = useAccountClient();

  const [params, setParams] = useState<Record<string, string>>({
    first: "0",
    max: "5",
  });
  const [links, setLinks] = useState<Links | undefined>();
  const [resources, setResources] = useState<Resource[]>();
  const [key, setKey] = useState(1);

  useFetch(
    async (signal) => {
      const result = await accountClient.fetchResources({ signal }, params);
      await Promise.all(
        result.data.map(
          async (r) =>
            (r.shareRequests = await accountClient.fetchRequest(
              { signal },
              r._id
            ))
        )
      );
      return result;
    },
    ({ data, links }) => {
      setResources(data);
      setLinks(links);
    },
    [params, key]
  );

  if (!resources) {
    return <Spinner />;
  }

  return (
    <>
      <ResourceToolbar
        onFilter={(name) => setParams({ ...params, name })}
        count={resources.length}
        first={parseInt(params["first"])}
        max={parseInt(params["max"])}
        onNextClick={() => setParams(links?.next || {})}
        onPreviousClick={() => setParams(links?.prev || {})}
        onPerPageSelect={(first, max) =>
          setParams({ first: `${first}`, max: `${max}` })
        }
        hasNext={!!links?.next}
      />
      <TableComposable aria-label={t("resources")}>
        <Thead>
          <Tr>
            <Th>{t("resourceName")}</Th>
            <Th>{t("application")}</Th>
            <Th>{t("permissionRequests")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {resources.map((resource) => (
            <Tr key={resource.name}>
              <Td dataLabel="resourceName">{resource.name}</Td>
              <Td dataLabel="application">
                <a href={resource.client.baseUrl}>
                  {resource.client.name || resource.client.clientId}{" "}
                  <ExternalLinkAltIcon />
                </a>
              </Td>
              <Td dataLabel="permissionRequests">
                {resource.shareRequests.length > 0 && (
                  <PermissionRequest
                    resource={resource}
                    refresh={() => setKey(key + 1)}
                  />
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
    </>
  );
};
