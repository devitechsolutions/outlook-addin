import React, { useState, useEffect } from "react";
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon, CubeIcon } from '@heroicons/react/24/outline';
import apiService from "../../../services/apiService";

const RowReferenceField = (props) => {
  const { fieldName, fieldLabel, fieldMandatory, data, referenceModule, referenceModules } = props;
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedModule, setSelectedModule] = useState('');
  const [query, setQuery] = useState('');
  const [referenceValue, setReferenceValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  console.log('RowReferenceField: Rendering', fieldName, 'with referenceModule:', referenceModule, 'referenceModules:', referenceModules);

  // Determine available modules
  const availableModules = referenceModules && referenceModules.length > 0 
    ? referenceModules 
    : (referenceModule ? [referenceModule] : []);

  useEffect(() => {
    // Initialize default values from existing data
    if (data && Object.keys(data).length > 0) {
      const referenceInfo = data[fieldName];
      if (referenceInfo?.label && referenceInfo?.value) {
        setSelectedOption({ label: referenceInfo.label, value: referenceInfo.value });
        setQuery(referenceInfo.label);
        setReferenceValue(referenceInfo.value);
        
        // Try to determine the module from the reference value
        if (referenceInfo.value && referenceInfo.value.includes('x')) {
          const moduleId = referenceInfo.value.split('x')[0];
          // Find matching module in available modules
          const matchingModule = availableModules.find(mod => 
            mod.toLowerCase().includes(moduleId.toLowerCase()) || 
            moduleId.toLowerCase().includes(mod.toLowerCase())
          );
          if (matchingModule) {
            setSelectedModule(matchingModule);
          }
        }
      }
    }

    // Set default module if only one is available
    if (availableModules.length === 1) {
      setSelectedModule(availableModules[0]);
    }
  }, [data, fieldName, availableModules]);

  const getData = async (searchTerm, moduleToSearch = null) => {
    if (!searchTerm || searchTerm.length < 2) {
      setOptions([]);
      return;
    }

    const targetModule = moduleToSearch || selectedModule;
    if (!targetModule) {
      console.warn('RowReferenceField: No module selected for search');
      setOptions([]);
      return;
    }

    setIsSearching(true);
    
    try {
      console.log(`RowReferenceField: Searching in module ${targetModule} for term: ${searchTerm}`);
      const result = await apiService.getReferenceRecords(targetModule, searchTerm);
      
      if (result.success) {
        const records = result.data || [];
        console.log(`RowReferenceField: Found ${records.length} records in ${targetModule}`);
        setOptions(records);
      } else {
        console.warn('RowReferenceField: Search failed:', result.error);
        setOptions([]);
      }
    } catch (error) {
      console.error('Error fetching reference data:', error);
      setOptions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (value) => {
    setQuery(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Clear selection if query changes
    if (selectedOption && value !== selectedOption.label) {
      setSelectedOption(null);
      setReferenceValue('');
    }

    // Set new timeout for search
    if (value && value.length >= 2 && selectedModule) {
      const timeout = setTimeout(() => {
        getData(value);
      }, 300); // 300ms debounce
      setSearchTimeout(timeout);
    } else {
      setOptions([]);
    }
  };

  const handleModuleChange = (module) => {
    console.log('RowReferenceField: Module changed to:', module);
    setSelectedModule(module);
    setOptions([]);
    setSelectedOption(null);
    setReferenceValue('');
    
    // If there's a query, search in the new module
    if (query && query.length >= 2) {
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Search in new module after short delay
      const timeout = setTimeout(() => {
        getData(query, module);
      }, 100);
      setSearchTimeout(timeout);
    }
  };

  const handleSelectionChange = (option) => {
    console.log('RowReferenceField: Selection changed to:', option);
    setSelectedOption(option);
    
    if (option) {
      setReferenceValue(option.value);
      setQuery(option.label);
    } else {
      setQuery('');
      setReferenceValue('');
    }
    
    // Clear options after selection
    setOptions([]);
  };

  const filteredOptions = query === '' 
    ? options 
    : options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );

  // Show module selector only if multiple modules are available
  const showModuleSelector = availableModules.length > 1;

  return (
    <div className="mb-4">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1 text-left">
        {fieldLabel}
        {fieldMandatory && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input type="hidden" name={fieldName} value={referenceValue} />
      
      {/* Module Selector */}
      {showModuleSelector && (
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Select Module to Search In:
          </label>
          <div className="relative">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors appearance-none bg-white pr-10 pl-10"
              value={selectedModule}
              onChange={(e) => handleModuleChange(e.target.value)}
            >
              <option value="">Select a module...</option>
              {availableModules.map((module, index) => (
                <option key={index} value={module}>
                  {module}
                </option>
              ))}
            </select>
            <CubeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <ChevronUpDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Record Search */}
      <Combobox value={selectedOption} onChange={handleSelectionChange}>
        <div className="relative">
          <div className="relative">
            <Combobox.Input
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors pl-10 pr-10 ${
                !selectedModule && showModuleSelector 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                  : 'border-gray-300'
              }`}
              displayValue={(option) => option?.label || ''}
              onChange={(event) => handleInputChange(event.target.value)}
              placeholder={
                !selectedModule && showModuleSelector 
                  ? "Select a module first..." 
                  : `Type to search ${selectedModule || 'records'}...`
              }
              required={fieldMandatory}
              disabled={!selectedModule && showModuleSelector}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              ) : (
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </div>
          
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {isSearching ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                Searching...
              </div>
            ) : filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                {!selectedModule && showModuleSelector 
                  ? 'Please select a module first.'
                  : query.length < 2 
                    ? 'Type at least 2 characters to search.' 
                    : `No records found in ${selectedModule}.`
                }
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <Combobox.Option
                  key={index}
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
      
      {/* Help Text */}
      {showModuleSelector && (
        <p className="mt-1 text-xs text-gray-500">
          Select a module above, then type to search for records.
        </p>
      )}
      
      {fieldMandatory && (
        <p className="mt-1 text-xs text-red-600 hidden peer-invalid:block">
          {fieldLabel} is required.
        </p>
      )}
    </div>
  );
};

export default RowReferenceField;