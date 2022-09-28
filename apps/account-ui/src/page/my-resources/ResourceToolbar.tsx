import { useState, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { SearchInput, Toolbar, ToolbarContent } from "@patternfly/react-core";

type ResourceToolbarProps = {
  onFilter: (nameFilter: string) => void;
};

export const ResourceToolbar = ({ onFilter }: ResourceToolbarProps) => {
  const { t } = useTranslation();
  const [nameFilter, setNameFilter] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onFilter(nameFilter);
    }
  };

  return (
    <Toolbar>
      <ToolbarContent>
        <SearchInput
          placeholder={t("filterByName")}
          aria-label={t("filterByName")}
          value={nameFilter}
          onChange={setNameFilter}
          onSearch={() => onFilter(nameFilter)}
          onKeyDown={handleKeyDown}
          onClear={() => {
            setNameFilter("");
          }}
        />
      </ToolbarContent>
    </Toolbar>
  );
};
