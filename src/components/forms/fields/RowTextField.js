import React from "react";

const RowTextField = (props) => {
  const { fieldName, fieldLabel, fieldMandatory, fieldType, data } = props;
  let defvalue = "";
  let inputType = "text";
  let step = null;

  // Determine input type based on field type
  switch (fieldType) {
    case 'integer':
      inputType = "number";
      step = "1";
      break;
    case 'double':
    case 'currency':
      inputType = "number";
      step = "0.01";
      break;
    case 'phone':
      inputType = "tel";
      break;
    case 'url':
      inputType = "url";
      break;
    default:
      inputType = "text";
  }

  if (data && data.hasOwnProperty(fieldName)) {
    defvalue = data[fieldName];
  } else if (fieldName === "lastname") {
    defvalue = props.lastname || "";
  } else if (fieldName === "firstname") {
    defvalue = props.firstname || "";
  } else if (fieldName === "accountname") {
    defvalue = props.accountname || "";
  }

  return (
    <div className="mb-4">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1 text-left">
        {fieldLabel}
        {fieldMandatory && <span className="text-red-500 ml-1">*</span>}
        }
      </label>
      <input
        id={fieldName}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
        type={inputType}
        step={step}
        placeholder={`Enter ${fieldLabel}`}
        name={fieldName}
        required={fieldMandatory}
        defaultValue={defvalue}
      />
      {fieldMandatory && (
        <p className="mt-1 text-xs text-red-600 hidden peer-invalid:block">
          {fieldLabel} is required.
        </p>
      )}
    </div>
  );
};

export default RowTextField;