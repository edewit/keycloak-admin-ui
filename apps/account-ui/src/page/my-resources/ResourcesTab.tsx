import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dropdown,
  KebabToggle,
  OverflowMenu,
  OverflowMenuContent,
  OverflowMenuControl,
  OverflowMenuDropdownItem,
  OverflowMenuGroup,
  OverflowMenuItem,
  Spinner,
} from "@patternfly/react-core";
import { ExternalLinkAltIcon, ShareAltIcon } from "@patternfly/react-icons";
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ExpandableRowContent,
} from "@patternfly/react-table";

import { useAccountClient, useFetch } from "../../context/fetch";
import { Permission, Resource } from "../../representations";
import { Links } from "../../context/parse-links";
import { ResourceToolbar } from "./ResourceToolbar";
import { PermissionRequest } from "./PermissionRequest";
import { ShareTheResource } from "./ShareTheResource";
import { SharedWith } from "./SharedWith";

type PermissionDetail = {
  contextOpen?: boolean;
  rowOpen?: boolean;
  dialogOpen?: boolean;
  permissions?: Permission[];
};

export const ResourcesTab = () => {
  const { t } = useTranslation();
  const accountClient = useAccountClient();

  const [params, setParams] = useState<Record<string, string>>({
    first: "0",
    max: "5",
  });
  const [links, setLinks] = useState<Links | undefined>();
  const [resources, setResources] = useState<Resource[]>();
  const [details, setDetails] = useState<
    Record<string, PermissionDetail | undefined>
  >({});
  const [key, setKey] = useState(1);
  const refresh = () => setKey(key + 1);

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

  const fetchPermissions = async (id: string) => {
    let permissions = details[id]?.permissions || [];
    if (!details[id]) {
      permissions = await accountClient.fetchPermission({}, id);
    }
    return permissions;
  };

  const toggleRowOpen = async (id: string, open: boolean) => {
    const permissions = await fetchPermissions(id);

    setDetails({
      ...details,
      [id]: { ...details[id], rowOpen: open, permissions },
    });
  };

  const toggleContextOpen = async (id: string, open: boolean) => {
    const permissions = await fetchPermissions(id);

    setDetails({
      ...details,
      [id]: { ...details[id], contextOpen: open, permissions },
    });
  };

  const toggleDialogOpen = async (id: string, open: boolean) => {
    const permissions = await fetchPermissions(id);

    setDetails({
      ...details,
      [id]: { ...details[id], dialogOpen: open, permissions },
    });
  };
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
            <Th />
            <Th>{t("resourceName")}</Th>
            <Th>{t("application")}</Th>
            <Th>{t("permissionRequests")}</Th>
          </Tr>
        </Thead>
        {resources.map((resource, index) => (
          <Tbody
            key={resource.name}
            isExpanded={details[resource._id]?.rowOpen}
          >
            <Tr>
              <Td
                expand={{
                  isExpanded: details[resource._id]?.rowOpen || false,
                  rowIndex: index,
                  onToggle: () =>
                    toggleRowOpen(
                      resource._id,
                      !details[resource._id]?.rowOpen
                    ),
                }}
              />
              <Td dataLabel={t("resourceName")}>{resource.name}</Td>
              <Td dataLabel={t("application")}>
                <a href={resource.client.baseUrl}>
                  {resource.client.name || resource.client.clientId}{" "}
                  <ExternalLinkAltIcon />
                </a>
              </Td>
              <Td dataLabel={t("permissionRequests")}>
                {resource.shareRequests.length > 0 && (
                  <PermissionRequest
                    resource={resource}
                    refresh={() => refresh()}
                  />
                )}
                <ShareTheResource
                  resource={resource}
                  permissions={details[resource._id]?.permissions}
                  open={details[resource._id]?.dialogOpen || false}
                  onClose={() => setDetails({})}
                />
              </Td>
              <Td isActionCell>
                <OverflowMenu breakpoint="lg">
                  <OverflowMenuContent>
                    <OverflowMenuGroup groupType="button">
                      <OverflowMenuItem>
                        <Button
                          variant="link"
                          onClick={() => toggleDialogOpen(resource._id, true)}
                        >
                          <ShareAltIcon /> {t("share")}
                        </Button>
                      </OverflowMenuItem>
                      <OverflowMenuItem>
                        <Button variant="secondary">Secondary</Button>
                      </OverflowMenuItem>
                      <OverflowMenuItem>
                        <Button variant="tertiary">Tertiary</Button>
                      </OverflowMenuItem>
                    </OverflowMenuGroup>
                  </OverflowMenuContent>
                  <OverflowMenuControl>
                    <Dropdown
                      position="right"
                      toggle={
                        <KebabToggle
                          onToggle={(open) =>
                            toggleContextOpen(resource._id, open)
                          }
                        />
                      }
                      isOpen={details[resource._id]?.contextOpen}
                      isPlain
                      dropdownItems={[
                        <OverflowMenuDropdownItem key="item1" isShared>
                          <ShareAltIcon /> {t("share")}
                        </OverflowMenuDropdownItem>,
                        <OverflowMenuDropdownItem key="item2" isShared>
                          Secondary
                        </OverflowMenuDropdownItem>,
                        <OverflowMenuDropdownItem key="item3" isShared>
                          Tertiary
                        </OverflowMenuDropdownItem>,
                      ]}
                    />
                  </OverflowMenuControl>
                </OverflowMenu>
              </Td>
            </Tr>
            <Tr isExpanded={details[resource._id]?.rowOpen || false}>
              <Td colSpan={4} textCenter>
                <ExpandableRowContent>
                  <SharedWith
                    permissions={details[resource._id]?.permissions}
                  />
                </ExpandableRowContent>
              </Td>
            </Tr>
          </Tbody>
        ))}
      </TableComposable>
    </>
  );
};
