import "@patternfly/patternfly/patternfly-addons.css";
import "@patternfly/react-core/dist/styles/base.css";

import { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { Spinner } from "@patternfly/react-core";

import { init } from "./i18n";
import { App } from "./App";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

async function initialize() {
  init();
  ReactDOM.render(
    <StrictMode>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() =>
          (window.location.href =
            window.location.origin + window.location.pathname)
        }
      >
        <Suspense fallback={<Spinner />}>
          <App />
        </Suspense>
      </ErrorBoundary>
    </StrictMode>,
    document.getElementById("app")
  );
}

initialize();
