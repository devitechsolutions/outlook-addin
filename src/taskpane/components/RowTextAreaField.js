import React from "react";

const RowTextAreaField = (props) => {
  // eslint-disable-next-line react/prop-types
  const fieldname = props.fieldName;
  // eslint-disable-next-line react/prop-types
  const recordData = props.data;
  let defvalue = "";
  // eslint-disable-next-line react/prop-types, no-prototype-builtins
  if (recordData && recordData.hasOwnProperty(fieldname)) {
    // eslint-disable-next-line react/prop-types
    defvalue = props.data[fieldname];
  }

  return (
    <>
      <div className="mb-3 mt-3">
        <label htmlFor="uname" className="form-label">
          {/* eslint-disable-next-line react/prop-types */}
          {props.fieldLabel}
        </label>
        <textarea
          className="form-control"
          type="text"
          // eslint-disable-next-line react/prop-types
          placeholder={`Enter ${props.fieldLabel}`}
          // eslint-disable-next-line react/prop-types
          name={fieldname}
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

export default RowTextAreaField;
