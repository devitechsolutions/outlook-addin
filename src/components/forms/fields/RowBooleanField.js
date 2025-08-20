import React, { useState } from "react";

const RowBooleanField = (props) => {
  const { fieldName, fieldLabel, fieldMandatory, data } = props;
  const [defvalue, setDefvalue] = useState("");

  if (data && data.hasOwnProperty(fieldName)) {
    if (defvalue === "" && data[fieldName] !== undefined) {
      const def_value = data[fieldName] === "1";
      setDefvalue(def_value);
    }
  }

  return (
    <div className="mb-4">
      <div className="flex items-center">
        <input type="hidden" name={fieldName} value="0" />
        <input
          id={fieldName}
          className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300 rounded transition-colors"
          defaultChecked={defvalue}
          type="checkbox"
          name={fieldName}
          required={fieldMandatory}
          value="1"
        />
        <label htmlFor={fieldName} className="ml-3 block text-sm font-medium text-gray-700">
          {fieldLabel}
          {fieldMandatory && <span className="text-red-500 ml-1">*</span>}
          }
        </label>
      </div>
      {fieldMandatory && (
        <p className="mt-1 text-xs text-red-600 hidden peer-invalid:block">
          {fieldLabel} is required.
        </p>
      )}
    </div>
  );
};

export default RowBooleanField;