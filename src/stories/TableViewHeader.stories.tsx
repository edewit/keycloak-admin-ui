import React from 'react';
import { storiesOf } from '@storybook/react';
import { Page } from '@patternfly/react-core';
import { TableViewHeader } from '../components/table-view-header/TableViewHeader';

storiesOf('Table View Header', module)
  .add('view', () => {
    return (
      <Page>
        <TableViewHeader title="This is the title" badge="badge" description="This is the description." />
      </Page>
    );
  })
