import React from 'react';
import { storiesOf } from '@storybook/react';
import { Page, DropdownItem, Toolbar, ToolbarContent, ToolbarItem, Switch, Dropdown, DropdownToggle } from '@patternfly/react-core';
import { TableViewHeader } from '../components/table-view-header/TableViewHeader';

const dropdownItems = [
  <DropdownItem key="link">First item</DropdownItem>,
  <DropdownItem key="link">Second item</DropdownItem>
];

storiesOf('Table View Header', module)
  .add('view', () => {
    return (
      <Page>
        <TableViewHeader title="This is the title" badge="badge" description="This is the description." dropdownItems={dropdownItems} />
      </Page>
    );
  })
