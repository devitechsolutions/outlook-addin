import React, { useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useIndexedDBStore } from "use-indexeddb";
import { BsListStars } from "react-icons/bs";
import { MdMarkEmailRead } from "react-icons/md";
import axios from "axios";
import EmailDetail from "./EmailDetail";
import { Shimmer, ShimmerElementType, mergeStyleSets, createTheme } from "@fluentui/react";
import { MdArrowBackIosNew } from "react-icons/md";
import { toast } from "react-toastify";

const EmailsTable = (props) => {
  const { getByID } = useIndexedDBStore("users");

  // eslint-disable-next-line react/prop-types
  const EmailsData = props.data;

  const [recordDetail, setCrmRecord] = useState([]);

  const [showDetail, setShowDetail] = useState(false);

  const [loading, setLoading] = useState(false);

  const onCancelClick = () => {
    setShowDetail(false);
  };

  const ShowMailDetil = (id) => {
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      let api_url = crm_url + "/modules/OutlookAddIn/api/getRecordDetails.php";
      setLoading(true);
      axios
        .request({
          method: "POST",
          url: api_url,
          // eslint-disable-next-line react/prop-types
          params: { crmid: id, module: "Emails" },
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
            setShowDetail(true);
            setLoading(false);
          }
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
      {showDetail ? (
        loading ? (
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
          <EmailDetail data={recordDetail} cancelHandler={onCancelClick} />
        )
      ) : (
        <>
          <div className="row">
            <div className="col-12">
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
          </div>
          <hr style={{ margin: "0.5rem 0" }} />
          <ListGroup defaultActiveKey="#link1">
            {Object.entries(EmailsData).map(([keys, fields]) => {
              // const firstTwoChars = fields.label.slice(0, 2);
              // const record = fields.id.split("x");
              return (
                <ListGroup.Item
                  className="py-3 "
                  action
                  key={keys}
                  style={{
                    borderTop: 0,
                    borderLeft: 0,
                    borderRight: 0,
                    borderRadius: 0,
                    paddingLeft: "1px",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <span
                      style={{
                        background: "#AAAAAA",
                        marginBottom: "4px",
                        color: "#fff",
                        width: "36px",
                        textAlign: "center",
                        padding: "8px 0",
                        textTransform: "uppercase",
                        fontSize: "14px",
                        display: "inline-block",
                        borderRadius: "50%",
                      }}
                    >
                      <MdMarkEmailRead style={{ fontSize: "18px", color: "#172b4d" }} />
                    </span>
                    <div className="ps-3 px-1 w-75">
                      <h6 className="text-truncate">{fields.label}</h6>
                      <span className="text-muted small">{fields.from_email}</span>
                    </div>
                    <div className="text-end text-truncate" style={{ paddingLeft: "10px" }}>
                      <a
                        href="#"
                        onClick={() => {
                          ShowMailDetil(fields.id);
                        }}
                      >
                        <BsListStars title="Show detail" style={{ fontSize: "20px", color: "#172b4d" }} />
                      </a>
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </>
      )}
    </>
  );
};

export default EmailsTable;
