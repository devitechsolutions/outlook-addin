import React from "react";

const RowMultipicklistField = (props) => {
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
      <div className="mb-3">
        <label htmlFor="uname" className="form-label">
          {/* eslint-disable-next-line react/prop-types */}
          {props.fieldLabel}
        </label>
        <select
          className="form-select"
          defaultValue={defvalue}
          // eslint-disable-next-line react/prop-types
          name={props.fieldName}
          aria-describedby="inputGroupPrepend"
          // eslint-disable-next-line react/prop-types
          required={props.fieldMandatory}
          multiple={true}
        >
          <option value="">Select an Option</option>
          {/* eslint-disable-next-line react/prop-types */}
          {Object.keys(props.pickListValues).map((opt) => {
            return (
              <option value={opt} key={opt}>
                {opt}
              </option>
            );
          })}
        </select>
        {/* eslint-disable-next-line react/prop-types */}
        <div className="invalid-feedback">{props.fieldLabel} required.</div>
      </div>
    </>
  );
};

export default RowMultipicklistField;
