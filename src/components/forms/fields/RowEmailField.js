import React from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

const RowEmailField = (props) => {
  const { fieldName, fieldLabel, fieldMandatory, data, fromEmail } = props;
  let defvalue = "";

  if (data && data.hasOwnProperty(fieldName)) {
    defvalue = data[fieldName];
  } else if (fromEmail) {
    defvalue = fromEmail;
  }

  return (
    <div className="mb-4">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1 text-left">
        {fieldLabel}
        {fieldMandatory && <span className="text-red-500 ml-1">*</span>}
        }
      </label>
      <div className="relative">
        <input
          id={fieldName}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors pl-10"
          type="email"
          name={fieldName}
          placeholder="name@example.com"
          required={fieldMandatory}
          defaultValue={defvalue}
        />
        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      {fieldMandatory && (
        <p className="mt-1 text-xs text-red-600 hidden peer-invalid:block">
          Enter a valid {fieldLabel}.
        </p>
      )}
    </div>
  );
};

export default RowEmailField;