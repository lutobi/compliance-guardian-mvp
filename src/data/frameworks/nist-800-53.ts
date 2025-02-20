export const nist80053 = {
  id: 'nist-800-53',
  name: 'NIST 800-53',
  version: 'Rev. 5',
  description: 'Security and Privacy Controls for Information Systems and Organizations',
  categories: [
    'Access Control',
    'Awareness and Training',
    'Audit and Accountability',
    'Security Assessment and Authorization',
    'Configuration Management',
    'Contingency Planning',
    'Identification and Authentication',
    'Incident Response',
    'Maintenance',
    'Media Protection',
    'Physical and Environmental Protection',
    'Planning',
    'Program Management',
    'Personnel Security',
    'Risk Assessment',
    'System and Services Acquisition',
    'System and Communications Protection',
    'System and Information Integrity',
    'Supply Chain Risk Management'
  ],
  controls: [
    {
      id: 'AC',
      name: 'Access Control',
      description: 'Access Control family of controls',
      subcontrols: [
        {
          id: 'AC-1',
          name: 'Policy and Procedures',
          description: 'Establish and maintain access control policies and procedures.'
        },
        {
          id: 'AC-2',
          name: 'Account Management',
          description: 'Manage system accounts, including establishing, activating, modifying, reviewing, disabling, and removing accounts.'
        },
        {
          id: 'AC-3',
          name: 'Access Enforcement',
          description: 'Enforce approved authorizations for logical access to information and system resources.'
        },
        {
          id: 'AC-4',
          name: 'Information Flow Enforcement',
          description: 'Enforce approved authorizations for controlling the flow of information within the system and between connected systems.'
        },
        {
          id: 'AC-5',
          name: 'Separation of Duties',
          description: 'Separate duties of individuals to prevent malicious activities.'
        },
        {
          id: 'AC-6',
          name: 'Least Privilege',
          description: 'Employ the principle of least privilege, allowing only authorized accesses necessary to accomplish assigned tasks.'
        },
        {
          id: 'AC-7',
          name: 'Unsuccessful Logon Attempts',
          description: 'Enforce limits on unsuccessful logon attempts.'
        },
        {
          id: 'AC-8',
          name: 'System Use Notification',
          description: 'Display system use notification message before granting access.'
        },
        {
          id: 'AC-9',
          name: 'Previous Logon Notification',
          description: 'Notify user of last successful logon/access.'
        },
        {
          id: 'AC-10',
          name: 'Concurrent Session Control',
          description: 'Limit the number of concurrent sessions for each system account.'
        },
        {
          id: 'AC-11',
          name: 'Device Lock',
          description: 'Automatically lock session after period of inactivity.'
        },
        {
          id: 'AC-12',
          name: 'Session Termination',
          description: 'Automatically terminate user sessions after defined conditions.'
        },
        {
          id: 'AC-13',
          name: 'Supervision and Review — Access Control',
          description: 'Supervise and review the activities of users with respect to enforcement of access control.'
        },
        {
          id: 'AC-14',
          name: 'Permitted Actions without Identification or Authentication',
          description: 'Identify and document specific user actions that can be performed without identification or authentication.'
        },
        {
          id: 'AC-15',
          name: 'Automated Marking',
          description: 'Mark output using standard naming conventions.'
        },
        {
          id: 'AC-16',
          name: 'Security and Privacy Attributes',
          description: 'Support and maintain the binding of security and privacy attributes to information in storage, in process, and in transmission.'
        },
        {
          id: 'AC-17',
          name: 'Remote Access',
          description: 'Establish and manage remote access to system.'
        },
        {
          id: 'AC-18',
          name: 'Wireless Access',
          description: 'Establish configuration requirements and connection requirements for wireless access.'
        },
        {
          id: 'AC-19',
          name: 'Access Control for Mobile Devices',
          description: 'Establish usage restrictions and implementation guidance for mobile devices.'
        },
        {
          id: 'AC-20',
          name: 'Use of External Systems',
          description: 'Establish terms and conditions for external systems.'
        },
        {
          id: 'AC-21',
          name: 'Information Sharing',
          description: 'Enable authorized users to determine whether access authorizations match access restrictions.'
        },
        {
          id: 'AC-22',
          name: 'Publicly Accessible Content',
          description: 'Make publicly accessible information available with appropriate restrictions.'
        },
        {
          id: 'AC-23',
          name: 'Data Mining Protection',
          description: 'Employ data mining prevention and detection techniques.'
        },
        {
          id: 'AC-24',
          name: 'Access Control Decisions',
          description: 'Establish access control decisions based on approved authorizations.'
        },
        {
          id: 'AC-25',
          name: 'Reference Monitor',
          description: 'Implement a reference monitor to enforce access control policies.'
        }
      ]
    },
    {
      id: 'AT',
      name: 'Awareness and Training',
      description: 'Security awareness and training controls',
      subcontrols: [
        {
          id: 'AT-1',
          name: 'Policy and Procedures',
          description: 'Establish security awareness and training policy and procedures.'
        },
        {
          id: 'AT-2',
          name: 'Literacy Training and Awareness',
          description: 'Provide security and privacy literacy training to system users.'
        },
        {
          id: 'AT-3',
          name: 'Role-Based Training',
          description: 'Provide role-based security and privacy training to personnel with assigned security and privacy roles.'
        },
        {
          id: 'AT-4',
          name: 'Training Records',
          description: 'Document and monitor individual information system security and privacy training activities.'
        },
        {
          id: 'AT-5',
          name: 'Training Feedback',
          description: 'Provide feedback on organizational training results.'
        },
        {
          id: 'AT-6',
          name: 'Training Environment',
          description: 'Provide a realistic training environment that reflects actual system operations.'
        }
      ]
    },
    {
      id: 'AU',
      name: 'Audit and Accountability',
      description: 'Audit and accountability controls',
      subcontrols: [
        {
          id: 'AU-1',
          name: 'Policy and Procedures',
          description: 'Establish audit and accountability policies and procedures.'
        },
        {
          id: 'AU-2',
          name: 'Event Logging',
          description: 'Identify the types of events that the system is capable of logging.'
        },
        {
          id: 'AU-3',
          name: 'Content of Audit Records',
          description: 'Ensure audit records contain information that establishes what type of event occurred.'
        },
        {
          id: 'AU-4',
          name: 'Audit Storage Capacity',
          description: 'Allocate audit record storage capacity and configure auditing.'
        },
        {
          id: 'AU-5',
          name: 'Response to Audit Processing Failures',
          description: 'Alert personnel in the event of an audit processing failure.'
        },
        {
          id: 'AU-6',
          name: 'Audit Review, Analysis, and Reporting',
          description: 'Review and analyze system audit records for inappropriate or unusual activity.'
        },
        {
          id: 'AU-7',
          name: 'Audit Reduction and Report Generation',
          description: 'Provide audit reduction and report generation capability.'
        },
        {
          id: 'AU-8',
          name: 'Time Stamps',
          description: 'Use internal system clocks to generate time stamps for audit records.'
        },
        {
          id: 'AU-9',
          name: 'Protection of Audit Information',
          description: 'Protect audit information and audit tools from unauthorized access, modification, and deletion.'
        },
        {
          id: 'AU-10',
          name: 'Non-repudiation',
          description: 'Provide non-repudiation of actions.'
        },
        {
          id: 'AU-11',
          name: 'Audit Record Retention',
          description: 'Retain audit records to provide support for after-the-fact investigations.'
        },
        {
          id: 'AU-12',
          name: 'Audit Generation',
          description: 'Provide system capability to generate audit records.'
        },
        {
          id: 'AU-13',
          name: 'Monitoring for Information Disclosure',
          description: 'Monitor system for unauthorized disclosure of information.'
        },
        {
          id: 'AU-14',
          name: 'Session Audit',
          description: 'Provide capability to capture/record and log user sessions.'
        },
        {
          id: 'AU-15',
          name: 'Alternate Audit Capability',
          description: 'Provide alternate audit capability in case of system failure.'
        },
        {
          id: 'AU-16',
          name: 'Cross-Organizational Auditing',
          description: 'Employ mechanisms for coordinating audit information among external organizations.'
        }
      ]
    },
    {
      id: 'CM',
      name: 'Configuration Management',
      description: 'Configuration management controls for information systems',
      subcontrols: [
        {
          id: 'CM-1',
          name: 'Policy and Procedures',
          description: 'Establish and maintain configuration management policies and procedures.'
        },
        {
          id: 'CM-2',
          name: 'Baseline Configuration',
          description: 'Develop, document, and maintain baseline configurations of organizational systems.'
        },
        {
          id: 'CM-3',
          name: 'Configuration Change Control',
          description: 'Track and control changes to the system configuration.'
        },
        {
          id: 'CM-4',
          name: 'Security Impact Analysis',
          description: 'Analyze changes to the system to determine potential security impacts prior to change implementation.'
        },
        {
          id: 'CM-5',
          name: 'Access Restrictions for Change',
          description: 'Define, document, approve, and enforce physical and logical access restrictions for changes to the system.'
        },
        {
          id: 'CM-6',
          name: 'Configuration Settings',
          description: 'Establish and document configuration settings for components employed within the system.'
        },
        {
          id: 'CM-7',
          name: 'Least Functionality',
          description: 'Configure the system to provide only essential capabilities.'
        },
        {
          id: 'CM-8',
          name: 'System Component Inventory',
          description: 'Develop and document an inventory of system components.'
        },
        {
          id: 'CM-9',
          name: 'Configuration Management Plan',
          description: 'Develop, document, and implement a configuration management plan for the system.'
        },
        {
          id: 'CM-10',
          name: 'Software Usage Restrictions',
          description: 'Use software and associated documentation in accordance with contract agreements and copyright laws.'
        },
        {
          id: 'CM-11',
          name: 'User-Installed Software',
          description: 'Establish policies governing the installation of software by users.'
        },
        {
          id: 'CM-12',
          name: 'Information Location',
          description: 'Track the location of system components.'
        },
        {
          id: 'CM-13',
          name: 'Data Action Mapping',
          description: 'Develop and document a map of system data actions.'
        },
        {
          id: 'CM-14',
          name: 'Signed Components',
          description: 'Prevent the installation of software and firmware components without verification of the component signatures.'
        }
      ]
    },
    {
      id: 'CP',
      name: 'Contingency Planning',
      description: 'Controls to ensure system availability and recovery',
      subcontrols: [
        {
          id: 'CP-1',
          name: 'Policy and Procedures',
          description: 'Develop, document, and disseminate contingency planning policy and procedures.'
        },
        {
          id: 'CP-2',
          name: 'Contingency Plan',
          description: 'Develop and maintain a contingency plan for the system.'
        },
        {
          id: 'CP-3',
          name: 'Contingency Training',
          description: 'Train personnel in their contingency roles and responsibilities.'
        },
        {
          id: 'CP-4',
          name: 'Contingency Plan Testing',
          description: 'Test the contingency plan to determine effectiveness and readiness.'
        },
        {
          id: 'CP-5',
          name: 'Contingency Plan Update',
          description: 'Review and update the contingency plan to address changes or problems.'
        },
        {
          id: 'CP-6',
          name: 'Alternate Storage Site',
          description: 'Establish an alternate storage site including necessary agreements.'
        },
        {
          id: 'CP-7',
          name: 'Alternate Processing Site',
          description: 'Establish an alternate processing site including necessary agreements.'
        },
        {
          id: 'CP-8',
          name: 'Telecommunications Services',
          description: 'Establish alternate telecommunications services including necessary agreements.'
        },
        {
          id: 'CP-9',
          name: 'System Backup',
          description: 'Conduct system backups and protect backup information.'
        },
        {
          id: 'CP-10',
          name: 'System Recovery and Reconstitution',
          description: 'Provide for recovery and reconstitution of the system to a known state.'
        },
        {
          id: 'CP-11',
          name: 'Alternate Communications Protocols',
          description: 'Provide the capability to employ alternative communications protocols.'
        },
        {
          id: 'CP-12',
          name: 'Safe Mode',
          description: 'Implement a safe mode of operation for the system.'
        },
        {
          id: 'CP-13',
          name: 'Alternative Security Mechanisms',
          description: 'Employ alternative or supplemental security mechanisms when primary means of implementing a security function is unavailable.'
        }
      ]
    }
  ]
};
