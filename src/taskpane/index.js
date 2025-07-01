import App from "./components/App";
import { AppContainer } from "react-hot-loader";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { toast } from "react-toastify";
/* global document, Office, module, require */

initializeIcons();

let isOfficeInitialized = false;

const title = "Revit Add-in for CRM";

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Component title={title} isOfficeInitialized={isOfficeInitialized} />
    </AppContainer>,
    document.getElementById("container")
  );
};

/* Render application after Office initializes */
Office.onReady(() => {
  // eslint-disable-next-line no-undef
  if (!("indexedDB" in window)) {

    toast.error("This browser doesn't support IndexedDB", {
      closeOnClick: true,
      pauseOnHover: true,
      theme: "colored",
      autoClose: 7000,
    });

  } else {
    isOfficeInitialized = true;
    render(App);
  }
});

/* Initial render showing a progress bar */
render(App);

if (module.hot) {
  module.hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    render(NextApp);
  });
}
