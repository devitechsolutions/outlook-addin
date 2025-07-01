import React, { useState, useEffect } from "react";
import axios from "axios";
import RowTextField from "./RowTextField";
import RowPickListField from "./RowPickListField";
import RowReferenceField from "./RowReferenceField";
import RowOwnerField from "./RowOwnerField";
import RowBooleanField from "./RowBooleanField";
import RowDateField from "./RowDateField";
import RowEmailField from "./RowEmailField";
import RowDateTimeField from "./RowDateTimeField";
import { useIndexedDBStore } from "use-indexeddb";
import { Shimmer, ShimmerElementType, mergeStyleSets, createTheme } from "@fluentui/react";
import { toast } from "react-toastify";

const TaskForm = (props) => {
  const { getByID } = useIndexedDBStore("users");
  // eslint-disable-next-line react/prop-types
  const crmid = props.crmid;

  // eslint-disable-next-line react/prop-types
  const module = props.module;

  // eslint-disable-next-line react/prop-types
  const record = props.record;

  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(false);

  const [validated, setValidated] = useState(false);

  const [crmFields, setCrmFields] = useState([]);

  const [recordDetail, setCrmRecord] = useState([]);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === true) {
      const formData = new FormData(event.target);
      const formDataObj = Object.fromEntries(formData.entries());
      setSaving(true);
      getByID(1).then((res) => {
        let crm_url = res.crm_url;
        if (crm_url !== "" && crm_url !== undefined) {
          const apiUrl = crm_url + "/modules/OutlookAddIn/api/save_entity.php";
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
                  toast.error(response.data.message, {
                    closeOnClick: true,
                    pauseOnHover: true,
                    theme: "colored",
                    autoClose: 7000,
                    width: 90,
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
                props.onFormCancelClick();
              }
            })
            .catch(() => {});
        }
      });
    }

    setValidated(true);
  };

  // useEffect(() => {
  //   // eslint-disable-next-line react/prop-types
  //   if (props.record.length > 0) {
  //     setLoading(true);
  //     getByID(1).then((res) => {
  //       let crm_url = res.crm_url;
  //       let api_url = crm_url + "/modules/MSOutlook/api/getRecordDetails.php";
  //       axios
  //         .request({
  //           method: "POST",
  //           url: api_url,
  //           // eslint-disable-next-line react/prop-types
  //           params: { crmid: record, module: "Events" },
  //         })
  //         .then((response) => {
  //           if (response.data.success === false) {
  //             if (response.data.code === 100) {
  //               toast.error(response.data.message, {
  //                 closeOnClick: true,
  //                 pauseOnHover: true,
  //                 theme: "colored",
  //                 autoClose: 7000,
  //               });
  //               // eslint-disable-next-line react/prop-types
  //               props.onLogout();
  //             } else {
  //               toast.error(response.data.message, {
  //                 closeOnClick: true,
  //                 pauseOnHover: true,
  //                 theme: "colored",
  //                 autoClose: 7000,
  //               });
  //             }
  //           } else if (response.data.success === true) {
  //             let data = response.data;
  //             setCrmRecord(data.recordDetail);
  //           }
  //           setLoading(false);
  //         })
  //         .catch(() => {
  //           setLoading(false);
  //         });
  //     });
  //   }
  //   // eslint-disable-next-line react/prop-types
  // }, [props.record]);

  useEffect(() => {
    setLoading(true);
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      let api_url = crm_url + "/modules/OutlookAddIn/api/getOutlookEnabledFields.php";
      axios
        .request({
          method: "POST",
          url: api_url,
          params: { module: "Task" },
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
    });
  }, []);

  const CancelClickHandler = () => {
    // eslint-disable-next-line react/prop-types
    props.onFormCancelClick();
  };

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
        <div className="container py-3">
          <div className="row">
            <span>
              <h6>
                {recordDetail !== undefined && Object.keys(recordDetail).length > 0 ? "Edit Task" : "Create Task"}
              </h6>
            </span>
          </div>
          <form
            className={`${validated ? "was-validated" : "needs-validation"}`}
            noValidate
            // eslint-disable-next-line react/no-unknown-property
            // validated={validated}
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="module" value="Task" />
            {/* <input type="hidden" name="record" value={record} /> */}
            <input type="hidden" name="account_id" value={crmid} />
            {/* {crmFields.map((fields, index) => { */}
            {Object.entries(crmFields).map(([keys, fields]) => {
              if (fields.type !== "selection" && fields.type !== "subject") {
                // eslint-disable-next-line no-lone-blocks
                {
                  switch (fields.type) {
                    case "string":
                      return (
                        <div key={keys}>
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
                        <div key={keys}>
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
                        <div key={keys}>
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
                        <div key={keys}>
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
                    case "reference": {
                      let referencemodule = fields.referencemodules[0];
                      return (
                        <div key={keys}>
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
                        <div key={keys}>
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
                        <div key={keys}>
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
                        <div key={keys}>
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
                        <div key={keys}>
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
                    case "datetime": {
                      return (
                        <div key={keys}>
                          <RowDateTimeField
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
                        <div key={keys}>
                          <RowTextField
                            {...props}
                            fieldLabel={fields.label}
                            fieldName={fields.name}
                            fieldMandatory={fields.mandatory}
                            data={recordDetail}
                          />
                        </div>
                      );
                    }
                    default:
                      <div key={keys}></div>;
                  }
                }
              }
            })}
            <br />
            <div className="py-1 text-center fixed-bottom bg-white">
              <button className="btn btn-sm btn-primary" disabled={saving} type="submit" style={{ borderRadius: "0" }}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button id="cancel" name="cancel" className="btn btn-default" onClick={CancelClickHandler}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default TaskForm;
