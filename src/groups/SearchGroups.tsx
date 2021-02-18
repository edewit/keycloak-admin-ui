import React, { useState } from "react";
import {
  Button,
  ButtonVariant,
  Chip,
  ChipGroup,
  Form,
  InputGroup,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextInput,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { SearchIcon } from "@patternfly/react-icons";

import { KeycloakDataTable } from "../components/table-toolbar/KeycloakDataTable";
import { useAdminClient } from "../context/auth/AdminClient";

export const SearchGroups = () => {
  const { t } = useTranslation("groups");
  const adminClient = useAdminClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const [key, setKey] = useState(0);
  const refresh = () => setKey(new Date().getTime());

  const deleteTerm = (id: string) => {
    const index = searchTerms.indexOf(id);
    searchTerms.splice(index, 1);
    setSearchTerms([...searchTerms]);
    refresh();
  };

  const addTerm = () => {
    setSearchTerms([...searchTerms, searchTerm]);
    setSearchTerm("");
    refresh();
  };

  const loader = async (first?: number, max?: number) => {
    const params = {
      first: first!,
      max: max!,
      search: searchTerms.toString(),
    };
    return await adminClient.groups.find({ ...params });
  };

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent className="pf-u-mr-sm">
          <Text component="h1">{t("searchForGroups")}</Text>
        </TextContent>
        <Form
          className="pf-u-mt-sm"
          onSubmit={(e) => {
            e.preventDefault();
            addTerm();
          }}
        >
          <InputGroup>
            <TextInput
              name="search"
              id="group-search"
              type="search"
              aria-label={t("search")}
              placeholder={t("searchGroups")}
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
            />
            <Button
              variant={ButtonVariant.control}
              aria-label={t("search")}
              onClick={addTerm}
            >
              <SearchIcon />
            </Button>
          </InputGroup>
          <ChipGroup>
            {searchTerms.map((term) => (
              <Chip key={term} onClick={() => deleteTerm(term)}>
                {term}
              </Chip>
            ))}
          </ChipGroup>
        </Form>
        <KeycloakDataTable
          key={key}
          ariaLabelKey="groups:groups"
          isPaginated
          loader={loader}
          columns={[
            {
              name: "name",
              displayKey: "groups:groupName",
            },
            {
              name: "path",
              displayKey: "groups:path",
            },
          ]}
        />
      </PageSection>
    </>
  );
};
