import React from 'react';
import {
  DocumentTextIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  PresentationChartBarIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  DocumentIcon,
  UserPlusIcon,
  CubeIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export const renderIcon = (relModule) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (relModule) {
    case 'Detail':
      return <DocumentTextIcon {...iconProps} />;
    case 'Contacts':
      return <UserIcon {...iconProps} />;
    case 'Accounts':
      return <BuildingOfficeIcon {...iconProps} />;
    case 'Leads':
      return <UserPlusIcon {...iconProps} />;
    case 'ModComments':
      return <ChatBubbleLeftRightIcon {...iconProps} />;
    case 'Documents':
      return <DocumentIcon {...iconProps} />;
    case 'Emails':
      return <EnvelopeIcon {...iconProps} />;
    case 'Calendar':
      return <CalendarIcon {...iconProps} />;
    case 'Invoice':
      return <CurrencyDollarIcon {...iconProps} />;
    case 'SalesOrder':
      return <ClipboardDocumentListIcon {...iconProps} />;
    case 'Products':
      return <CubeIcon {...iconProps} />;
    case 'PBXManager':
      return <PhoneIcon {...iconProps} />;
    case 'Services':
      return <WrenchScrewdriverIcon {...iconProps} />;
    case 'Potentials':
      return <CurrencyDollarIcon {...iconProps} />;
    case 'Vendors':
      return <HomeIcon {...iconProps} />;
    case 'PurchaseOrder':
      return <PresentationChartBarIcon {...iconProps} />;
    case 'Quotes':
      return <QuestionMarkCircleIcon {...iconProps} />;
    case 'Task':
      return <ClipboardDocumentCheckIcon {...iconProps} />;
    default:
      return <DocumentTextIcon {...iconProps} />;
  }
};