/* AUTO-GENERATED: DO NOT EDIT */
export const nist80053 = {
  "id": "nist-800-53",
  "name": "NIST SP 800-53",
  "version": "5.1.1+u4",
  "description": "NIST Special Publication 800-53 Revision 5.1.1 LOW IMPACT BASELINE",
  "categories": [
    "Access Control",
    "Awareness and Training",
    "Audit and Accountability",
    "Assessment, Authorization, and Monitoring",
    "Configuration Management",
    "Contingency Planning",
    "Identification and Authentication",
    "Incident Response",
    "Maintenance",
    "Media Protection",
    "Physical and Environmental Protection",
    "Planning",
    "Personnel Security",
    "Risk Assessment",
    "System and Services Acquisition",
    "System and Communications Protection",
    "System and Information Integrity",
    "Supply Chain Risk Management"
  ],
  "controls": [
    {
      "id": "AC",
      "name": "Access Control",
      "description": "",
      "subcontrols": [
        {
          "id": "AC-2",
          "name": "Inventory and manage user accounts",
          "description": "Inventory and manage user accounts, ensuring permissions are aligned with job responsibilities."
        },
        {
          "id": "AC-7",
          "name": "Enforce failed login thresholds",
          "description": "Establish and enforce failed login attempt thresholds."
        }
      ]
    },
    {
      "id": "AT",
      "name": "Awareness and Training",
      "description": "",
      "subcontrols": [
        {
          "id": "AT-2",
          "name": "Develop security training curriculum",
          "description": "Develop a comprehensive security training curriculum tailored to different roles."
        },
        {
          "id": "AT-3",
          "name": "Maintain training completion records",
          "description": "Keep records of training completion for audits and continuous improvement."
        }
      ]
    },
    {
      "id": "AU",
      "name": "Audit and Accountability",
      "description": "",
      "subcontrols": [
        {
          "id": "AU-2",
          "name": "Centralized audit logging",
          "description": "Set up centralized logging and ensure logs are protected against unauthorized access and tampering."
        },
        {
          "id": "AU-6",
          "name": "Review audit logs",
          "description": "Regularly review audit logs for signs of unauthorized or anomalous activity."
        },
        {
          "id": "AU-9",
          "name": "Protect audit logs",
          "description": "Ensure logs are protected against unauthorized access and tampering."
        }
      ]
    },
    {
      "id": "CA",
      "name": "Assessment, Authorization, and Monitoring",
      "description": "",
      "subcontrols": [
        {
          "id": "CA-2",
          "name": "Perform security control assessments",
          "description": "Schedule and perform regular security control assessments to validate efficacy."
        },
        {
          "id": "CA-6",
          "name": "Maintain authorization package",
          "description": "Document and maintain a current authorization package for each system."
        }
      ]
    },
    {
      "id": "CM",
      "name": "Configuration Management",
      "description": "",
      "subcontrols": [
        {
          "id": "CM-2",
          "name": "Baseline security configurations",
          "description": "Create and implement baseline security configurations for all IT assets."
        }
      ]
    },
    {
      "id": "CP",
      "name": "Contingency Planning",
      "description": "",
      "subcontrols": [
        {
          "id": "CP-2",
          "name": "Develop contingency plan",
          "description": "Develop detailed, actionable recovery plans for various types of operational disruptions."
        },
        {
          "id": "CP-4",
          "name": "Test contingency plans",
          "description": "Conduct regular drills and simulations to test and refine contingency plans."
        }
      ]
    },
    {
      "id": "IA",
      "name": "Identification and Authentication",
      "description": "",
      "subcontrols": [
        {
          "id": "IA-2",
          "name": "Implement multifactor authentication",
          "description": "Implement multifactor authentication (MFA) wherever feasible."
        },
        {
          "id": "IA-5",
          "name": "Review authentication methods",
          "description": "Regularly review and update user authentication methods to maintain robust security."
        }
      ]
    },
    {
      "id": "IR",
      "name": "Incident Response",
      "description": "",
      "subcontrols": [
        {
          "id": "IR-2",
          "name": "Assign incident response roles & training",
          "description": "Assign incident response roles and ensure all team members are trained."
        },
        {
          "id": "IR-4",
          "name": "Define incident response process",
          "description": "Develop a formal incident response process that includes preparation, detection, analysis, containment, eradication, and recovery phases."
        }
      ]
    },
    {
      "id": "RA",
      "name": "Risk Assessment",
      "description": "",
      "subcontrols": [
        {
          "id": "RA-3",
          "name": "Conduct risk assessments",
          "description": "Identify and document potential threat sources and vulnerabilities; utilize quantitative and qualitative methods to assess security risks and prioritize remedial actions."
        }
      ]
    },
    {
      "id": "SA",
      "name": "System and Services Acquisition",
      "description": "",
      "subcontrols": [
        {
          "id": "SA-4",
          "name": "Integrate security into procurement",
          "description": "Integrate security considerations into the procurement process; regularly evaluate vendors’ security practices to ensure they meet or exceed your standards."
        }
      ]
    },
    {
      "id": "SC",
      "name": "System and Communications Protection",
      "description": "",
      "subcontrols": [
        {
          "id": "SC-7",
          "name": "Network segmentation & firewalls",
          "description": "Employ network segmentation, firewalls, and encryption to protect network traffic."
        },
        {
          "id": "SC-13",
          "name": "Monitor communications boundaries",
          "description": "Monitor and control communications at external and key internal boundaries."
        }
      ]
    },
    {
      "id": "SI",
      "name": "System and Information Integrity",
      "description": "",
      "subcontrols": [
        {
          "id": "SI-2",
          "name": "Deploy anti-malware & IDS",
          "description": "Deploy anti-malware solutions and intrusion detection systems."
        },
        {
          "id": "SI-3",
          "name": "Implement timely patching",
          "description": "Implement processes for timely patching of systems and applications."
        }
      ]
    }
  ]
} as const;
