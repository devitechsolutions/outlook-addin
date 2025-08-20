import React, { useState, useEffect } from "react";
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const RowMultipicklistField = (props) => {
  const { fieldName, fieldLabel, fieldMandatory, data, pickListValues } = props;
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  console.log('RowMultipicklistField: Rendering', fieldName, 'with pickListValues:', pickListValues);

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

  // Set initial values from data
  useEffect(() => {
    if (data && data.hasOwnProperty(fieldName) && data[fieldName]) {
      const dataValue = data[fieldName];
      let selectedValues = [];
      
      if (typeof dataValue === 'string') {
        // Handle comma-separated values or single value
        selectedValues = dataValue.split(',').map(v => v.trim()).filter(v => v);
      } else if (Array.isArray(dataValue)) {
        selectedValues = dataValue;
      }
      
      const defaultOptions = options.filter(option => 
        selectedValues.includes(option.value)
      );
      
      if (defaultOptions.length > 0) {
        setSelectedOptions(defaultOptions);
      }
    }
  }, [data, fieldName, options]);

  const handleSelectionChange = (newSelectedOptions) => {
    setSelectedOptions(newSelectedOptions);
  };

  const toggleOption = (option) => {
    const isSelected = selectedOptions.some(selected => selected.value === option.value);
    
    if (isSelected) {
      // Remove option
      setSelectedOptions(selectedOptions.filter(selected => selected.value !== option.value));
    } else {
      // Add option
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const clearAll = () => {
    setSelectedOptions([]);
  };

  const filteredOptions = query === '' 
    ? options 
    : options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );

  // Create comma-separated value for form submission
  const formValue = selectedOptions.map(option => option.value).join(',');

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
        value={formValue} 
        required={fieldMandatory && selectedOptions.length === 0}
      />
      
      <Listbox value={selectedOptions} onChange={handleSelectionChange} multiple>
        <div className="relative">
          {/* Display selected values */}
          <Listbox.Button 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors text-left bg-white min-h-[38px] flex items-center justify-between"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex-1">
              {selectedOptions.length === 0 ? (
                <span className="text-gray-500">Select options...</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedOptions.map((option, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-200 text-primary-800"
                    >
                      {option.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <ChevronUpDownIcon className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" aria-hidden="true" />
          </Listbox.Button>
          
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {/* Search input */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="Search options..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-between mt-2">
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                >
                  Clear All
                </button>
                <span className="text-xs text-gray-500">
                  {selectedOptions.length} selected
                </span>
              </div>
            </div>
            
            {/* Options list */}
            <div className="max-h-48 overflow-y-auto py-1">
              {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  No options found.
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedOptions.some(selected => selected.value === option.value);
                  
                  return (
                    <Listbox.Option
                      key={`${option.value}-${index}`}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-primary-500 text-white' : 'text-gray-900'
                        }`
                      }
                      value={option}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(option);
                      }}
                    >
                      {({ active }) => (
                        <>
                          <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                            {option.label}
                          </span>
                          {isSelected ? (
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
                    </Listbox.Option>
                  );
                })
              )}
            </div>
          </Listbox.Options>
        </div>
      </Listbox>
      
      {fieldMandatory && selectedOptions.length === 0 && (
        <p className="mt-1 text-xs text-red-600">
          {fieldLabel} is required.
        </p>
      )}
    </div>
  );
};

export default RowMultipicklistField;