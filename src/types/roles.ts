export enum UserRole {
  SYSTEM_ADMIN = 'system_admin',
  SYSTEM_DEVELOPER = 'system_developer',
  CUSTOMER_ADMIN = 'customer_admin',
  CUSTOMER_MANAGER = 'customer_manager',
  CUSTOMER_USER = 'customer_user'
}

export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.SYSTEM_ADMIN]: [
    'access_all_system_features',
    'manage_system_users',
    'configure_frameworks',
    'view_all_customers',
    'manage_customer_access'
  ],
  [UserRole.SYSTEM_DEVELOPER]: [
    'access_system_features',
    'develop_frameworks',
    'view_customer_data',
    'test_features'
  ],
  [UserRole.CUSTOMER_ADMIN]: [
    'manage_customer_users',
    'configure_customer_settings',
    'view_customer_reports',
    'manage_compliance'
  ],
  [UserRole.CUSTOMER_MANAGER]: [
    'manage_compliance',
    'view_reports',
    'submit_evidence',
    'monitor_status'
  ],
  [UserRole.CUSTOMER_USER]: [
    'view_compliance',
    'submit_evidence',
    'view_dashboard'
  ]
};

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  lastLogin: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemUser extends BaseUser {
  systemRole: string;
  developerAccess: boolean;
}

export interface CustomerUser extends BaseUser {
  customerId: string;
  customerRole: string;
  customerPermissions: string[];
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  complianceFrameworks: string[];
  users: CustomerUser[];
  settings: {
    timezone: string;
    currency: string;
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      slack: boolean;
    };
  };
}
