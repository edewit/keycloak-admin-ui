import { FormGroup, Radio } from "@patternfly/react-core";
import { Controller, useFormContext } from "react-hook-form-v7";
import { useTranslation } from "react-i18next";

import { HelpItem } from "../../components/help-enabler/HelpItem";

const DECISION_STRATEGY = ["UNANIMOUS", "AFFIRMATIVE", "CONSENSUS"] as const;

type DecisionStrategySelectProps = {
  helpLabel?: string;
  isLimited?: boolean;
};

export const DecisionStrategySelect = ({
  helpLabel,
  isLimited = false,
}: DecisionStrategySelectProps) => {
  const { t } = useTranslation("clients");
  const { control } = useFormContext();

  return (
    <FormGroup
      label={t("decisionStrategy")}
      labelIcon={
        <HelpItem
          helpText={`clients-help:${helpLabel || "decisionStrategy"}`}
          fieldLabelId="clients:decisionStrategy"
        />
      }
      fieldId="decisionStrategy"
      hasNoPaddingTop
    >
      <Controller
        name="decisionStrategy"
        data-testid="decisionStrategy"
        defaultValue={DECISION_STRATEGY[0]}
        control={control}
        render={({ field }) => (
          <>
            {(isLimited
              ? DECISION_STRATEGY.slice(0, 2)
              : DECISION_STRATEGY
            ).map((strategy) => (
              <Radio
                id={strategy}
                key={strategy}
                data-testid={strategy}
                isChecked={field.value === strategy}
                name="decisionStrategy"
                onChange={() => field.onChange(strategy)}
                label={t(`decisionStrategies.${strategy}`)}
                className="pf-u-mb-md"
              />
            ))}
          </>
        )}
      />
    </FormGroup>
  );
};
