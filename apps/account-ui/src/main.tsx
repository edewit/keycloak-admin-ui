import "@patternfly/patternfly/patternfly-addons.css";
import "@patternfly/react-core/dist/styles/base.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { init } from "./i18n";
import { routes } from "./routes";

const router = createBrowserRouter(routes);

async function initialize() {
  await init();
  ReactDOM.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
    document.getElementById("app")
  );
}

initialize();
