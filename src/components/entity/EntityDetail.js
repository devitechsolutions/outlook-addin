import React, { Component } from 'react';
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';
import LoadingSpinner from '../common/LoadingSpinner';

class EntityDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      crmFields: [],
      recordDetail: {},
    };
  }

  componentDidMount() {
    this.loadFields();
    this.loadRecordDetails();
  }

  loadFields = async () => {
    const { module, onLogout } = this.props;
    
    this.setState({ loading: true });
    
    try {
      const result = await apiService.getOutlookEnabledFields(module);
      
      if (result.success) {
        const fields = result.data.fields || [];
        // Add custom date fields
        fields.push(
          { type: 'custom_date', label: 'Modified Time', name: 'modifiedtime' },
          { type: 'custom_date', label: 'Created Time', name: 'createdtime' }
        );
        this.setState({ crmFields: fields });
      } else if (result.needsLogout && onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Error loading fields:', error);
      this.setState({ loading: false });
    }
  };

  loadRecordDetails = async () => {
    const { crmid, onLogout } = this.props;
    
    if (!this.state.loading) {
      this.setState({ loading: true });
    }
    
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

  renderFieldValue = (field) => {
    const { type, name } = field;
    const { recordDetail } = this.state;
    const value = recordDetail[name];

    switch (type) {
      case 'reference':
        return value?.label || '';
      case 'owner':
        return recordDetail.assigned_user_name || '';
      case 'boolean':
        return value === '1' ? 'Yes' : 'No';
      default:
        return value || '';
    }
  };

  render() {
    const { loading, crmFields, recordDetail } = this.state;
    const { onCancel } = this.props;

    if (loading) {
      return <LoadingSpinner label="Loading details..." />;
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200">
          {onBack && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <button
                onClick={onBack}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Results
              </button>
            </div>
          )}
          <button
            onClick={onCancel}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        {/* Details */}
        <div className="p-4">
          <div className="space-y-4">
            {crmFields
              .filter(field => field.type !== 'selection' && field.type !== 'subject')
              .sort((a, b) => {
                // Sort by sequence if available, otherwise maintain original order
                const seqA = parseInt(a.sequence) || 999;
                const seqB = parseInt(b.sequence) || 999;
                return seqA - seqB;
              })
              .map((field, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <dt className="text-base font-medium text-gray-500 mb-1">
                      {field.label}
                      {(field.mandatory === 1 || field.mandatory === '1') && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </dt>
                    <dd className="text-base text-gray-900 break-words">
                      {this.renderFieldValue(field) || '-'}
                    </dd>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }
}

export default EntityDetail;