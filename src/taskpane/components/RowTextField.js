import React from "react";

const RowTextField = (props) => {
  // eslint-disable-next-line react/prop-types
  const fieldname = props.fieldName;
  // eslint-disable-next-line react/prop-types
  const recordData = props.data;
  let defvalue = "";
  // eslint-disable-next-line react/prop-types, no-prototype-builtins
  if (recordData && recordData.hasOwnProperty(fieldname)) {
    // eslint-disable-next-line react/prop-types
    defvalue = props.data[fieldname];
  } else if (fieldname === "lastname") {
    // eslint-disable-next-line react/prop-types
    defvalue = props.lastname;
    // eslint-disable-next-line react/prop-types
  } else if (fieldname === "firstname") {
    // eslint-disable-next-line react/prop-types
    defvalue = props.firstname;
  } else if (fieldname === "accountname") {
    // eslint-disable-next-line react/prop-types
    defvalue = props.accountname;
  }

  return (
    <>
      <div className="mb-3 mt-3">
        <label htmlFor="uname" className="form-label">
          {/* eslint-disable-next-line react/prop-types */}
          {props.fieldLabel}
        </label>
        <input
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

export default RowTextField;
