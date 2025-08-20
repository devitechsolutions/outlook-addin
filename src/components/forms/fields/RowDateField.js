import React from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";

const RowDateField = (props) => {
  const { fieldName, fieldLabel, fieldMandatory, data } = props;
  let defvalue = "";

  console.log('RowDateField: Rendering', fieldName, 'with data:', data?.[fieldName]);

  if (data && data.hasOwnProperty(fieldName)) {
    defvalue = data[fieldName];
    // Convert date format if needed (e.g., from DD-MM-YYYY to YYYY-MM-DD for HTML date input)
    if (defvalue && typeof defvalue === 'string') {
      // Handle different date formats
      if (defvalue.includes('-') && defvalue.split('-').length === 3) {
        const parts = defvalue.split('-');
        if (parts[0].length === 4) {
          // Already in YYYY-MM-DD format
          defvalue = defvalue;
        } else if (parts[2].length === 4) {
          // DD-MM-YYYY format, convert to YYYY-MM-DD
          defvalue = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    }
  }

  console.log('RowDateField: Processed default value:', defvalue);

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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors pr-10"
          type="date"
          name={fieldName}
          required={fieldMandatory}
          defaultValue={defvalue}
        />
        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      {fieldMandatory && (
        <p className="mt-1 text-xs text-red-600 hidden peer-invalid:block">
          {fieldLabel} is required.
        </p>
      )}
    </div>
  );
};

export default RowDateField;