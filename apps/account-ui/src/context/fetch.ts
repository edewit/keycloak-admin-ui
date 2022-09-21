import { createContext, DependencyList, useContext, useEffect } from "react";
import { useErrorHandler } from "react-error-boundary";

import { AccountClient } from "./account-client";

export const AccountClientContext = createContext<AccountClient>(
  new AccountClient()
);

export const useAccountClient = () => useContext(AccountClientContext);

export function useFetch<T>(
  adminClientCall: (signal: AbortSignal) => Promise<T>,
  callback: (param: T) => void,
  deps?: DependencyList
) {
  const onError = useErrorHandler();

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    adminClientCall(signal).then(callback).catch(onError);

    return () => {
      abortController.abort();
    };
  }, deps);
}
