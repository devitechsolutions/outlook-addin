import React, { Component } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';
import LoadingSpinner from '../common/LoadingSpinner';

class AddCommentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      comments: [],
      validated: false,
      saving: false,
      commentContent: '',
      refresh: false,
    };
  }

  componentDidMount() {
    this.loadComments();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.refresh !== this.state.refresh) {
      this.loadComments();
    }
  }

  loadComments = async () => {
    const { crmid, onLogout } = this.props;
    
    this.setState({ loading: true });
    
    try {
      const result = await apiService.getRelatedRecords(crmid, 'ModComments');
      
      if (result.success) {
        this.setState({
          comments: result.data.data || [],
          loading: false,
        });
      } else if (result.needsLogout && onLogout) {
        onLogout();
      } else {
        this.setState({ loading: false });
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      this.setState({ loading: false });
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity()) {
      this.setState({ validated: false, saving: true });

      const formData = new FormData(form);
      const formDataObj = Object.fromEntries(formData.entries());

      try {
        const result = await apiService.saveComment(formDataObj);
        
        if (result.success) {
          this.setState({
            commentContent: '',
            refresh: !this.state.refresh,
          });
          toast.success('Comment saved successfully');
        } else if (result.needsLogout && this.props.onLogout) {
          this.props.onLogout();
        }
      } catch (error) {
        console.error('Error saving comment:', error);
      } finally {
        this.setState({ saving: false });
      }
    } else {
      this.setState({ validated: true });
    }
  };

  handleCommentChange = (e) => {
    this.setState({ commentContent: e.target.value });
  };

  handleReset = () => {
    this.setState({ commentContent: '' });
  };

  render() {
    const { loading, comments, validated, saving, commentContent } = this.state;
    const { crmid, onCancel } = this.props;

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <button
            onClick={onCancel}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <hr className="mb-4" />
          
          {/* Comment Form */}
          <form
            className={`${validated ? 'was-validated' : ''}`}
            onSubmit={this.handleSubmit}
          >
            <input type="hidden" name="crmid" value={crmid} />
            
            <div className="mb-4">
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-vertical"
                rows="3"
                placeholder="Type comment here..."
                name="commentcontent"
                required
                value={commentContent}
                onChange={this.handleCommentChange}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-outline"
                disabled={saving}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn-primary"
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

        {/* Comments List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Comments</h3>
          <h3 className="text-base font-medium text-gray-900 mb-4">Comments</h3>
          
          {loading ? (
            <LoadingSpinner label="Loading comments..." />
          ) : (
            <div className="space-y-4">
              {Object.entries(comments).map(([key, comment]) => (
                <div key={key} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="mb-2">
                    <p className="text-sm text-gray-900">{comment.commentcontent}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{comment.assigned_user_id?.label}</span>
                    <span>{comment.modifiedtime}</span>
                  </div>
                </div>
              ))}
              {Object.keys(comments).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default AddCommentForm;