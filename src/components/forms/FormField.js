import React from 'react';
import RowTextField from './fields/RowTextField';
import RowTextAreaField from './fields/RowTextAreaField';
import RowPickListField from './fields/RowPickListField';
import RowReferenceField from './fields/RowReferenceField';
import RowOwnerField from './fields/RowOwnerField';
import RowBooleanField from './fields/RowBooleanField';
import RowDateField from './fields/RowDateField';
import RowEmailField from './fields/RowEmailField';
import RowDateTimeField from './fields/RowDateTimeField';
import RowMultipicklistField from './fields/RowMultipicklistField';
import RowTimeField from './fields/RowTimeField';

const FormField = ({ field, data, ...props }) => {
  console.log('FormField: Rendering field:', field.name, 'uitype:', field.uitype, 'type:', field.type, 'mandatory:', field.mandatory, 'sequence:', field.sequence);
  
  // Determine if field is mandatory (1 = mandatory, 0 = optional)
  const isMandatory = field.mandatory === 1 || field.mandatory === '1' || field.mandatory === true;
  
  const commonProps = {
    fieldLabel: field.label,
    fieldName: field.name,
    fieldMandatory: isMandatory,
    fieldType: field.type,
    fieldUitype: field.uitype,
    data,
    ...props,
  };

  // Use uitype as primary field type identifier, fallback to type
  const fieldType = field.uitype || field.type;

  console.log('FormField: Processing field type:', fieldType, 'mandatory:', isMandatory);

  switch (fieldType) {
    // Text-based fields
    case 'string':
    case 'text':
    case 'phone':
    case 'url':
    case 'integer':
    case 'double':
    case 'currency':
    case 'salutation': // Handle salutation as text field
    case '1':  // String
    case '7':  // Number
    case '11': // Phone
    case '17': // Website/URL
    case '71': // Currency
    case '55': // Salutation
      return <RowTextField {...commonProps} />;
    
    // Textarea fields
    case 'textarea':
    case '21': // Textarea
    case '19': // Text area
      return <RowTextAreaField {...commonProps} />;
    
    // Picklist fields
    case 'picklist':
    case '15': // Picklist
    case '16': // Picklist
      return (
        <RowPickListField 
          {...commonProps} 
          pickListValues={field.picklistvalues || field.type_info?.picklistValues || {}} 
        />
      );
    
    // Multi-picklist fields
    case 'multipicklist':
    case '33': // Multi-select picklist
      return (
        <RowMultipicklistField 
          {...commonProps} 
          pickListValues={field.picklistvalues || field.type_info?.picklistValues || {}} 
        />
      );
    
    // Reference fields
    case 'reference':
    case '10': // Reference/Lookup
      return (
        <RowReferenceField 
          {...commonProps} 
          referenceModule={field.referencemodules?.[0] || field.type_info?.refersTo?.[0]} 
          referenceModules={field.referencemodules || field.type_info?.refersTo || []}
        />
      );
    
    // Owner fields
    case 'owner':
    case '53': // Owner
      return (
        <RowOwnerField 
          {...commonProps} 
          UsersPickListValues={field.picklistvalues?.Users || field.type_info?.picklistValues?.Users || {}}
          GroupPickListValues={field.picklistvalues?.Groups || field.type_info?.picklistValues?.Groups || {}}
        />
      );
    
    // Boolean/Checkbox fields
    case 'boolean':
    case '56': // Boolean/Checkbox
      return <RowBooleanField {...commonProps} />;
    
    // Date fields
    case 'date':
    case '5': // Date
      return <RowDateField {...commonProps} />;
    
    // Email fields
    case 'email':
    case '13': // Email
      return <RowEmailField {...commonProps} />;
    
    // DateTime fields
    case 'datetime':
    case '70': // DateTime
      return <RowDateTimeField {...commonProps} />;
    
    // Time fields
    case 'time':
    case '14': // Time
      return <RowTimeField {...commonProps} />;
    
    default:
      console.warn('FormField: Unknown field type/uitype:', fieldType, 'for field:', field.name, '- using text field as fallback');
      // Fallback to text field for unknown types
      return <RowTextField {...commonProps} />;
  }
};

export default FormField;