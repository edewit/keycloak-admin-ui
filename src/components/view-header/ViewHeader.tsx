import React, { useContext } from "react";
import {
  Text,
  PageSection,
  TextContent,
  Divider,
  Level,
  LevelItem,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Badge,
  Dropdown,
  DropdownToggle,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import { HelpContext } from "../help-enabler/HelpHeader";
import { useTranslation } from "react-i18next";

export type ViewHeaderProps = {
  titleKey: string;
  badge?: string;
  subKey: string;
  dropdownItems?: any[];
  extended: boolean;
};

export const ViewHeader = ({
  titleKey,
  badge,
  subKey,
  dropdownItems,
  extended,
}: ViewHeaderProps) => {
  const { t } = useTranslation();
  const { enabled } = useContext(HelpContext);
  return (
    <>
      <PageSection variant="light">
        <Level hasGutter>
          <LevelItem>
            <Level>
              <LevelItem>
                <TextContent className="pf-u-mr-sm">
                  <Text component="h1">{t(titleKey)}</Text>
                </TextContent>
              </LevelItem>
              {badge && (
                <LevelItem>
                  <Badge>{badge}</Badge>
                </LevelItem>
              )}
            </Level>
          </LevelItem>
          <LevelItem></LevelItem>
          {extended && (
            <LevelItem>
              <Toolbar>
                <ToolbarContent>
                  <ToolbarItem>
                    <Switch
                      label="Enabled"
                      labelOff="Disabled"
                      className="pf-u-mr-lg"
                    />
                  </ToolbarItem>
                  <ToolbarItem>
                    <Dropdown
                      // onSelect={this.onSelect}
                      toggle={
                        <DropdownToggle
                          id={`${titleKey}-toggle`}
                          // onToggle={this.onToggle}
                          toggleIndicator={CaretDownIcon}
                        >
                          Actions
                        </DropdownToggle>
                      }
                      // isOpen={isOpen}
                      dropdownItems={dropdownItems}
                    />
                  </ToolbarItem>
                </ToolbarContent>
              </Toolbar>
            </LevelItem>
          )}
        </Level>
        {enabled && (
          <TextContent>
            <Text>{t(subKey)}</Text>
          </TextContent>
        )}
      </PageSection>
      <Divider />
    </>
  );
};
