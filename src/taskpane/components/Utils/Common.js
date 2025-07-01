import React from "react";
import {
  FaFileInvoice,
  FaFileInvoiceDollar,
  FaUserAlt,
  FaTools,
  FaHouseUser,
  FaRegFilePowerpoint,
  FaQuora,
  FaClipboardList,
  FaCommentAlt,
} from "react-icons/fa";
import { BsFillCalendarMonthFill, BsFillBuildingsFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { FcDocument } from "react-icons/fc";
import { GrDocumentUser } from "react-icons/gr";
import { GiCardboardBox } from "react-icons/gi";
import { TbDeviceLandlinePhone, TbMoneybag } from "react-icons/tb";
import { GoTasklist } from "react-icons/go";

let dts_outlook_userid = "";
let dts_outlook_token = "";
let dts_outlook_crm_url = "";
let dts_outlook_username = "";

// return the user data from the session storage
export const getUser = () => {
  // eslint-disable-next-line no-undef
  const userStr = dts_outlook_userid; //localStorage.getItem("dts_outlook_userid");
  if (userStr) return userStr;
  else return null;
};

// return the token from the session storage
export const getToken = () => {
  return dts_outlook_token || null;
  // // eslint-disable-next-line no-undef
  // return localStorage.getItem("dts_outlook_token") || null;
};

// return the crm url from the session storage
export const getCrmUrl = () => {
  return dts_outlook_crm_url || null;
  // eslint-disable-next-line no-undef
  // return localStorage.getItem("dts_outlook_crm_url") || null;
};

// remove the token and user from the session storage
export const removeUserSession = () => {
  dts_outlook_token = "";
  dts_outlook_userid = "";
  dts_outlook_crm_url = "";
  dts_outlook_username = "";
  // eslint-disable-next-line no-undef
  // localStorage.removeItem("dts_outlook_token");
  // eslint-disable-next-line no-undef
  // localStorage.removeItem("dts_outlook_userid");
  // eslint-disable-next-line no-undef
  // localStorage.removeItem("dts_outlook_crm_url");
  // eslint-disable-next-line no-undef
  // localStorage.removeItem("dts_outlook_username");
};

// return the crm url from the session storage
export const getUserName = () => {
  return dts_outlook_username || null;
  // eslint-disable-next-line no-undef
  // return localStorage.getItem("dts_outlook_username") || null;
};

// set the token and user from the session storage
export const setUserSession = (token, userid, crm_url, username) => {
  dts_outlook_token = token;
  dts_outlook_userid = userid;
  dts_outlook_crm_url = crm_url;
  dts_outlook_username = username;
  // eslint-disable-next-line no-undef
  // localStorage.setItem("dts_outlook_token", token);
  // eslint-disable-next-line no-undef
  // localStorage.setItem("dts_outlook_userid", userid);
  // eslint-disable-next-line no-undef
  // localStorage.setItem("dts_outlook_crm_url", crm_url);
  // eslint-disable-next-line no-undef
  // localStorage.setItem("dts_outlook_username", username);
};

export const renderIcon = (relModule) => {
  switch (relModule) {
    case "Detail":
      return <FaClipboardList style={{ fontSize: "19px" }} />;
    case "Contacts":
      return <FaUserAlt style={{ fontSize: "19px" }} />;
    case "Accounts":
      return <BsFillBuildingsFill style={{ fontSize: "19px" }} />;
    case "Leads":
      return <GrDocumentUser style={{ fontSize: "19px" }} />;
    case "ModComments":
      return <FaCommentAlt style={{ fontSize: "19px" }} />;
    case "Documents":
      return <FcDocument style={{ fontSize: "19px" }} />;
    case "Emails":
      return <MdEmail style={{ fontSize: "19px" }} />;
    case "Calendar":
      return <BsFillCalendarMonthFill style={{ fontSize: "19px" }} />;
    case "Invoice":
      return <FaFileInvoiceDollar style={{ fontSize: "19px" }} />;
    case "SalesOrder":
      return <FaFileInvoice style={{ fontSize: "19px" }} />;
    case "Products":
      return <GiCardboardBox style={{ fontSize: "19px" }} />;
    case "PBXManager":
      return <TbDeviceLandlinePhone style={{ fontSize: "19px" }} />;
    case "Services":
      return <FaTools style={{ fontSize: "19px" }} />;
    case "Potentials":
      return <TbMoneybag style={{ fontSize: "19px" }} />;
    case "Vendors":
      return <FaHouseUser style={{ fontSize: "19px" }} />;
    case "PurchaseOrder":
      return <FaRegFilePowerpoint style={{ fontSize: "19px" }} />;
    case "Quotes":
      return <FaQuora style={{ fontSize: "19px" }} />;
    case "Task":
      return <GoTasklist style={{ fontSize: "19px" }} />;
  }
};
