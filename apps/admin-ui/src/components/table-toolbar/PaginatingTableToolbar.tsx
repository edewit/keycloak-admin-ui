import {
  Pagination,
  ToggleTemplateProps,
  ToolbarItem,
} from "@patternfly/react-core";
import { PropsWithChildren, ReactNode } from "react";

import { TableToolbar } from "./TableToolbar";

type KeycloakPaginationProps = {
  id?: string;
  count: number;
  first: number;
  max: number;
  onNextClick: (page: number) => void;
  onPreviousClick: (page: number) => void;
  onPerPageSelect: (max: number, first: number) => void;
  variant?: "top" | "bottom";
};

type TableToolbarProps = KeycloakPaginationProps & {
  searchTypeComponent?: ReactNode;
  toolbarItem?: ReactNode;
  subToolbar?: ReactNode;
  inputGroupName?: string;
  inputGroupPlaceholder?: string;
  inputGroupOnEnter?: (value: string) => void;
};

const KeycloakPagination = ({
  id,
  variant = "top",
  count,
  first,
  max,
  onNextClick,
  onPreviousClick,
  onPerPageSelect,
}: KeycloakPaginationProps) => {
  const page = Math.round(first / max);
  return (
    <Pagination
      widgetId={id}
      isCompact
      toggleTemplate={({ firstIndex, lastIndex }: ToggleTemplateProps) => (
        <b>
          {firstIndex} - {lastIndex}
        </b>
      )}
      itemCount={count + page * max}
      page={page + 1}
      perPage={max}
      onNextClick={(_, p) => onNextClick((p - 1) * max)}
      onPreviousClick={(_, p) => onPreviousClick((p - 1) * max)}
      onPerPageSelect={(_, m, f) => onPerPageSelect(f - 1, m)}
      variant={variant}
    />
  );
};

export const PaginatingTableToolbar = ({
  count,
  searchTypeComponent,
  toolbarItem,
  subToolbar,
  children,
  inputGroupName,
  inputGroupPlaceholder,
  inputGroupOnEnter,
  ...rest
}: PropsWithChildren<TableToolbarProps>) => {
  return (
    <TableToolbar
      searchTypeComponent={searchTypeComponent}
      toolbarItem={
        <>
          {toolbarItem}
          <ToolbarItem variant="pagination">
            <KeycloakPagination count={count} {...rest} />
          </ToolbarItem>
        </>
      }
      subToolbar={subToolbar}
      toolbarItemFooter={
        count !== 0 ? (
          <ToolbarItem>
            <KeycloakPagination count={count} variant="bottom" {...rest} />
          </ToolbarItem>
        ) : null
      }
      inputGroupName={inputGroupName}
      inputGroupPlaceholder={inputGroupPlaceholder}
      inputGroupOnEnter={inputGroupOnEnter}
    >
      {children}
    </TableToolbar>
  );
};
