import App from "../components/App";
import "../styles/tailwind.css";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { toast } from "react-toastify";

initializeIcons();

let isOfficeInitialized = false;

const title = "Revit Add-in for CRM";

const render = (Component) => {
  ReactDOM.render(
    <Component title={title} isOfficeInitialized={isOfficeInitialized} />,
    document.getElementById("container")
  );
};

/* Initial render showing a progress bar */
render(App);

/* Render application after Office initializes */
Office.onReady(() => {
  console.log('Office.js is ready');
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

// Fallback timeout in case Office.onReady doesn't fire
setTimeout(() => {
  if (!isOfficeInitialized) {
    console.log('Office.js initialization timeout - proceeding anyway');
    isOfficeInitialized = true;
    render(App);
  }
}, 5000);