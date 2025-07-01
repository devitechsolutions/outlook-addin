import React, { useState, useEffect } from "react";
import { useIndexedDBStore } from "use-indexeddb";
import axios from "axios";
import Button from "react-bootstrap/Button";
import {
  Shimmer,
  ShimmerElementsGroup,
  ShimmerElementType,
  mergeStyleSets,
  createTheme,
  ThemeProvider,
} from "@fluentui/react";
import { toast } from "react-toastify";

const ModuleList = (props) => {
  const [loading, setLoading] = useState(true);

  const [EnableModule, setEnableModule] = useState({});

  const { getByID } = useIndexedDBStore("users");

  useEffect(() => {
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      if (crm_url !== "" && crm_url !== undefined) {
        let api_url = crm_url + "/modules/OutlookAddIn/api/getEnableModule.php";
        axios
          .request({
            method: "POST",
            url: api_url,
          })
          .then((response) => {
            let data = response.data;
            setLoading(false);
            if (data.success === true) {
              setEnableModule(data.modules);
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
                // eslint-disable-next-line react/prop-types
                props.onLogout();
              }
            }
          })
          .catch(() => {});
      }
    });
  }, []);

  const moduleClickEvent = (module) => {
    if (module === "Account") {
      // eslint-disable-next-line react/prop-types
      props.onAccountClick();
    } else if (module === "Contact") {
      // eslint-disable-next-line react/prop-types
      props.onContactClick();
    } else if (module === "Lead") {
      // eslint-disable-next-line react/prop-types
      props.onLeadClick();
    }
  };

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
    <div>
      {loading ? (
        <ThemeProvider theme={customThemeForShimmer}>
          <div className={classNames.themedBackgroundWrapper}>
            <Shimmer customElementsGroup={getCustomElements2()} width="300" />
          </div>
        </ThemeProvider>
      ) : Object.keys(EnableModule).length > 0 ? (
        <div className="card py-3 border-0" style={{ borderRadius: "0" }}>
          <div className="d-grid gap-2">
            {Object.keys(EnableModule).map((mod, k) => {
              return (
                <div className="row" key={k}>
                  <span className="d-flex justify-content-center" role="button" data-name="create_contact">
                    <Button
                      variant="primary"
                      style={{
                        borderRadius: "0px",
                        fontSize: "small",
                        width: "80%",
                      }}
                      onClick={() => {
                        moduleClickEvent(mod);
                      }}
                    >
                      CREATE A NEW {mod.toUpperCase()}
                    </Button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>Configure MSOutlook module in the settings</>
      )}
    </div>
  );
};

export default ModuleList;
