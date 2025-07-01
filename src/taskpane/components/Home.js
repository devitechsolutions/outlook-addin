import React, { useState, useEffect } from "react";
import axios from "axios";
import EditMode from "./EditMode";
import CreateMode from "./CreateMode";
import { GrPowerShutdown } from "react-icons/gr";
import { useIndexedDBStore } from "use-indexeddb";
import { toast } from "react-toastify";

import {
  Shimmer,
  ShimmerElementsGroup,
  ShimmerElementType,
  mergeStyleSets,
  createTheme,
  ThemeProvider,
} from "@fluentui/react";

const Home = (props) => {
  const { getByID } = useIndexedDBStore("users");
  // eslint-disable-next-line no-undef
  var displayname = Office.context.mailbox.item.from.displayName;
  var tmp = displayname.split(" ");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var firstname = tmp[0];
  // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unused-vars
  var lastname = tmp[tmp.length-1];
  // eslint-disable-next-line no-undef , @typescript-eslint/no-unused-vars
  var fromEmail = Office.context.mailbox.item.from.emailAddress;

  const [recordExist, setRecordExist] = useState(false);

  const [Loading, setLoading] = useState(true);

  const [userName, setUserName] = useState("");

  const [CheckingMail, setCheckingMail] = useState(true);

  useEffect(() => {
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      if (crm_url !== "" && crm_url !== undefined) {
        let api_url = crm_url + "/modules/OutlookAddIn/api/getRecordDetailFromEmail.php";
        axios
          .request({
            method: "POST",
            url: api_url,
            params: { email: fromEmail },
          })
          .then((response) => {
            let data = response.data;
            setLoading(false);
            if (data.success === true) {
              setRecordExist(data.data);
            } else {
              if (data.code === 100) {
                toast.error(data.message, {
                  closeOnClick: true,
                  pauseOnHover: true,
                  theme: "colored",
                  autoClose: 7000,
                });
                // eslint-disable-next-line react/prop-types
                props.onLogout();
              } else {
                setRecordExist(false);
              }
            }
          })
          .catch(() => {});
      }
    });
  }, [CheckingMail]);

  const checkingMailHandler = () => {
    setCheckingMail(!CheckingMail);
  };

  // let username = getUserName();

  getByID(1).then((res) => {
    setUserName(res.username);
  });

  const customThemeForShimmer = createTheme({
    palette: {
      // palette slot used in Shimmer for main background
      neutralLight: "#eaeaea",
      // palette slot used in Shimmer for tip of the moving wave
      neutralLighter: "#d2dae2",
      // palette slot used in Shimmer for all the space around the shimmering elements
      white: "#e9e9e9",
    },
  });

  const getCustomElements = (backgroundColor) => {
    return (
      <div style={{ display: "flex" }}>
        <ShimmerElementsGroup
          backgroundColor={backgroundColor}
          shimmerElements={[
            { type: ShimmerElementType.circle, height: 40 },
            { type: ShimmerElementType.gap, width: 16, height: 40 },
          ]}
        />
        <ShimmerElementsGroup
          backgroundColor={backgroundColor}
          flexWrap
          width="100%"
          shimmerElements={[
            { type: ShimmerElementType.line, width: "100%", height: 15, verticalAlign: "bottom" },
            { type: ShimmerElementType.line, width: "90%", height: 12 },
            { type: ShimmerElementType.gap, width: "10%", height: 20 },
          ]}
        />
      </div>
    );
  };

  const getCustomElements2 = (backgroundColor) => {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
        <ShimmerElementsGroup
          backgroundColor={backgroundColor}
          flexWrap
          width={"100%"}
          shimmerElements={[
            { type: ShimmerElementType.line, width: "98%", height: 20 },
            { type: ShimmerElementType.gap, width: "2%", height: 35 },
            { type: ShimmerElementType.line, width: "100%", height: 20 },
          ]}
        />
        <ShimmerElementsGroup
          flexWrap
          width={"100%"}
          shimmerElements={[
            { type: ShimmerElementType.line, width: "98%", height: 20, verticalAlign: "bottom" },
            { type: ShimmerElementType.gap, width: "2%", height: 30 },
          ]}
        />
      </div>
    );
  };

  const classNames = mergeStyleSets({
    wrapper: {
      selectors: {
        "& > .ms-Shimmer-container": {
          margin: "10px 0",
        },
      },
    },
    themedBackgroundWrapper: {
      padding: 20,
      margin: "10px 0",
      height: 130,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "stretch",
      // using the palette color to match the gaps and borders of the shimmer.
      background: customThemeForShimmer.palette.white,
      selectors: {
        "& > .ms-Shimmer-container": {
          flexGrow: 1,
        },
      },
    },
    indent: {
      paddingLeft: 18,
    },
  });

  return (
    <div className="container min-vh-100">
      <div className="vtHeader clearfix bg-light py-3">
        <div className="card border-0" style={{ borderRadius: "0" }}>
          <div className="card-body">
            <div className="row">
              <div className="col-10 text-truncate">
                <span style={{ fontSize: "17px" }}> {"Welcome " + userName} </span>
              </div>
              <div className="col-2 text-end">
                <a
                  href="#"
                  onClick={() => {
                    // eslint-disable-next-line react/prop-types
                    props.onLogout();
                  }}
                  style={{ textDecoration: "none", color: "#172b4d" }}
                >
                  <GrPowerShutdown style={{ fontSize: "25px" }} title="Logout" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* eslint-disable-next-line react/prop-types */}
      {Loading ? (
        <>
          <ThemeProvider theme={customThemeForShimmer}>
            <div className={classNames.themedBackgroundWrapper}>
              <Shimmer customElementsGroup={getCustomElements()} width="300" />
            </div>
          </ThemeProvider>
          <ThemeProvider theme={customThemeForShimmer}>
            <div className={classNames.themedBackgroundWrapper}>
              <Shimmer customElementsGroup={getCustomElements2()} width="300" />
            </div>
          </ThemeProvider>
        </>
      ) : recordExist ? (
        <EditMode
          entity_info={recordExist}
          firstname={firstname}
          lastname={lastname}
          fromEmail={fromEmail}
          onCheckingMail={checkingMailHandler}
          {...props}
        />
      ) : (
        <CreateMode
          firstname={firstname}
          lastname={lastname}
          fromEmail={fromEmail}
          onCheckingMail={checkingMailHandler}
          {...props}
        />
      )}
    </div>
  );
};

export default Home;
