import React, { ReactElement, useState } from "react";
import {
  Card,
  CardHeader,
  CardActions,
  CardTitle,
  CardBody,
  CardFooter,
  Dropdown,
  KebabToggle,
  Label,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import "./keycloak-card.css";
import { useHistory } from "react-router-dom";

export type KeycloakCardProps = {
  id: string;
  title: string;
  dropdownItems?: ReactElement[];
  labelText?: string;
  labelColor?: any;
  footerText?: string;
  configEnabled?: boolean;
  providerId?: string;
};

export const KeycloakCard = ({
  id,
  dropdownItems,
  title,
  labelText,
  labelColor,
  footerText,
}: KeycloakCardProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const history = useHistory();

  const onDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const openSettings = () => {
    history.push(`/components/${id}`);
    // debugging
    console.log(`Card ${title} was clicked!`);
    console.log(`Its ID is: ${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardActions>
          {dropdownItems && (
            <Dropdown
              isPlain
              position={"right"}
              toggle={<KebabToggle onToggle={onDropdownToggle} />}
              isOpen={isDropdownOpen}
              dropdownItems={dropdownItems}
            />
          )}
        </CardActions>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody onClick={openSettings} />
      <CardFooter>
        <Flex>
          <FlexItem className="keycloak--keycloak-card__footer">
            {footerText && footerText}
          </FlexItem>
          <FlexItem>
            {labelText && (
              <Label color={labelColor || "gray"}>{labelText}</Label>
            )}
          </FlexItem>
        </Flex>
      </CardFooter>
    </Card>
  );
};
