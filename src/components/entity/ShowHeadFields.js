import React from 'react';
import { 
  InformationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserIcon,
  GlobeAltIcon,
  IdentificationIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const ShowHeadFields = ({ data }) => {
  const { label, headerFields, header_fields } = data;
  
  // Handle both naming conventions: headerFields (camelCase) and header_fields (snake_case)
  const fieldsToDisplay = headerFields || header_fields;

  console.log('ShowHeadFields: Received data:', data);
  console.log('ShowHeadFields: Header fields:', fieldsToDisplay);

  // Function to get appropriate icon based on field name
  const getFieldIcon = (fieldname) => {
    const fieldLower = fieldname.toLowerCase();
    const iconProps = { className: "w-4 h-4 text-gray-500 flex-shrink-0" };
    
    if (fieldLower.includes('phone') || fieldLower.includes('mobile') || fieldLower.includes('fax')) {
      return <PhoneIcon {...iconProps} />;
    } else if (fieldLower.includes('email')) {
      return <EnvelopeIcon {...iconProps} />;
    } else if (fieldLower.includes('address') || fieldLower.includes('street') || fieldLower.includes('city') || fieldLower.includes('state') || fieldLower.includes('zip') || fieldLower.includes('country')) {
      return <MapPinIcon {...iconProps} />;
    } else if (fieldLower.includes('company') || fieldLower.includes('organization') || fieldLower.includes('account')) {
      return <BuildingOfficeIcon {...iconProps} />;
    } else if (fieldLower.includes('name') || fieldLower.includes('contact')) {
      return <UserIcon {...iconProps} />;
    } else if (fieldLower.includes('website') || fieldLower.includes('url')) {
      return <GlobeAltIcon {...iconProps} />;
    } else if (fieldLower.includes('id') || fieldLower.includes('number')) {
      return <IdentificationIcon {...iconProps} />;
    } else if (fieldLower.includes('date') || fieldLower.includes('time')) {
      return <CalendarIcon {...iconProps} />;
    } else if (fieldLower.includes('amount') || fieldLower.includes('price') || fieldLower.includes('cost') || fieldLower.includes('revenue')) {
      return <CurrencyDollarIcon {...iconProps} />;
    } else if (fieldLower.includes('description') || fieldLower.includes('note') || fieldLower.includes('comment')) {
      return <DocumentTextIcon {...iconProps} />;
    } else {
      return <InformationCircleIcon {...iconProps} />;
    }
  };

  return (
    <div className="mb-3">
      {/* Main Record Title with User Icon */}
      <div className="flex items-center mb-3">
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-primary-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-gray-900 truncate capitalize leading-tight">
            {label}
          </h2>
        </div>
      </div>
      
      {/* Display header fields from the new API structure */}
      {fieldsToDisplay && Array.isArray(fieldsToDisplay) && fieldsToDisplay.length > 0 && (
        <div className="space-y-2.5">
          {fieldsToDisplay.map((field, index) => {
            console.log('ShowHeadFields: Processing field:', field.fieldname, 'value:', field.value);
            
            return (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  {getFieldIcon(field.fieldname)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col space-y-0.5">
                    <span className="font-medium text-gray-800 text-sm leading-tight">
                      {field.fieldlabel || field.fieldname}
                    </span>
                    <span className="text-gray-600 break-words text-sm leading-relaxed">
                      {field.value && field.value.trim() !== '' ? field.value : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Fallback for old header fields structure (backward compatibility) */}
      {fieldsToDisplay && typeof fieldsToDisplay === 'object' && !Array.isArray(fieldsToDisplay) && 
        Object.keys(fieldsToDisplay).length > 0 && (
        <div className="space-y-2.5">
          {Object.entries(fieldsToDisplay).map(([key, fieldName]) => {
            const fieldValue = data[fieldName];
            return (
              <div key={key} className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  {getFieldIcon(fieldName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col space-y-0.5">
                    <span className="font-medium text-gray-800 text-sm leading-tight">
                      {fieldName}
                    </span>
                    <span className="text-gray-600 break-words text-sm leading-relaxed">
                      {fieldValue && fieldValue.length > 0 ? fieldValue : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Show message if no header fields */}
      {(!fieldsToDisplay || 
        (Array.isArray(fieldsToDisplay) && fieldsToDisplay.length === 0) ||
        (typeof fieldsToDisplay === 'object' && Object.keys(fieldsToDisplay).length === 0)
      ) && (
        <div className="text-xs text-gray-500 italic">
          No additional details available
        </div>
      )}
    </div>
  );
};

export default ShowHeadFields;