import React from "react";

const RowDateTimeField = (props) => {
  let defvalue = "";
  let timeDefvalue = "";
  // eslint-disable-next-line react/prop-types
  const recordData = props.data;
  // eslint-disable-next-line react/prop-types
  const fieldname = props.fieldName;
  let timeFieldName = "";
  if (fieldname === "date_start") {
    timeFieldName = "time_start";
    // eslint-disable-next-line no-prototype-builtins
    if (recordData && recordData.hasOwnProperty(timeFieldName)) {
      // eslint-disable-next-line react/prop-types
      timeDefvalue = props.data[timeFieldName];
      // eslint-disable-next-line react/prop-types
    }
  } else if (fieldname === "due_date") {
    timeFieldName = "time_end";
    // eslint-disable-next-line no-prototype-builtins
    if (recordData && recordData.hasOwnProperty(timeFieldName)) {
      // eslint-disable-next-line react/prop-types
      timeDefvalue = props.data[timeFieldName];
      // eslint-disable-next-line react/prop-types
    }
  }

  // eslint-disable-next-line react/prop-types, no-prototype-builtins
  if (recordData && recordData.hasOwnProperty(fieldname)) {
    // eslint-disable-next-line react/prop-types
    defvalue = props.data[fieldname];
    // eslint-disable-next-line react/prop-types
  }

  return (
    <>
      <div className="row mb-3">
        <label htmlFor="uname" className="form-label">
          {/* eslint-disable-next-line react/prop-types */}
          {props.fieldLabel}
        </label>
        <div className="col-6">
          <input
            className="form-control"
            type="date"
            // eslint-disable-next-line react/prop-types
            name={props.fieldName}
            aria-describedby="inputGroupPrepend"
            // eslint-disable-next-line react/prop-types
            required={props.fieldMandatory}
            // eslint-disable-next-line react/prop-types
            readOnly={props.isReadonly}
            defaultValue={defvalue}
            style={{ fontSize: "14px", borderRadius: "0" }}
          />
          {/* eslint-disable-next-line react/prop-types */}
          <div className="invalid-feedback">{props.fieldLabel} required.</div>
        </div>
        <div className="col-6">
          <input
            className="form-control"
            type="time"
            name={timeFieldName}
            aria-describedby="inputGroupPrepend"
            // eslint-disable-next-line react/prop-types
            required={props.fieldMandatory}
            // eslint-disable-next-line react/prop-types
            readOnly={props.isReadonly}
            defaultValue={timeDefvalue}
            style={{ fontSize: "13px", borderRadius: "0" }}
          />
          {/* eslint-disable-next-line react/prop-types */}
          <div className="invalid-feedback">{props.fieldLabel} required.</div>
        </div>
      </div>
    </>
  );
};

export default RowDateTimeField;
