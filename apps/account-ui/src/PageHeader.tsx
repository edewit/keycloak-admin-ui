import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Brand,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownToggle,
  KebabToggle,
  PageHeader,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
} from "@patternfly/react-core";
import { HelpIcon } from "@patternfly/react-icons";

export const Header = () => {
  const ManageAccountDropdownItem = () => (
    <DropdownItem key="manage account" id="manage-account">
      manageAccount
    </DropdownItem>
  );

  const SignOutDropdownItem = () => (
    <DropdownItem id="sign-out" key="sign out">
      signOut
    </DropdownItem>
  );

  const ServerInfoDropdownItem = () => {
    return (
      <DropdownItem
        key="server info"
        component={(props: any) => <Link {...props} />}
      >
        realmInfo
      </DropdownItem>
    );
  };

  const HelpDropdownItem = () => {
    return <DropdownItem icon={<HelpIcon />}>helpEnabled</DropdownItem>;
  };

  const kebabDropdownItems = [
    <ManageAccountDropdownItem key="kebab Manage Account" />,
    <ServerInfoDropdownItem key="kebab Server Info" />,
    <HelpDropdownItem key="kebab Help" />,
    <DropdownSeparator key="kebab sign out separator" />,
    <SignOutDropdownItem key="kebab Sign out" />,
  ];

  const userDropdownItems = [
    <ManageAccountDropdownItem key="Manage Account" />,
    <ServerInfoDropdownItem key="Server info" />,
    <DropdownSeparator key="sign out separator" />,
    <SignOutDropdownItem key="Sign out" />,
  ];

  const headerTools = () => {
    return (
      <PageHeaderTools>
        <PageHeaderToolsGroup>
          <PageHeaderToolsItem
            visibility={{
              md: "hidden",
            }} /** this kebab dropdown replaces the icon buttons and is hidden for desktop sizes */
          >
            <KebabDropdown />
          </PageHeaderToolsItem>
          <PageHeaderToolsItem
            visibility={{
              default: "hidden",
              md: "visible",
            }} /** this user dropdown is hidden on mobile sizes */
          >
            <UserDropdown />
          </PageHeaderToolsItem>
        </PageHeaderToolsGroup>
        <Avatar src={"/img_avatar.svg"} alt="Avatar image" />
      </PageHeaderTools>
    );
  };

  const KebabDropdown = () => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    return (
      <Dropdown
        id="user-dropdown-kebab"
        isPlain
        position="right"
        toggle={<KebabToggle onToggle={setDropdownOpen} />}
        isOpen={isDropdownOpen}
        dropdownItems={kebabDropdownItems}
      />
    );
  };

  const UserDropdown = () => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    return (
      <Dropdown
        isPlain
        position="right"
        id="user-dropdown"
        isOpen={isDropdownOpen}
        toggle={
          <DropdownToggle onToggle={setDropdownOpen}>Unknown</DropdownToggle>
        }
        dropdownItems={userDropdownItems}
      />
    );
  };

  return (
    <PageHeader
      showNavToggle
      logo={
        <Link to="home">
          <Brand
            src={"/logo.svg"}
            id="masthead-logo"
            alt="Logo"
            className="keycloak__pageheader_brand"
          />
        </Link>
      }
      logoComponent="div"
      headerTools={headerTools()}
    />
  );
};
