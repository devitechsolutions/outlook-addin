import React from "react";
import { useIndexedDBStore } from "use-indexeddb";

const RowOwnerField = (props) => {
  const { getByID } = useIndexedDBStore("users");
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
  } else {
    getByID(1).then((res) => {
      let currentUser = res.userid;
      defvalue = currentUser;
    });
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
          style={{ fontSize: "14px", borderRadius: "0" }}
        >
          <optgroup label="Users">
            {/* eslint-disable-next-line react/prop-types */}
            {Object.entries(props.UsersPickListValues).map(([key, value]) => {
              return (
                <option value={key} key={key}>
                  {value}
                </option>
              );
            })}
          </optgroup>
          <optgroup label="Group">
            {/* eslint-disable-next-line react/prop-types */}
            {Object.entries(props.GroupPickListValues).map(([key, value]) => {
              return (
                <option value={key} key={key}>
                  {value}
                </option>
              );
            })}
          </optgroup>
        </select>
        {/* eslint-disable-next-line react/prop-types */}
        <div className="invalid-feedback">{props.fieldLabel} required.</div>
      </div>
    </>
  );
};

export default RowOwnerField;
