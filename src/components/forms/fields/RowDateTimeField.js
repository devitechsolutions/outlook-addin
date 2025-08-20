import React from "react";

const RowDateTimeField = (props) => {
  const { fieldName, fieldLabel, fieldMandatory, data, isReadonly } = props;
  let defvalue = "";
  let timeDefvalue = "";
  let timeFieldName = "";

  if (fieldName === "date_start") {
    timeFieldName = "time_start";
    if (data && data.hasOwnProperty(timeFieldName)) {
      timeDefvalue = data[timeFieldName];
    }
  } else if (fieldName === "due_date") {
    timeFieldName = "time_end";
    if (data && data.hasOwnProperty(timeFieldName)) {
      timeDefvalue = data[timeFieldName];
    }
  }

  if (data && data.hasOwnProperty(fieldName)) {
    defvalue = data[fieldName];
  }

  return (
    <div className="row mb-3">
      <label htmlFor={fieldName} className="form-label">
        {fieldLabel}
      </label>
      <div className="col-6">
        <input
          className="form-control"
          type="date"
          name={fieldName}
          aria-describedby="inputGroupPrepend"
          required={fieldMandatory}
          readOnly={isReadonly}
          defaultValue={defvalue}
          style={{ fontSize: "12px", borderRadius: "0" }}
        />
        <div className="invalid-feedback">{fieldLabel} is required.</div>
      </div>
      <div className="col-6">
        <input
          className="form-control"
          type="time"
          name={timeFieldName}
          aria-describedby="inputGroupPrepend"
          required={fieldMandatory}
          readOnly={isReadonly}
          defaultValue={timeDefvalue}
          style={{ fontSize: "12px", borderRadius: "0" }}
        />
        <div className="invalid-feedback">Time is required.</div>
      </div>
    </div>
  );
};

export default RowDateTimeField;