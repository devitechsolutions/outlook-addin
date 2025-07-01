import React, { useState } from "react";

const RowBooleanField = (props) => {
  // eslint-disable-next-line react/prop-types
  const fieldname = props.fieldName;
  // eslint-disable-next-line react/prop-types
  const recordData = props.data;

  const [defvalue, setDefvalue] = useState("");

  // eslint-disable-next-line react/prop-types, no-prototype-builtins
  if (recordData && recordData.hasOwnProperty(fieldname)) {
    // eslint-disable-next-line react/prop-types
    if (defvalue === "" && recordData[fieldname] !== undefined) {
      // eslint-disable-next-line react/prop-types
      let def_value = "";
      // eslint-disable-next-line react/prop-types
      if (recordData[fieldname] == "1") {
        def_value = true;
      } else {
        def_value = false;
      }
      setDefvalue(def_value);
    }
  }

  return (
    <>
      <div className="mb-3 form-check form-switch">
        <label className="form-label">
          {/* eslint-disable-next-line react/prop-types */}
          {props.fieldLabel}
        </label>
        {/* eslint-disable-next-line react/prop-types */}
        <input type="hidden" name={props.fieldName} value="0"></input>
        <input
          className="form-check-input"
          defaultChecked={defvalue}
          type="checkbox"
          // eslint-disable-next-line react/prop-types
          name={props.fieldName}
          aria-describedby="inputGroupPrepend"
          // eslint-disable-next-line react/prop-types
          required={props.fieldMandatory}
          value="1"
        />
        {/* eslint-disable-next-line react/prop-types */}
        <div className="invalid-feedback">{props.fieldLabel} required.</div>
      </div>
    </>
  );
};

export default RowBooleanField;
