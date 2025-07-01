import React, { useState, useEffect } from "react";
import axios from "axios";
import { useIndexedDBStore } from "use-indexeddb";
import { MdArrowBackIosNew } from "react-icons/md";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { Label } from "@fluentui/react/lib/Label";
import { Text } from "@fluentui/react/lib/Text";
import { Shimmer, ShimmerElementType, mergeStyleSets, createTheme } from "@fluentui/react";
import { toast } from "react-toastify";

const EntityDetail = (props) => {
  const { getByID } = useIndexedDBStore("users");
  // eslint-disable-next-line react/prop-types
  const module = props.module;

  const [crmFields, setCrmFields] = useState([]);

  const [recordDetail, setCrmRecord] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      let api_url = crm_url + "/modules/OutlookAddIn/api/getOutlookEnabledFields.php";
      axios
        .request({
          method: "POST",
          url: api_url,
          params: { module: module },
        })
        .then((response) => {
          if (response.data.success === false) {
            if (response.data.code === 100) {
              toast.error(response.data.message, {
                closeOnClick: true,
                pauseOnHover: true,
                theme: "colored",
                autoClose: 7000,
              });
              // eslint-disable-next-line react/prop-types
              props.onLogout();
            } else {
              toast.error(response.data.message, {
                closeOnClick: true,
                pauseOnHover: true,
                theme: "colored",
                autoClose: 7000,
              });
            }
          } else if (response.data.success === true) {
            let data = response.data;
            let fields = data.fields;
            let params1 = {
              type: "custom_date",
              label: "Modified Time",
              name: "modifiedtime",
            };
            let params2 = {
              type: "custom_date",
              label: "Created Time",
              name: "createdtime",
            };
            fields.push(params1);
            fields.push(params2);
            setCrmFields(fields);
          }
        })
        .catch(() => {});
    });
  }, []);

  useEffect(() => {
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      let api_url = crm_url + "/modules/OutlookAddIn/api/getRecordDetails.php";
      setLoading(true);
      axios
        .request({
          method: "POST",
          url: api_url,
          // eslint-disable-next-line react/prop-types
          params: { crmid: props.crmid, module: props.module },
        })
        .then((response) => {
          if (response.data.success === false) {
            if (response.data.code === 100) {
              toast.error(response.data.message, {
                closeOnClick: true,
                pauseOnHover: true,
                theme: "colored",
                autoClose: 7000,
              });
              // eslint-disable-next-line react/prop-types
              props.onLogout();
            } else {
              toast.error(response.data.message, {
                closeOnClick: true,
                pauseOnHover: true,
                theme: "colored",
                autoClose: 7000,
              });
            }
          } else if (response.data.success === true) {
            let data = response.data;
            setCrmRecord(data.recordDetail);
          }
          setLoading(false);
        })
        .catch(() => {
          toast.error("Authentication Failed", {
            closeOnClick: true,
            pauseOnHover: true,
            theme: "colored",
            autoClose: 7000,
          });
        });
    });
    // eslint-disable-next-line react/prop-types
  }, [props.crmid]);

  const customThemeForShimmer = createTheme({
    palette: {
      // palette slot used in Shimmer for main background
      neutralLight: "#eaeaea",
      // palette slot used in Shimmer for tip of the moving wave
      neutralLighter: "#d2dae2",
      // palette slot used in Shimmer for all the space around the shimmering elements
      white: "#dadada",
    },
  });

  const shimmerElements = [{ type: ShimmerElementType.line, height: 16 }];

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
      height: 30,
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
    <div className="card py-3 border-0" style={{ borderRadius: "0" }}>
      <div className="container">
        <div className="row">
          <div className="col-6">
            <a
              href="#"
              onClick={() => {
                // eslint-disable-next-line react/prop-types
                props.onCancelClick();
              }}
              style={{ textDecoration: "none" }}
            >
              <MdArrowBackIosNew style={{ verticalAlign: "middle" }} />
              &nbsp;Back
            </a>
          </div>
          {/* <div className="col-6 text-end">
            <a
              href="#"
              className="text-end"
              onClick={() => {
                // eslint-disable-next-line react/prop-types
                props.onEditClick();
              }}
              style={{
                textDecoration: "none",
              }}
            >
              Edit
            </a>
          </div> */}
        </div>
        <hr style={{ margin: "0.5rem 0" }} />
        {loading ? (
          <>
            <Shimmer />
            <div className={classNames.themedBackgroundWrapper}>
              <Shimmer
                shimmerColors={{
                  shimmer: customThemeForShimmer.palette.neutralLight,
                  shimmerWave: customThemeForShimmer.palette.neutralLighter,
                  background: customThemeForShimmer.palette.white,
                }}
                shimmerElements={shimmerElements}
              />
            </div>
            <Shimmer />
            <div className={classNames.themedBackgroundWrapper}>
              <Shimmer
                shimmerColors={{
                  shimmer: customThemeForShimmer.palette.neutralLight,
                  shimmerWave: customThemeForShimmer.palette.neutralLighter,
                  background: customThemeForShimmer.palette.white,
                }}
                shimmerElements={shimmerElements}
              />
            </div>
            <Shimmer />
            <div className={classNames.themedBackgroundWrapper}>
              <Shimmer
                shimmerColors={{
                  shimmer: customThemeForShimmer.palette.neutralLight,
                  shimmerWave: customThemeForShimmer.palette.neutralLighter,
                  background: customThemeForShimmer.palette.white,
                }}
                shimmerElements={shimmerElements}
              />
            </div>
          </>
        ) : (
          <form>
            {crmFields.map((fields, key) => {
              if (fields.type !== "selection" && fields.type !== "subject") {
                // eslint-disable-next-line no-lone-blocks
                {
                  switch (fields.type) {
                    case "string":
                      return (
                        <div className="row" key={key}>
                          <div className="col-1">
                            <BsFillInfoCircleFill style={{ verticalAlign: "middle", color: "#b1b1b1" }} />
                          </div>
                          <div className="col-11">
                            <div className="mb-3">
                              <Label
                                disabled
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "unset",
                                  paddingTop: "3px",
                                }}
                              >
                                {fields.label}
                              </Label>
                              <Text nowrap block>
                                {recordDetail[fields.name]}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    case "salutation":
                      return (
                        <div className="row" key={key}>
                          <div className="col-1">
                            <BsFillInfoCircleFill style={{ verticalAlign: "middle", color: "#b1b1b1" }} />
                          </div>
                          <div className="col-11">
                            <div className="mb-3">
                              <Label
                                disabled
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "unset",
                                  paddingTop: "3px",
                                }}
                              >
                                {fields.label}
                              </Label>
                              <Text nowrap block>
                                {recordDetail[fields.name]}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    case "phone":
                      return (
                        <div className="row" key={key}>
                          <div className="col-1">
                            <BsFillInfoCircleFill style={{ verticalAlign: "middle", color: "#b1b1b1" }} />
                          </div>
                          <div className="col-11">
                            <div className="mb-3">
                              <Label
                                disabled
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "unset",
                                  paddingTop: "3px",
                                }}
                              >
                                {fields.label}
                              </Label>
                              <Text nowrap block>
                                {recordDetail[fields.name]}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    case "picklist": {
                      return (
                        <div className="row" key={key}>
                          <div className="col-1">
                            <BsFillInfoCircleFill style={{ verticalAlign: "middle", color: "#b1b1b1" }} />
                          </div>
                          <div className="col-11">
                            <div className="mb-3" key={key}>
                              <Label
                                disabled
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "unset",
                                  paddingTop: "3px",
                                }}
                              >
                                {fields.label}
                              </Label>
                              <Text nowrap block>
                                {recordDetail[fields.name]}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    case "reference": {
                      let ref_field_info = recordDetail[fields.name];
                      let ref_field_value = "";
                      if (Object.keys(recordDetail).length > 0 && ref_field_info.label !== "undefined") {
                        ref_field_value = ref_field_info.label;
                      }
                      return (
                        <div className="row" key={key}>
                          <div className="col-1">
                            <BsFillInfoCircleFill style={{ verticalAlign: "middle", color: "#b1b1b1" }} />
                          </div>
                          <div className="col-11">
                            <div className="mb-3" key={key}>
                              <Label
                                disabled
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "unset",
                                  paddingTop: "3px",
                                }}
                              >
                                {fields.label}
                              </Label>
                              <Text nowrap block>
                                {ref_field_value}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    case "owner": {
                      return (
                        <div className="row" key={key}>
                          <div className="col-1">
                            <BsFillInfoCircleFill style={{ verticalAlign: "middle", color: "#b1b1b1" }} />
                          </div>
                          <div className="col-11">
                            <div className="mb-3" key={key}>
                              <Label
                                disabled
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "unset",
                                  paddingTop: "3px",
                                }}
                              >
                                {fields.label}
                              </Label>
                              <Text nowrap block>
                                {recordDetail["assigned_user_name"]}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    case "boolean": {
                      let boolval = "No";
                      if (recordDetail[fields.name] === "1") {
                        boolval = "Yes";
                      }
                      return (
                        <div className="row" key={key}>
                          <div className="col-1">
                            <BsFillInfoCircleFill style={{ verticalAlign: "middle", color: "#b1b1b1" }} />
                          </div>
                          <div className="col-11">
                            <div className="mb-3" key={key}>
                              <Label
                                disabled
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "unset",
                                  paddingTop: "3px",
                                }}
                              >
                                {fields.label}
                              </Label>
                              <Text nowrap block>
                                {boolval}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    case "date": {
                      return (
                        <div className="row" key={key}>
                          <div className="col-1">
                            <BsFillInfoCircleFill style={{ verticalAlign: "middle", color: "#b1b1b1" }} />
                          </div>
                          <div className="col-11">
                            <div className="mb-3" key={key}>
                              <Label
                                disabled
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "unset",
                                  paddingTop: "3px",
                                }}
                              >
                                {fields.label}
                              </Label>
                              <Text nowrap block>
                                {recordDetail[fields.name]}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    case "email": {
                      return (
                        <div className="row" key={key}>
                          <div className="col-1">
                            <BsFillInfoCircleFill style={{ verticalAlign: "middle", color: "#b1b1b1" }} />
                          </div>
                          <div className="col-11">
                            <div className="mb-3" key={key}>
                              <Label
                                disabled
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "unset",
                                  paddingTop: "3px",
                                }}
                              >
                                {fields.label}
                              </Label>
                              <Text nowrap block>
                                {recordDetail[fields.name]}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    case "custom_date": {
                      return (
                        <div className="row" key={key}>
                          <div className="col-1">
                            <BsFillInfoCircleFill style={{ verticalAlign: "middle", color: "#b1b1b1" }} />
                          </div>
                          <div className="col-11">
                            <div className="mb-3" key={key}>
                              <Label
                                disabled
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "unset",
                                  paddingTop: "3px",
                                }}
                              >
                                {fields.label}
                              </Label>
                              <Text nowrap block>
                                {recordDetail[fields.name]}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    default:
                      <></>;
                  }
                }
              }
            })}
            <div className="mb-5"></div>
            {/* <div className="py-1 text-center fixed-bottom bg-light">
              <button id="cancel" name="cancel" className="btn btn-default" onClick={CancelClickHandler}>
                Back
              </button>
            </div> */}
          </form>
        )}
      </div>
    </div>
  );
};

export default EntityDetail;
