import React, { useEffect, useState } from "react";
import EntityDetail from "./EntityDetail";
import Activities from "./Activities";
import AddCommentForm from "./AddCommentForm";
import BsLoader from "./BsLoader";
// import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import { FaPencilAlt } from "react-icons/fa";
import { HiLink } from "react-icons/hi";
import { SlArrowRight } from "react-icons/sl";
// import { BsThreeDotsVertical } from "react-icons/bs";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
// import { MdOutlineMarkEmailRead } from "react-icons/md";
// import { IoIosContact } from "react-icons/io";
import RenderEntityForm from "./RenderEntityForm";
import InvoiceList from "./InvoiceList";
import WorkOrderList from "./WorkOrderList";
import { useIndexedDBStore } from "use-indexeddb";
import RenderRelatedTabInfo from "./RenderRelatedTabInfo";
import { renderIcon } from "./Utils/Common";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { useBoolean } from "@fluentui/react-hooks";

import { toast } from "react-toastify";

import {
  Shimmer,
  ShimmerElementsGroup,
  ShimmerElementType,
  mergeStyleSets,
  createTheme,
  ThemeProvider,
} from "@fluentui/react";

import ShowHeadFields from "./ShowHeadFields";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EditMode = (props) => {
  // eslint-disable-next-line react/prop-types
  let entity_info = props.entity_info;

  const { getByID } = useIndexedDBStore("users");
  // eslint-disable-next-line react/prop-types, @typescript-eslint/no-unused-vars
  const [EditRecordId, setEditRecordId] = useState(props.entity_info.crmid);
  // eslint-disable-next-line react/prop-types, @typescript-eslint/no-unused-vars
  const [EditRecordModule, setEditRecordModule] = useState(props.entity_info.module);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showForm, setShowForm] = useState(false);
  // const [doEdit, setEditCrmId] = useState(0);

  const [ShowDetail, setShowDetail] = useState(false);

  const [ShowActivities, setShowActivities] = useState(false);

  const [ShowInvoice, setShowInvoice] = useState(false);

  const [WorkOrder, setShowWorkOrder] = useState(false);

  const [loading, setLoading] = useState(false);

  const [ShowComment, setShowComment] = useState(false);

  const [RelatedTabs, setRelatedTabs] = useState([]);

  const [LoadingRelatedTabs, setLoadingRelatedTabs] = useState(true);

  const [ShowRelatedModuleInfo, setShowRelatedModuleInfo] = useState(false);

  const [RelatedModule, setRelatedModule] = useState("");

  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);

  const CancelClickHandler = () => {
    setShowForm(false);
  };

  const DetailCancelHandler = () => {
    setShowDetail(false);
  };

  useEffect(() => {
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      let api_url = crm_url + "/modules/OutlookAddIn/api/getRelatedTabModulesList.php";
      axios
        .request({
          method: "POST",
          url: api_url,
          params: { module: EditRecordModule, record: EditRecordId },
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
            setRelatedTabs(data.data);
            setLoadingRelatedTabs(false);
          }
          setLoading(false);
        })
        .catch(() => {});
    });
  }, []);

  const ActivityCancelHandler = () => {
    setShowActivities(false);
  };

  const EditRecordHandler = () => {
    setShowForm(true);
  };

  const renderModuleForm = () => {
    switch (EditRecordModule) {
      case "Contacts":
        return (
          <RenderEntityForm
            onCancelClick={CancelClickHandler}
            module={EditRecordModule}
            crmid={EditRecordId}
            // eslint-disable-next-line react/prop-types
            onLogout={props.onLogout}
          />
        );
      case "Accounts":
        return (
          <RenderEntityForm
            onCancelClick={CancelClickHandler}
            module={EditRecordModule}
            crmid={EditRecordId}
            // eslint-disable-next-line react/prop-types
            onLogout={props.onLogout}
          />
        );
      case "Leads":
        return (
          <RenderEntityForm
            onCancelClick={CancelClickHandler}
            module={EditRecordModule}
            crmid={EditRecordId}
            // eslint-disable-next-line react/prop-types
            onLogout={props.onLogout}
          />
        );
      default:
        return <h1>No match Found</h1>;
    }
  };

  const renderModuleDetail = () => {
    switch (EditRecordModule) {
      case "Contacts":
        return (
          <EntityDetail
            onCancelClick={DetailCancelHandler}
            module={EditRecordModule}
            crmid={EditRecordId}
            onEditClick={EditRecordHandler}
            // eslint-disable-next-line react/prop-types
            onLogout={props.onLogout}
          />
        );
      case "Accounts":
        return (
          <EntityDetail
            onCancelClick={DetailCancelHandler}
            module={EditRecordModule}
            crmid={EditRecordId}
            // eslint-disable-next-line react/prop-types
            onLogout={props.onLogout}
            onEditClick={EditRecordHandler}
          />
        );
      case "Leads":
        return (
          <EntityDetail
            onCancelClick={DetailCancelHandler}
            module={EditRecordModule}
            crmid={EditRecordId}
            // eslint-disable-next-line react/prop-types
            onLogout={props.onLogout}
            onEditClick={EditRecordHandler}
          />
        );

      default:
        return <h1>No match Found</h1>;
    }
  };

  const renderModuleActivity = () => {
    return (
      <Activities
        onCancelClick={ActivityCancelHandler}
        module={EditRecordModule}
        crmid={EditRecordId}
        // eslint-disable-next-line react/prop-types
        onLogout={props.onLogout}
      />
    );
  };

  // const [saved_to, setSavedTo] = useState(props.entity_info.label);
  // eslint-disable-next-line react/prop-types
  // let saved_to = props.fromEmail;
  // eslint-disable-next-line react/prop-types
  // let fullname = props.entity_info.label;
  // let fullname = props.firstname + " " + props.lastname;
  // eslint-disable-next-line no-undef
  const myDate = Office.context.mailbox.item.dateTimeCreated;

  // eslint-disable-next-line no-undef
  const myLocalDictionaryDate = Office.context.mailbox.convertToLocalClientTime(myDate);
  // eslint-disable-next-line no-undef
  var mailbox_detail = Office.context.mailbox.item;

  let attchment_token = "";
  // Link to full sample: https://raw.githubusercontent.com/OfficeDev/office-js-snippets/prod/samples/outlook/85-tokens-and-service-calls/basic-rest-cors.yaml
  // eslint-disable-next-line no-undef
  Office.context.mailbox.getCallbackTokenAsync({ isRest: true }, function (result) {
    // eslint-disable-next-line no-undef
    attchment_token = result.value;
  });

  const LinkMailHandler = () => {
    toggleHideDialog();

    setLoading(true);

    let body_des = "";
    // eslint-disable-next-line no-undef
    mailbox_detail.body.getAsync(Office.CoercionType.Html, function (asyncResult) {
      // eslint-disable-next-line no-undef
      if (asyncResult.status !== Office.AsyncResultStatus.Succeeded) {
        // do something with the error
      } else {
        body_des = asyncResult.value;
      }

      getByID(1).then((res) => {
        let crm_url = res.crm_url;
        let current_user = res.userid;

        // console.log("EWS URL: " + Office.context.mailbox.ewsUrl);
        const obj = {
          dateTimeCreated: myLocalDictionaryDate,
          assigned_user_id: current_user,
          subject: mailbox_detail.subject,
          from_email: mailbox_detail.from.emailAddress,
          description: body_des,
          saved_toid: mailbox_detail.to[0].emailAddress,
          parent_id: EditRecordId,
          messageid: mailbox_detail.itemId,
          source: "Outlook Addon",
          callbackTokenForAttachments: attchment_token,
          // eslint-disable-next-line no-undef
          ewsUrl: Office.context.mailbox.ewsUrl,
        };

        const apiUrl = crm_url + "/modules/OutlookAddIn/api/ArchiveEmail.php";
        axios({
          method: "POST",
          url: apiUrl,
          headers: {
            "Content-Type": "application/json",
          },
          data: { values: JSON.stringify(obj) },
        })
          .then((response) => {
            setLoading(false);
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
            } else if (response.data.success === true) {
              toast.success("Mail Attached Successfully", {
                closeOnClick: true,
                pauseOnHover: true,
                theme: "colored",
                autoClose: 7000,
              });
            }
          })
          .catch(() => {
            setLoading(false);
            toast.error("Something went wrong. Please try again later.", {
              closeOnClick: true,
              pauseOnHover: true,
              theme: "colored",
              autoClose: 7000,
            });
            // setError("");
          });
      });
    });
  };

  const CommentCancelHandler = () => {
    setShowComment(false);
  };

  const InvoiceCancelHandler = () => {
    setShowInvoice(false);
  };

  const WorkOrderCancelHandler = () => {
    setShowWorkOrder(false);
  };

  const relatedModuleInfo = (relModule) => {
    if (relModule === "Calendar") {
      setShowActivities(true);
    } else if (relModule === "ModComments") {
      setShowComment(true);
    } else if (relModule === "Detail") {
      setShowDetail(true);
    } else {
      setRelatedModule(relModule);
      setShowRelatedModuleInfo(true);
    }
  };

  const cancelRelatedModuleInfo = () => {
    setShowRelatedModuleInfo(false);
  };

  const renderRelatedTads = () => {
    return (
      <>
        {Object.entries(RelatedTabs).map(([keys, fields]) => {
          return (
            <li
              className="list-group-item list-group-item-action"
              key={keys}
              style={{ borderLeft: 0, borderRight: 0, borderTop: 0 }}
            >
              <a
                href="#"
                onClick={() => {
                  relatedModuleInfo(keys);
                }}
                style={{ textDecoration: "none", color: "#172b4d" }}
              >
                <div className="row">
                  <div className="float-lg-start col-3">{renderIcon(keys)}</div>
                  <div className="col-7 ps-0"> {fields} </div>
                  <div className="text-end col-2">
                    <SlArrowRight />
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </>
    );
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

  const modalPropsStyles = { main: { maxHeight: 80, minHeight: 135 } };

  const modalProps = React.useMemo(
    () => ({
      styles: modalPropsStyles,
      isModeless: true,
      isDarkOverlay: true,
    }),
    []
  );

  const dialogContentProps = {
    type: DialogType.normal,
    subText: "Are you sure you want to Link this Mails?",
  };

  return (
    <div className="">
      <Dialog
        hidden={hideDialog}
        onDismiss={toggleHideDialog}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
      >
        <DialogFooter style={{ justifyContent: "center" }}>
          <Button className="btn-sm" variant="success" onClick={LinkMailHandler} style={{ borderRadius: "0" }}>
            Yes
          </Button>
          <Button className="btn-sm" variant="danger" onClick={toggleHideDialog} style={{ borderRadius: "0" }}>
            No
          </Button>
        </DialogFooter>
      </Dialog>
      {showForm ? (
        <div>{renderModuleForm()}</div>
      ) : ShowInvoice ? (
        <InvoiceList
          onCancelClick={InvoiceCancelHandler}
          module={EditRecordModule}
          crmid={EditRecordId}
          // eslint-disable-next-line react/prop-types
          onLogout={props.onLogout}
        ></InvoiceList>
      ) : WorkOrder ? (
        <WorkOrderList
          onCancelClick={WorkOrderCancelHandler}
          module={EditRecordModule}
          crmid={EditRecordId}
          // eslint-disable-next-line react/prop-types
          onLogout={props.onLogout}
        ></WorkOrderList>
      ) : (
        <>
          {loading && <BsLoader />}
          <div className="card mb-3 border-0" style={{ borderRadius: "0" }}>
            <div className="card-body">
              <div className="row">
                {/* <div className="col-9 text-truncate" style={{ textTransform: "capitalize", fontSize: "17px" }}> */}
                {/* {fullname} */}
                {/* eslint-disable-next-line react/prop-types */}
                <ShowHeadFields data={props.entity_info} />
                {/* </div> */}
                <div className="col-3 text-end">
                  <ButtonGroup size="sm">
                    {/* eslint-disable-next-line react/prop-types */}
                    {entity_info.updateable == true && (
                      <Button style={{ background: "transparent", border: "0px" }}>
                        <a href="#" onClick={EditRecordHandler} title="Edit" style={{ color: "#172b4d" }}>
                          <FaPencilAlt />
                        </a>
                      </Button>
                    )}
                    <Button style={{ background: "transparent", border: "0px" }}>
                      <a href="#" onClick={toggleHideDialog} title="Attach mail" style={{ color: "#172b4d" }}>
                        <HiLink />
                      </a>
                    </Button>
                  </ButtonGroup>
                  {/* <Dropdown>
                    <Dropdown.Toggle
                      className="btn"
                      id="dropdown-basic"
                      style={{
                        backgroundColor: "transparent",
                        border: 0,
                        color: "black",
                      }}
                    >
                      <BsThreeDotsVertical />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item href="#" onClick={EditRecordHandler}>
                        <FaPencilAlt />
                        &nbsp;Edit
                      </Dropdown.Item>
                      <Dropdown.Item href="#" onClick={LinkMailHandler}>
                        <HiLink />
                        &nbsp;Attach Email
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown> */}
                </div>
              </div>
              {/* <div className="">
                <div className="col-12 text-truncate mb-1"> {saved_to} </div>
              </div> */}
            </div>
          </div>
          {LoadingRelatedTabs && (
            <ThemeProvider theme={customThemeForShimmer}>
              <div className={classNames.themedBackgroundWrapper}>
                <Shimmer customElementsGroup={getCustomElements2()} width="300" />
              </div>
            </ThemeProvider>
          )}
          {!LoadingRelatedTabs && ShowDetail ? (
            <div>{renderModuleDetail()}</div>
          ) : ShowRelatedModuleInfo ? (
            <RenderRelatedTabInfo related_module={RelatedModule} onCancelClick={cancelRelatedModuleInfo} {...props} />
          ) : ShowActivities ? (
            <>{renderModuleActivity()}</>
          ) : ShowComment ? (
            <AddCommentForm
              onCancelClick={CommentCancelHandler}
              module={EditRecordModule}
              crmid={EditRecordId}
              // eslint-disable-next-line react/prop-types
              onLogout={props.onLogout}
            ></AddCommentForm>
          ) : (
            <div className="card border-0" style={{ borderRadius: "0" }}>
              <div className="card-body">
                <ul
                  className="list-group"
                  style={{
                    borderRadius: "0px",
                  }}
                >
                  {renderRelatedTads()}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EditMode;
