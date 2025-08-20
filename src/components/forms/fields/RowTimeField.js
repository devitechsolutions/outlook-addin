import React from "react";

const RowTimeField = (props) => {
  const { fieldName, fieldLabel, fieldMandatory, data } = props;
  let defvalue = "";

  if (data && data.hasOwnProperty(fieldName)) {
    defvalue = data[fieldName];
  }

  return (
    <div className="mb-3">
      <label htmlFor={fieldName} className="form-label">
        {fieldLabel}
      </label>
      <input
        className="form-control"
        type="time"
        name={fieldName}
        aria-describedby="inputGroupPrepend"
        required={fieldMandatory}
        defaultValue={defvalue}
        style={{ fontSize: "12px", borderRadius: "0" }}
      />
      <div className="invalid-feedback">{fieldLabel} is required.</div>
    </div>
  );
};

export default RowTimeField;