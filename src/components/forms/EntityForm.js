import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';
import LoadingSpinner from '../common/LoadingSpinner';
import FormField from './FormField';

class EntityForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      validated: false,
      saving: false,
      crmFields: [],
      recordDetail: {},
    };
  }

  componentDidMount() {
    this.loadFields();
    if (this.props.crmid) {
      this.loadRecordDetails();
    } else {
      this.setState({ loading: false });
    }
  }

  loadFields = async () => {
    const { module, onLogout } = this.props;
    
    this.setState({ loading: true });
    
    try {
      // Get fields from authService metadata instead of API call
      const authService = require('../../services/authService').default;
      const moduleFields = authService.getModuleFields(module);
      
      console.log(`EntityForm: Retrieved ${moduleFields.length} fields for ${module}:`, moduleFields);
      
      if (moduleFields && moduleFields.length > 0) {
        // Filter out fields that shouldn't be shown in forms
        const formFields = moduleFields.filter(field => 
          field.name !== 'id' && 
          field.name !== 'createdtime' && 
          field.name !== 'modifiedtime' &&
          field.name !== 'modifiedby' &&
          field.name !== 'created_user_id' &&
          !field.name.startsWith('cf_') // Skip custom fields for now
        );
        
        console.log(`EntityForm: Filtered to ${formFields.length} form fields:`, formFields);
        this.setState({ crmFields: formFields });
      } else {
        console.warn(`EntityForm: No fields found for module ${module}`);
        this.setState({ crmFields: [] });
      }
    } catch (error) {
      console.error('EntityForm: Error loading fields:', error);
      this.setState({ crmFields: [] });
    } finally {
      if (!this.props.crmid) {
        this.setState({ loading: false });
      }
    }
  };

  loadRecordDetails = async () => {
    const { crmid, onLogout } = this.props;
    
    this.setState({ loading: true });
    
    try {
      const result = await apiService.getRecordDetails(crmid);
      
      if (result.success) {
        this.setState({
          recordDetail: result.data.recordDetail || {},
          loading: false,
        });
      } else if (result.needsLogout && onLogout) {
        onLogout();
      } else {
        this.setState({ loading: false });
      }
    } catch (error) {
      console.error('Error loading record details:', error);
      this.setState({ loading: false });
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity()) {
      this.setState({ saving: true });
      const formData = new FormData(form);
      const formDataObj = Object.fromEntries(formData.entries());

      try {
        const result = await apiService.saveEntity(formDataObj);

        if (result.success) {
          toast.success('Successfully Saved', {
            closeOnClick: true,
            pauseOnHover: true,
            theme: 'colored',
            autoClose: 7000,
          });
          this.props.onSuccess?.();
        } else if (result.needsLogout && this.props.onLogout) {
          this.props.onLogout();
        }
      } catch (error) {
        console.error('Error saving entity:', error);
      } finally {
        this.setState({ saving: false });
      }
    }

    this.setState({ validated: true });
  };

  render() {
    const { loading, validated, saving, crmFields, recordDetail } = this.state;
    const { module, onCancel } = this.props;

    if (loading) {
      return <LoadingSpinner label="Loading form..." />;
    }

    const isEdit = recordDetail && Object.keys(recordDetail).length > 0;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
             {isEdit ? `Edit ${recordDetail.label || module}` : `Create New ${module}`}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={this.handleSubmit} className="p-4">
          <input type="hidden" name="module" value={module} />
          
          {isEdit && (
            <>
              <input type="hidden" name="mode" value="edit" />
              <input type="hidden" name="record" value={recordDetail.id} />
            </>
          )}

          <div className="space-y-6">
            {crmFields
              .filter(field => field.type !== 'selection' && field.type !== 'subject')
              .sort((a, b) => {
                // Sort by sequence if available, otherwise maintain original order
                const seqA = parseInt(a.sequence) || 999;
                const seqB = parseInt(b.sequence) || 999;
                return seqA - seqB;
              })
              .map((field, index) => (
                <FormField
                  key={index}
                  field={field}
                  data={recordDetail}
                  {...this.props}
                />
              ))}
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              style={{ backgroundColor: '#0075a8' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#005e86'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0075a8'}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default EntityForm;