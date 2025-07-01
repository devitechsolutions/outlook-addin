import React from "react";

const RowDateField = (props) => {
  let defvalue = "";
  // eslint-disable-next-line react/prop-types
  const fieldname = props.fieldName;
  // eslint-disable-next-line react/prop-types
  const recordData = props.data;
  // eslint-disable-next-line react/prop-types, no-prototype-builtins
  if (recordData && recordData.hasOwnProperty(fieldname)) {
    // eslint-disable-next-line react/prop-types
    defvalue = props.data[fieldname];
    // eslint-disable-next-line react/prop-types
  }
  return (
    <>
      <div className="mb-3">
        <label htmlFor="uname" className="form-label">
          {/* eslint-disable-next-line react/prop-types */}
          {props.fieldLabel}
        </label>
        <input
          className="form-control"
          type="date"
          // eslint-disable-next-line react/prop-types
          name={props.fieldName}
          aria-describedby="inputGroupPrepend"
          // eslint-disable-next-line react/prop-types
          required={props.fieldMandatory}
          defaultValue={defvalue}
          style={{ fontSize: "14px", borderRadius: "0" }}
        />
        {/* eslint-disable-next-line react/prop-types */}
        <div className="invalid-feedback">{props.fieldLabel} required.</div>
      </div>
    </>
  );
};

export default RowDateField;
