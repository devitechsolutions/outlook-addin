import React, { useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useIndexedDBStore } from "use-indexeddb";
import { BsListStars } from "react-icons/bs";
import { MdArrowBackIosNew } from "react-icons/md";
import TaskForm from "./TaskForm";
import { FaPlus } from "react-icons/fa";

const TaskTable = (props) => {
  const { getByID } = useIndexedDBStore("users");

  const [crm_url, setCrmUrl] = useState("");

  getByID(1).then((res) => {
    setCrmUrl(res.crm_url);
  });

  // eslint-disable-next-line react/prop-types
  const VendorData = props.data;

  // eslint-disable-next-line react/prop-types
  let headerfields = props.headerFields;

  let isCreatable = props.Creatable;

  const [ShowTaskForm, setShowTaskForm] = useState(false);

  const addTaskHandler = () => {
    setShowTaskForm(true);
  };

  return (
    <>
      {ShowTaskForm ? (
        <div className="card mb-3 border-0" style={{ borderRadius: "0" }}>
          <TaskForm
            parentid={props.crmid}
            {...props}
            onFormCancelClick={() => props.onCancelClick()}
          />
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-10">
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
            <div className="col-2 text-end">
              {isCreatable && (
                <a href="#" className="" onClick={addTaskHandler} style={{ color: "#172b4d" }}>
                  <FaPlus />
                </a>
              )}
            </div>
          </div>
          <hr style={{ margin: "0.5rem 0" }} />
          <>
            {(VendorData !== undefined && VendorData.length > 0) ? 
              <ListGroup defaultActiveKey="#link1">
                {Object.entries(VendorData).map(([keys, fields]) => {
                  const firstTwoChars = fields.label.slice(0, 2);
                  const record = fields.id.split("x");
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
                          {firstTwoChars}
                        </span>
                        <div className="ps-3 px-1 w-75">
                          <h6 className="text-truncate">{fields.label}</h6>
                          {headerfields !== undefined &&
                            // eslint-disable-next-line react/prop-types
                            headerfields.length > 0 &&
                            // eslint-disable-next-line react/prop-types
                            headerfields.map((keys, hfields) => {
                              let headerData = fields[keys];
                              // eslint-disable-next-line react/prop-types
                              if (headerData != undefined && headerData.length > 0) {
                                return (
                                  <p key={hfields} className="text-muted small" style={{ marginBottom: "5px" }}>
                                    {fields[keys]}
                                  </p>
                                );
                              } else if (headerData !== undefined && Object.keys(headerData).length > 0) {
                                return (
                                  <p key={hfields} className="text-muted small" style={{ marginBottom: "5px" }}>
                                    {headerData.label}
                                  </p>
                                );
                              }
                            })}
                        </div>
                        <div className="text-end text-truncate">
                          <a
                            href={crm_url + `/index.php?module=${fields.module}&view=Detail&record=${record[1]}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <BsListStars title="open in CRM webview" style={{ fontSize: "20px", color: "#172b4d" }} />
                          </a>
                        </div>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup> : (
                <><div className="text-center">No Record Found</div></>
              )}
          </>
          
        </>
      )}
    </>
  );
};

export default TaskTable;
