import React, { useState, useEffect } from "react";
import axios from "axios";
import RowTextField from "./RowTextField";
import RowTextAreaField from "./RowTextAreaField";
import RowPickListField from "./RowPickListField";
import RowReferenceField from "./RowReferenceField";
import RowOwnerField from "./RowOwnerField";
import RowBooleanField from "./RowBooleanField";
import RowDateField from "./RowDateField";
import RowEmailField from "./RowEmailField";
import RowMultipicklistField from "./RowMultipicklistField";
import { useIndexedDBStore } from "use-indexeddb";
import { Shimmer, ShimmerElementType, mergeStyleSets, createTheme } from "@fluentui/react";
import { toast } from "react-toastify";

const RenderEntityForm = (props) => {
  const { getByID } = useIndexedDBStore("users");
  // eslint-disable-next-line react/prop-types
  const module = props.module;

  const CancelClickHandler = () => {
    // eslint-disable-next-line react/prop-types
    props.onCancelClick();
  };

  const [validated, setValidated] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [crmFields, setCrmFields] = useState([]);

  const [recordDetail, setCrmRecord] = useState([]);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() === true) {
      const formData = new FormData(event.target);
      const formDataObj = Object.fromEntries(formData.entries());
      getByID(1).then((res) => {
        let crm_url = res.crm_url;
        if (crm_url !== "" && crm_url !== undefined) {
          const apiUrl = crm_url + "/modules/OutlookAddIn/api/save_entity.php";
          setSaving(true);
          axios
            .request({
              method: "POST",
              url: apiUrl,
              params: formDataObj,
            })
            .then((response) => {
              setSaving(false);
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
                  toast.warn(response.data.message, {
                    closeOnClick: true,
                    pauseOnHover: true,
                    theme: "colored",
                    autoClose: 7000,
                  });
                }
              } else {
                toast.success("Successfully Saved", {
                  closeOnClick: true,
                  pauseOnHover: true,
                  theme: "colored",
                  autoClose: 7000,
                });
                // eslint-disable-next-line react/prop-types
                props.onCancelClick();
                // eslint-disable-next-line react/prop-types
                props.onCheckingMail();
              }
            })
            .catch(() => {});
        }
      });
    }

    setValidated(true);
  };

  useEffect(() => {
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      if (crm_url !== "" && crm_url !== undefined) {
        let api_url = crm_url + "/modules/OutlookAddIn/api/getOutlookEnabledFields.php";
        setLoading(true);
        axios
          .request({
            method: "POST",
            url: api_url,
            params: { module: module, mode: "Edit" },
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
              setCrmFields(data.fields);
              setLoading(false);
            }
          })
          .catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react/prop-types
    if (props.crmid !== undefined && props.crmid.length > 0) {
      setLoading(true);
      getByID(1).then((res) => {
        let crm_url = res.crm_url;
        let api_url = crm_url + "/modules/OutlookAddIn/api/getRecordDetails.php";
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
          .catch(() => {});
      });
    }
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
    <>
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
        <>
          <div className="card py-2 border-0 mb-3" style={{ borderRadius: "0" }}>
            <div className="container">
              <div className="row">
                <span>
                  <h4>
                    {recordDetail !== undefined && Object.keys(recordDetail).length > 0
                      ? `${recordDetail.label}`
                      : `Creating ${module}`}
                  </h4>
                </span>
              </div>
            </div>
          </div>
          <div className="card pb-3 border-0" style={{ borderRadius: "0" }}>
            <div className="container">
              <form
                className={`${validated ? "was-validated" : "needs-validation"}`}
                noValidate
                // eslint-disable-next-line react/no-unknown-property
                // validated={validated}
                onSubmit={handleSubmit}
              >
                <input type="hidden" name="module" value={module} />
                {/* eslint-disable-next-line react/prop-types, no-prototype-builtins */}
                {recordDetail && recordDetail.hasOwnProperty("id") > 0 && (
                  <>
                    <input type="hidden" name="mode" value="edit" />
                    <input type="hidden" name="record" value={recordDetail["id"]} />
                  </>
                )}
                {crmFields.map((fields, key) => {
                  if (fields.type !== "selection" && fields.type !== "subject") {
                    // eslint-disable-next-line no-lone-blocks
                    {
                      switch (fields.type) {
                        case "string":
                          return (
                            <div key={key}>
                              <RowTextField
                                {...props}
                                fieldLabel={fields.label}
                                fieldName={fields.name}
                                fieldMandatory={fields.mandatory}
                                data={recordDetail}
                              />
                            </div>
                          );
                        case "salutation":
                          return (
                            <div key={key}>
                              <RowTextField
                                {...props}
                                fieldLabel={fields.label}
                                fieldName={fields.name}
                                fieldMandatory={fields.mandatory}
                                data={recordDetail}
                              />
                            </div>
                          );
                        case "phone":
                          return (
                            <div key={key}>
                              <RowTextField
                                {...props}
                                fieldLabel={fields.label}
                                fieldName={fields.name}
                                fieldMandatory={fields.mandatory}
                                data={recordDetail}
                              />
                            </div>
                          );
                        case "picklist": {
                          let picklist = fields.picklistvalues;
                          return (
                            <div key={key}>
                              <RowPickListField
                                {...props}
                                fieldLabel={fields.label}
                                fieldName={fields.name}
                                fieldMandatory={fields.mandatory}
                                pickListValues={picklist}
                                data={recordDetail}
                              />
                            </div>
                          );
                        }
                        case "multipicklist": {
                          let picklist = fields.picklistvalues;
                          return (
                            <div key={key}>
                              <RowMultipicklistField
                                {...props}
                                fieldLabel={fields.label}
                                fieldName={fields.name}
                                fieldMandatory={fields.mandatory}
                                pickListValues={picklist}
                                data={recordDetail}
                              />
                            </div>
                          );
                        }
                        case "reference": {
                          let referencemodule = fields.referencemodules[0];
                          return (
                            <div key={key}>
                              <RowReferenceField
                                {...props}
                                fieldLabel={fields.label}
                                fieldName={fields.name}
                                fieldMandatory={fields.mandatory}
                                referenceModule={referencemodule}
                                data={recordDetail}
                              />
                            </div>
                          );
                        }
                        case "owner": {
                          let UsersPickList = fields.picklistvalues.Users;
                          let GroupsPickList = fields.picklistvalues.Groups;
                          return (
                            <div key={key}>
                              <RowOwnerField
                                {...props}
                                fieldLabel={fields.label}
                                fieldName={fields.name}
                                fieldMandatory={fields.mandatory}
                                UsersPickListValues={UsersPickList}
                                GroupPickListValues={GroupsPickList}
                                data={recordDetail}
                              />
                            </div>
                          );
                        }
                        case "boolean": {
                          return (
                            <div key={key}>
                              <RowBooleanField
                                {...props}
                                fieldLabel={fields.label}
                                fieldName={fields.name}
                                fieldMandatory={fields.mandatory}
                                data={recordDetail}
                              />
                            </div>
                          );
                        }
                        case "date": {
                          return (
                            <div key={key}>
                              <RowDateField
                                {...props}
                                fieldLabel={fields.label}
                                fieldName={fields.name}
                                fieldMandatory={fields.mandatory}
                                data={recordDetail}
                              />
                            </div>
                          );
                        }
                        case "email": {
                          return (
                            <div key={key}>
                              <RowEmailField
                                {...props}
                                fieldLabel={fields.label}
                                fieldName={fields.name}
                                fieldMandatory={fields.mandatory}
                                data={recordDetail}
                              />
                            </div>
                          );
                        }
                        case "text": {
                          return (
                            <div key={key}>
                              <RowTextAreaField
                                {...props}
                                fieldLabel={fields.label}
                                fieldName={fields.name}
                                fieldMandatory={fields.mandatory}
                                data={recordDetail}
                              />
                            </div>
                          );
                        }
                        default: {
                          return (
                            <div key={key}>
                              <></>
                            </div>
                          );
                        }
                      }
                    }
                  }
                })}
                <div className="mb-5 row"></div>
                <div className="py-3 text-center fixed-bottom bg-light">
                  {/* eslint-disable-next-line react/prop-types */}
                  {!props.isReadonly && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ borderRadius: "0" }}
                      disabled={saving}
                      type="submit"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  )}
                  <button id="cancel" name="cancel" className="btn btn-default" onClick={CancelClickHandler}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default RenderEntityForm;
