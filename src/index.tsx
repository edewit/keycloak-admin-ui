import React from "react";
import ReactDom from "react-dom";
import i18n from "./i18n";

import { AdminClient } from "./auth/AdminClient";
import init from "./context/auth/keycloak";
import { App } from "./App";

console.info("supported languages", ...i18n.languages);

init().then((adminClient) => {
    
  ReactDom.render(
      <AdminClient.Provider value={adminClient}>
        <App />
      </AdminClient.Provider>,
    document.getElementById("app")
  );
});
