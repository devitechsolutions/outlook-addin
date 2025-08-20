import React from "react";

const RowTextAreaField = (props) => {
  const { fieldName, fieldLabel, fieldMandatory, data } = props;
  let defvalue = "";

  if (data && data.hasOwnProperty(fieldName)) {
    defvalue = data[fieldName];
  }

  return (
    <div className="mb-4">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1 text-left">
        {fieldLabel}
        {fieldMandatory && <span className="text-red-500 ml-1">*</span>}
        }
      </label>
      <textarea
        id={fieldName}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors resize-vertical"
        placeholder={`Enter ${fieldLabel}`}
        name={fieldName}
        required={fieldMandatory}
        defaultValue={defvalue}
        rows="3"
      />
      {fieldMandatory && (
        <p className="mt-1 text-xs text-red-600 hidden peer-invalid:block">
          {fieldLabel} is required.
        </p>
      )}
    </div>
  );
};

export default RowTextAreaField;