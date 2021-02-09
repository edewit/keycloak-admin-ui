import React from "react";
import {
  Button,
  ButtonVariant,
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

export const SearchGroups = () => {
  const { t } = useTranslation("groups");
  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent className="pf-u-mr-sm">
          <Text component="h1">{t("searchForGroups")}</Text>
        </TextContent>
        <Form className="pf-u-mt-sm">
          <InputGroup>
            <TextInput
              name="search"
              id="group-search"
              type="search"
              aria-label={t("search")}
              placeholder={t("searchGroups")}
            />
            <Button variant={ButtonVariant.control} aria-label={t("search")}>
              <SearchIcon />
            </Button>
          </InputGroup>
        </Form>
      </PageSection>
    </>
  );
};
