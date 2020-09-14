import React from "react";
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
  DropdownToggle
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";

type TableViewHeaderProps = {
  title: string;
  badge: string;
  description: string;
  dropdownItems: any;
};

export const TableViewHeader = ({
  title,
  badge,
  description,
  dropdownItems
}: TableViewHeaderProps) => {
  return (
    <>
      <PageSection variant="light">
        <Level hasGutter>
          <LevelItem>
            <Level>
              <LevelItem>
                <TextContent className="pf-u-mr-sm">
                  <Text component="h1">{title}</Text>
                </TextContent>
              </LevelItem>
              <LevelItem>
                <Badge>{badge}</Badge>
              </LevelItem>
            </Level>
          </LevelItem>
          <LevelItem></LevelItem>
          <LevelItem>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>
                  <Switch label="Enabled" labelOff="Disabled" className="pf-u-mr-lg" />
                </ToolbarItem>
                <ToolbarItem>
                  <Dropdown
                    // onSelect={this.onSelect}
                    toggle={
                      <DropdownToggle
                        id="toggle-id"
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
        </Level>
        <TextContent>
          <Text>{description}</Text>
        </TextContent>
      </PageSection>
      <Divider />
    </>
  );
};
