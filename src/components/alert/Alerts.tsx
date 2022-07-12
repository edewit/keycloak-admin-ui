import React, {
  createContext,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { AlertVariant } from "@patternfly/react-core";
import axios from "axios";
import type { AxiosError } from "axios";

import useRequiredContext from "../../utils/useRequiredContext";
import { AlertPanel, AlertType } from "./AlertPanel";

export type AddAlertFunction = (
  message: string,
  variant?: AlertVariant,
  description?: string
) => void;

export type AddErrorFunction = (message: string, error: any) => void;

type AlertProps = {
  addAlert: AddAlertFunction;
  addError: AddErrorFunction;
};

export const AlertContext = createContext<AlertProps | undefined>(undefined);

export const useAlerts = () => useRequiredContext(AlertContext);

export const AlertProvider: FunctionComponent = ({ children }) => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  const clearAlerts = () => {
    setAlerts((alerts) => [
      ...alerts.filter((el) => el.key > new Date().getTime() - 8000),
    ]);
  };

  const hideAlert = (id: number) => {
    setAlerts((alerts) => [...alerts.filter((el) => el.id !== id)]);
  };

  useEffect(() => {
    const interval = setInterval(() => clearAlerts(), 3000);
    return () => clearTimeout(interval);
  }, []);

  const addAlert = (
    message: string,
    variant: AlertVariant = AlertVariant.success,
    description?: string
  ) => {
    setAlerts([
      {
        id: Math.random(),
        key: new Date().getTime(),
        message,
        variant,
        description,
      },
      ...alerts,
    ]);
  };

  const addError = (message: string, error: Error | AxiosError | string) => {
    addAlert(
      t(message, {
        error: getErrorMessage(error),
      }),
      AlertVariant.danger
    );
  };

  return (
    <AlertContext.Provider value={{ addAlert, addError }}>
      <AlertPanel alerts={alerts} onCloseAlert={hideAlert} />
      {children}
    </AlertContext.Provider>
  );
};

function getErrorMessage(
  error: Error | AxiosError<Record<string, unknown>> | string
) {
  if (typeof error === "string") {
    return error;
  }

  if (!axios.isAxiosError(error)) {
    return error.message;
  }

  const responseData = error.response?.data ?? {};

  for (const key of ["error_description", "errorMessage", "error"]) {
    const value = responseData[key];

    if (typeof value === "string") {
      return value;
    }
  }

  return error.message;
}
