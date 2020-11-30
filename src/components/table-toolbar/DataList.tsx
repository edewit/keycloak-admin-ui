import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IActions,
  IFormatter,
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from "@patternfly/react-table";
import { PaginatingTableToolbar } from "./PaginatingTableToolbar";
import { Spinner } from "@patternfly/react-core";
import { TableToolbar } from "./TableToolbar";

type Row = {
  cells: any[];
};

type DataTableProps = {
  ariaLabelKey: string;
  columns: Field[];
  rows: Row[];
  actions?: IActions;
};

const DataTable = ({
  columns,
  rows,
  actions,
  ariaLabelKey,
}: DataTableProps) => {
  const { t } = useTranslation();
  return (
    <Table
      variant={TableVariant.compact}
      cells={columns.map((column) => {
        return { ...column, title: t(column.displayKey || column.name) };
      })}
      rows={rows}
      actions={actions}
      aria-label={t(ariaLabelKey)}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

export type Field = {
  name: string;
  displayKey?: string;
  cellFormatters?: IFormatter[];
};

export type DataListProps = {
  loader: (first?: number, max?: number, search?: string) => Promise<any[]>;
  isPaginated?: boolean;
  ariaLabelKey: string;
  columns: Field[];
  actions?: IActions;
};

export const DataList = ({
  ariaLabelKey,
  isPaginated = false,
  loader,
  columns,
  actions,
}: DataListProps) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>();
  const [filteredData, setFilteredData] = useState<Row[]>();
  const [loading, setLoading] = useState(false);

  const [max, setMax] = useState(10);
  const [first, setFirst] = useState(0);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await loader(first, max, search);

    setRows(
      data!.map((value) => {
        return {
          cells: columns.map((col) => value[col.name]),
        };
      })
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [first, max]);

  const filter = (search: string) => {
    setFilteredData(
      rows!.filter((row) =>
        row.cells.some(
          (cell) => cell && cell.toLowerCase().includes(search.toLowerCase())
        )
      )
    );
  };

  const searchOnChange = (value: string) => {
    if (isPaginated) {
      setSearch(value);
    } else {
      filter(value);
    }
  };

  const Loading = () => (
    <div className="pf-u-text-align-center">
      <Spinner />
    </div>
  );

  return (
    <>
      {!rows && <Loading />}
      {rows && isPaginated && (
        <PaginatingTableToolbar
          count={rows.length}
          first={first}
          max={max}
          onNextClick={setFirst}
          onPreviousClick={setFirst}
          onPerPageSelect={(first, max) => {
            setFirst(first);
            setMax(max);
          }}
          inputGroupName={`${ariaLabelKey}input`}
          inputGroupOnChange={searchOnChange}
          inputGroupOnClick={load}
          inputGroupPlaceholder={t("Search for client")}
        >
          {!loading && (
            <DataTable
              actions={actions}
              rows={rows}
              columns={columns}
              ariaLabelKey={ariaLabelKey}
            />
          )}
          {loading && <Loading />}
        </PaginatingTableToolbar>
      )}
      {rows && !isPaginated && (
        <TableToolbar
          inputGroupName={`${ariaLabelKey}input`}
          inputGroupOnChange={searchOnChange}
          inputGroupOnClick={() => {}}
          inputGroupPlaceholder={t("Search for client")}
        >
          <DataTable
            actions={actions}
            rows={filteredData || rows}
            columns={columns}
            ariaLabelKey={ariaLabelKey}
          />
        </TableToolbar>
      )}
    </>
  );
};
