import React from "react";
// import { MdMarkEmailRead } from "react-icons/md";
// import { BsFillInfoCircleFill } from "react-icons/bs";
import { Label } from "@fluentui/react/lib/Label";
import { Text } from "@fluentui/react/lib/Text";
// import ReactHtmlParser from "react-html-parser";
import { MdArrowBackIosNew } from "react-icons/md";

const EmailDetail = (props) => {
  // eslint-disable-next-line react/prop-types
  const EmailsData = props.data;

  // eslint-disable-next-line react/prop-types
  let tomail = EmailsData.saved_toid.slice(2, -2);

  return (
    <>
      <div className="row">
        <div className="col-12">
          <a
            href="#"
            onClick={() => {
              // eslint-disable-next-line react/prop-types
              props.cancelHandler();
            }}
            style={{ textDecoration: "none" }}
          >
            <MdArrowBackIosNew style={{ verticalAlign: "middle" }} />
            &nbsp;Back
          </a>
        </div>
      </div>
      <hr style={{ margin: "0.5rem 0" }} />
      <div className="row">
        <div className="col-12">
          <div className="mb-1">
            <Label
              disabled
              style={{
                fontSize: "13px",
                fontWeight: "unset",
                paddingTop: "3px",
              }}
            >
              Subject
            </Label>
            <Text nowrap block>
              {/* eslint-disable-next-line react/prop-types */}
              <h6 style={{ fontSize: "13px" }}>{EmailsData.subject}</h6>
            </Text>
          </div>
        </div>
      </div>
      <hr style={{ margin: "5px 0" }} />
      <div className="row">
        <div className="col-12">
          <div className="mb-1">
            <Label
              disabled
              style={{
                fontSize: "13px",
                fontWeight: "unset",
                paddingTop: "3px",
              }}
            >
              From
            </Label>
            <Text nowrap block>
              {/* eslint-disable-next-line react/prop-types */}
              <h6 style={{ fontSize: "13px" }}>{EmailsData.from_email}</h6>
            </Text>
          </div>
        </div>
      </div>
      <hr style={{ margin: "5px 0" }} />
      <div className="row">
        <div className="col-12">
          <div className="mb-1">
            <Label
              disabled
              style={{
                fontSize: "13px",
                fontWeight: "unset",
                paddingTop: "3px",
              }}
            >
              To
            </Label>
            <Text nowrap block>
              <h6 style={{ fontSize: "13px" }}>{tomail}</h6>
            </Text>
          </div>
        </div>
      </div>
      <hr style={{ margin: "5px 0" }} />
      <div className="row">
        <div className="col-12">
          <div className="mb-1">
            <Label
              disabled
              style={{
                fontSize: "13px",
                fontWeight: "unset",
                paddingTop: "3px",
              }}
            >
              Attachments
            </Label>
            <Text>
              {/* eslint-disable-next-line react/prop-types */}
              {EmailsData.attachmentDetail !== undefined &&
                // eslint-disable-next-line react/prop-types
                Object.keys(EmailsData.attachmentDetail).length > 0 &&
                // eslint-disable-next-line react/prop-types
                Object.entries(EmailsData.attachmentDetail).map(([keys, fields]) => {
                  return (
                    <h6 key={keys} style={{ fontSize: "13px" }}>
                      <a href={fields.url} target="_blank" rel="noreferrer">
                        {fields.attachment}
                      </a>
                    </h6>
                  );
                })}
              {/* eslint-disable-next-line react/prop-types */}
              {EmailsData.attachmentDetail !== undefined && Object.keys(EmailsData.attachmentDetail).length <= 0 && (
                <span>No Attachment</span>
              )}
            </Text>
          </div>
        </div>
      </div>
      <hr style={{ margin: "5px 0" }} />
      <div className="row">
        <div className="col-12">
          <div className="mb-1">
            <Label
              disabled
              style={{
                fontSize: "13px",
                fontWeight: "unset",
                paddingTop: "3px",
              }}
            >
              Description
            </Label>
            <div style={{ width: "100%", maxHeight: "400px", overflowY: "scroll" }}>
              {/* eslint-disable-next-line react/prop-types */}
              {/* {ReactHtmlParser(EmailsData.description)} */}
              <div dangerouslySetInnerHTML={{ __html: EmailsData.description }} />
            </div>
          </div>
        </div>
      </div>
      {/* <div className="mb-5"></div>
      <div className="py-1 text-center fixed-bottom bg-light">
        <button
          id="cancel"
          name="cancel"
          className="btn btn-default"
          onClick={() => {
            // eslint-disable-next-line react/prop-types
            props.cancelHandler();
          }}
        >
          Back
        </button>
      </div> */}
    </>
  );
};

export default EmailDetail;
