import {
  Select,
  SelectOption,
  SelectVariant,
  Split,
  SplitItem,
  NumberInput,
} from "@patternfly/react-core";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type Unit = "seconds" | "minutes" | "hours" | "days";

export type TimeSelectorProps = {
  value: number;
  units?: Unit[];
  onChange: (time: number) => void;
};

export const TimeSelector = ({
  value,
  units = ["seconds", "minutes", "hours", "days"],
  onChange,
}: TimeSelectorProps) => {
  const { t } = useTranslation("common");
  const allTimes: { unit: Unit; label: string; multiplier: number }[] = [
    { unit: "seconds", label: t("times.seconds"), multiplier: 1 },
    { unit: "minutes", label: t("times.minutes"), multiplier: 60 },
    { unit: "hours", label: t("times.hours"), multiplier: 3600 },
    { unit: "days", label: t("times.days"), multiplier: 86400 },
  ];

  const [timeValue, setTimeValue] = useState<number>(0);
  const [multiplier, setMultiplier] = useState(
    allTimes.find((time) => time.unit === units[0])?.multiplier
  );
  const [open, setOpen] = useState(false);

  const times = allTimes.filter((t) => units.includes(t.unit));

  useEffect(() => {
    const x = times.reduce(
      (v, time) =>
        value % time.multiplier === 0 && v < time.multiplier
          ? time.multiplier
          : v,
      1
    );

    if (value) {
      setMultiplier(x);
      setTimeValue(value / x);
    }
  }, [value]);

  const updateTimeout = (
    timeout: number,
    times: number | undefined = multiplier
  ) => {
    onChange(timeout * (times || 1));
    setTimeValue(timeout);
  };

  return (
    <Split hasGutter>
      <SplitItem>
        <NumberInput
          value={timeValue}
          min={0}
          onChange={(event) => {
            const value = ((event.target as unknown) as { value: number })
              .value;
            const timeOut = isNaN(value) ? 0 : Number(value);
            updateTimeout(timeOut);
          }}
          onPlus={() => updateTimeout(Number(timeValue) + 1)}
          onMinus={() => updateTimeout(Number(timeValue) - 1)}
        />
      </SplitItem>
      <SplitItem>
        <Select
          variant={SelectVariant.single}
          aria-label={t("unitLabel")}
          onSelect={(_, value) => {
            setMultiplier(value as number);
            updateTimeout(timeValue, value as number);
            setOpen(false);
          }}
          selections={[multiplier]}
          onToggle={() => {
            setOpen(!open);
          }}
          isOpen={open}
        >
          {times.map((time) => (
            <SelectOption key={time.label} value={time.multiplier}>
              {time.label}
            </SelectOption>
          ))}
        </Select>
      </SplitItem>
    </Split>
  );
};
