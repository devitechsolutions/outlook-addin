import React, { Component } from 'react';
import { ArrowLeftIcon, PlusIcon, UserGroupIcon, PencilIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';
import LoadingSpinner from '../common/LoadingSpinner';

class Activities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      activities: [],
      isCreatable: false,
    };
  }

  componentDidMount() {
    this.loadActivities();
  }

  loadActivities = async () => {
    const { crmid, onLogout } = this.props;
    
    this.setState({ loading: true });
    
    try {
      const result = await apiService.getUpcomingActivities(crmid);
      
      if (result.success) {
        this.setState({
          activities: result.data.data || [],
          isCreatable: result.data.creatable || false,
          loading: false,
        });
      } else if (result.needsLogout && onLogout) {
        onLogout();
      } else {
        this.setState({ loading: false });
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, activities, isCreatable } = this.state;
    const { onCancel } = this.props;

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner label="Loading activities..." variant="modern" size="large" />
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onCancel}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </button>
            {isCreatable && (
              <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <PlusIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Activities List */}
        <div className="p-4">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(activities).map(([key, activity]) => {
                const record = activity.id.split('x')[1];
                return (
                  <div key={key} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <UserGroupIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <a
                            href={`#/calendar/detail/${record}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
                          >
                            {activity.subject}
                          </a>
                        </div>
                      </div>
                      {activity.iseditable && (
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="ml-8">
                      <p className="text-xs text-gray-500">{activity.startDateTime}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No pending activities</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Activities;