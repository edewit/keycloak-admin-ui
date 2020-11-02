import React, { ReactElement, useState } from "react";
import {
  Button,
  ButtonVariant,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Modal,
  ModalVariant,
  Text,
  TextContent,
} from "@patternfly/react-core";
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from "@patternfly/react-table";
import { useTranslation } from "react-i18next";

import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import {
  ProtocolMapperRepresentation,
  ProtocolMapperTypeRepresentation,
} from "../../context/server-info/server-info";
import { ListEmptyState } from "../../components/list-empty-state/ListEmptyState";

export type AddMapperDialogProps = {
  protocol: string;
  filter?: ProtocolMapperRepresentation[];
  onConfirm: (
    value: ProtocolMapperTypeRepresentation | ProtocolMapperRepresentation[]
  ) => void;
};

type AddMapperDialogModalProps = AddMapperDialogProps & {
  open: boolean;
  toggleDialog: () => void;
  isBuiltIn: boolean;
  rows: {
    item: ProtocolMapperRepresentation;
    selected: boolean;
    cells: string[];
  }[];
  setRows: React.Dispatch<
    React.SetStateAction<
      {
        item: ProtocolMapperRepresentation;
        selected: boolean;
        cells: string[];
      }[]
    >
  >;
};

const Dialog = ({
  open,
  toggleDialog,
  rows,
  setRows,
  ...props
}: AddMapperDialogModalProps) => {
  return (
    <AddMapperDialog
      {...props}
      open={open}
      toggleDialog={toggleDialog}
      rows={rows}
      setRows={setRows}
    />
  );
};

export const useAddMapperDialog = (
  props: AddMapperDialogProps
): [() => void, () => ReactElement] => {
  const [show, setShow] = useState(false);

  const serverInfo = useServerInfo();
  const protocol = props.protocol;
  const protocolMappers = serverInfo.protocolMapperTypes[protocol];
  const builtInMappers = serverInfo.builtinProtocolMappers[protocol];
  const [filter, setFilter] = useState<ProtocolMapperRepresentation[]>([]);

  const allRows = builtInMappers.map((mapper) => {
    const mapperType = protocolMappers.filter(
      (type) => type.id === mapper.protocolMapper
    )[0];
    return {
      item: mapper,
      selected: false,
      cells: [mapper.name, mapperType.helpText],
    };
  });
  const [rows, setRows] = useState(allRows);

  if (props.filter && props.filter.length !== filter.length) {
    setFilter(props.filter);
    const nameFilter = props.filter.map((f) => f.name);
    setRows([...allRows.filter((row) => !nameFilter.includes(row.item.name))]);
  }

  function toggleDialog() {
    setShow((show) => !show);
  }

  return [
    toggleDialog,
    () =>
      Dialog({
        open: show,
        toggleDialog,
        rows,
        setRows,
        isBuiltIn: !!filter,
        ...props,
      }),
  ];
};

export const AddMapperDialog = ({
  protocol,
  rows,
  setRows,
  isBuiltIn,
  open,
  toggleDialog,
  onConfirm,
}: AddMapperDialogModalProps) => {
  const serverInfo = useServerInfo();
  const protocolMappers = serverInfo.protocolMapperTypes[protocol];
  const { t } = useTranslation("client-scopes");

  return (
    <Modal
      variant={ModalVariant.medium}
      title={t("chooseAMapperType")}
      isOpen={open}
      onClose={toggleDialog}
      actions={
        isBuiltIn
          ? [
              <Button
                id="modal-confirm"
                key="confirm"
                isDisabled={rows.length === 0}
                onClick={() => {
                  onConfirm(
                    rows.filter((row) => row.selected).map((row) => row.item)
                  );
                  toggleDialog();
                }}
              >
                {t("common:add")}
              </Button>,
              <Button
                id="modal-cancel"
                key="cancel"
                variant={ButtonVariant.secondary}
                onClick={() => {
                  toggleDialog();
                }}
              >
                {t("common:cancel")}
              </Button>,
            ]
          : []
      }
    >
      <TextContent>
        <Text>{t("predefinedMappingDescription")}</Text>
      </TextContent>
      {!isBuiltIn && (
        <DataList
          onSelectDataListItem={(id) => {
            const mapper = protocolMappers.find((mapper) => mapper.id === id);
            onConfirm(mapper!);
            toggleDialog();
          }}
          aria-label={t("chooseAMapperType")}
          isCompact
        >
          {protocolMappers.map((mapper) => (
            <DataListItem
              aria-labelledby={mapper.name}
              key={mapper.id}
              id={mapper.id}
            >
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key={`name-${mapper.id}`}>
                      <>{mapper.name}</>
                    </DataListCell>,
                    <DataListCell key={`helpText-${mapper.id}`}>
                      <>{mapper.helpText}</>
                    </DataListCell>,
                  ]}
                />
              </DataListItemRow>
            </DataListItem>
          ))}
        </DataList>
      )}
      {isBuiltIn && rows.length > 0 && (
        <Table
          variant={TableVariant.compact}
          cells={[t("name"), t("description")]}
          onSelect={(_, isSelected, rowIndex) => {
            rows[rowIndex].selected = isSelected;
            setRows([...rows]);
          }}
          canSelectAll={false}
          rows={rows}
          aria-label={t("chooseAMapperType")}
        >
          <TableHeader />
          <TableBody rowKey={(row: any) => row.rowData.item.name} />
        </Table>
      )}
      {isBuiltIn && rows.length === 0 && (
        <ListEmptyState
          message={t("emptyMappers")}
          instructions={t("emptyBuiltInMappersInstructions")}
        />
      )}
    </Modal>
  );
};
