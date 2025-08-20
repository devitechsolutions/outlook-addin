import React, { Component } from 'react';
import { UserIcon, EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import ModuleList from './ModuleList';
import EntityForm from '../forms/EntityForm';

class CreateMode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectMode: !props.preSelectedModule, // If module is pre-selected, skip selection
      showEntityForm: false,
      module: props.preSelectedModule || '',
      selectedModule: props.preSelectedModule || '',
    };
  }

  componentDidMount() {
    // If module is pre-selected, go directly to form
    if (this.props.preSelectedModule) {
      this.setState({
        module: this.props.preSelectedModule,
        selectedModule: this.props.preSelectedModule,
        selectMode: false,
        showEntityForm: true,
      });
    }
  }

  handleModuleSelect = (selectedModule) => {
    console.log('CreateMode: Module selected:', selectedModule);
    this.setState({
      module: selectedModule,
      selectedModule: selectedModule,
      selectMode: false,
      showEntityForm: true,
    });
  };

  handleCancel = () => {
    if (this.props.preSelectedModule) {
      // If module was pre-selected, go back to parent
      this.props.onCancel?.();
    } else {
      // Otherwise go back to module selection
      this.setState({
        showEntityForm: false,
        selectedModule: '',
        selectMode: true,
      });
    }
  };

  handleSuccess = () => {
    this.props.onCheckingMail?.();
    this.handleCancel();
  };

  render() {
    const { selectMode, showEntityForm, selectedModule } = this.state;
    const { fromEmail, firstname, lastname } = this.props;
    const fullname = `${firstname} ${lastname}`;

    return (
      <div className="space-y-4">
        {/* User Info Card */}
        {!this.props.hideUserCard && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fullname}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <EnvelopeIcon className="w-3 h-3 mr-1" />
                  <span className="truncate">{fromEmail}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module Selection or Form */}
        {selectMode && (
          <ModuleList onModuleSelect={this.handleModuleSelect} onLogout={this.props.onLogout} />
        )}
        {showEntityForm && (
          <EntityForm
            module={selectedModule}
            onCancel={this.handleCancel}
            onSuccess={this.handleSuccess}
            onLogout={this.props.onLogout}
            firstname={firstname}
            lastname={lastname}
            fromEmail={fromEmail}
            {...this.props}
          />
        )}
      </div>
    );
  }
}

export default CreateMode;