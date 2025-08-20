import React, { useState } from "react";
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const RowPickListField = (props) => {
  const { fieldName, fieldLabel, fieldMandatory, data, pickListValues } = props;
  const [selectedOption, setSelectedOption] = useState(null);
  const [query, setQuery] = useState('');
  
  console.log('RowPickListField: Rendering', fieldName, 'with pickListValues:', pickListValues);

  // Process pickListValues into options array
  let options = [];
  if (pickListValues && typeof pickListValues === 'object') {
    if (Array.isArray(pickListValues)) {
      options = pickListValues.map((item, index) => ({
        value: item.value || item.key || index,
        label: item.label || item.value || item
      }));
    } else {
      options = Object.entries(pickListValues).map(([key, value]) => ({
        value: key,
        label: value || key
      }));
    }
  }

  // Set initial value from data
  React.useEffect(() => {
    if (data && data.hasOwnProperty(fieldName) && data[fieldName]) {
      const defaultOption = options.find(option => option.value === data[fieldName]);
      if (defaultOption) {
        setSelectedOption(defaultOption);
        setQuery(defaultOption.label);
      }
    }
  }, [data, fieldName, options]);

  const handleSelectionChange = (option) => {
    setSelectedOption(option);
    if (option) {
      setQuery(option.label);
    } else {
      setQuery('');
    }
  };

  const filteredOptions = query === '' 
    ? options 
    : options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );

  console.log('RowPickListField: Processed options:', options);

  return (
    <div className="mb-4">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1 text-left">
        {fieldLabel}
        {fieldMandatory && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Hidden input for form submission */}
      <input 
        type="hidden" 
        name={fieldName} 
        value={selectedOption?.value || ''} 
        required={fieldMandatory}
      />
      
      <Combobox value={selectedOption} onChange={handleSelectionChange}>
        <div className="relative">
          <div className="relative">
            <Combobox.Input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors pl-10 pr-10"
              displayValue={(option) => option?.label || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${fieldLabel.toLowerCase()}...`}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </div>
          
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {/* Clear selection option */}
            <Combobox.Option
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
                }`
              }
              value={null}
            >
              <span className="block truncate font-normal italic">
                Clear selection
              </span>
            </Combobox.Option>
            
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                No options found.
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <Combobox.Option
                  key={`${option.value}-${index}`}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-primary-500 text-white' : 'text-gray-900'
                    }`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.label}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-primary-500'
                          }`}
                        >
                          <CheckIcon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
      
      {fieldMandatory && (
        <p className="mt-1 text-xs text-red-600 hidden peer-invalid:block">
          {fieldLabel} is required.
        </p>
      )}
    </div>
  );
};

export default RowPickListField;