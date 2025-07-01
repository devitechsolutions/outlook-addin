import React from "react";

const RowEmailField = (props) => {
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
  } else if (props.fromEmail !== "") {
    // eslint-disable-next-line react/prop-types
    defvalue = props.fromEmail;
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
          type="email"
          // eslint-disable-next-line react/prop-types
          name={props.fieldName}
          placeholder="name@example.com"
          aria-describedby="inputGroupPrepend"
          // eslint-disable-next-line react/prop-types
          required={props.fieldMandatory}
          defaultValue={defvalue}
          style={{ fontSize: "14px", borderRadius: "0" }}
        />
        {/* eslint-disable-next-line react/prop-types */}
        <div className="invalid-feedback">Enter Valid {props.fieldLabel}.</div>
      </div>
    </>
  );
};

export default RowEmailField;
