export const hipaa = {
  id: 'hipaa',
  name: 'HIPAA',
  version: '2013',
  description: 'Health Insurance Portability and Accountability Act - US healthcare data privacy and security standards',
  categories: [
    'Privacy Rule',
    'Security Rule',
    'Breach Notification Rule',
    'Enforcement Rule'
  ],
  controls: [
    {
      id: 'PRV',
      name: 'Privacy Rule',
      description: 'Standards for protection and use of protected health information (PHI)',
      subcontrols: [
        {
          id: 'PRV-1',
          name: 'Use and Disclosure',
          description: 'Requirements for using and disclosing protected health information'
        },
        {
          id: 'PRV-2',
          name: 'Minimum Necessary',
          description: 'Limit use and disclosure of PHI to minimum necessary for intended purpose'
        },
        {
          id: 'PRV-3',
          name: 'Patient Rights',
          description: 'Rights of individuals regarding their health information including access, amendments, and accounting of disclosures'
        },
        {
          id: 'PRV-4',
          name: 'Notice of Privacy Practices',
          description: 'Requirements for informing individuals about privacy practices and their rights'
        },
        {
          id: 'PRV-5',
          name: 'Business Associates',
          description: 'Requirements for agreements with business associates who handle PHI'
        }
      ]
    },
    {
      id: 'SEC',
      name: 'Security Rule',
      description: 'Administrative, physical, and technical safeguards for electronic PHI',
      subcontrols: [
        {
          id: 'SEC-A',
          name: 'Administrative Safeguards',
          description: 'Security management, workforce security, information access, training, and evaluation'
        },
        {
          id: 'SEC-A1',
          name: 'Security Management Process',
          description: 'Risk analysis, risk management, sanction policy, and information system activity review'
        },
        {
          id: 'SEC-A2',
          name: 'Workforce Security',
          description: 'Authorization and supervision, workforce clearance, and termination procedures'
        },
        {
          id: 'SEC-P',
          name: 'Physical Safeguards',
          description: 'Facility access, workstation use, and device and media controls'
        },
        {
          id: 'SEC-P1',
          name: 'Facility Access Controls',
          description: 'Contingency operations, facility security plan, access control and validation'
        },
        {
          id: 'SEC-P2',
          name: 'Workstation and Device Security',
          description: 'Proper workstation use and security, and mobile device policies'
        },
        {
          id: 'SEC-T',
          name: 'Technical Safeguards',
          description: 'Access control, audit controls, integrity, authentication, and transmission security'
        },
        {
          id: 'SEC-T1',
          name: 'Access Control',
          description: 'Unique user identification, emergency access, automatic logoff, and encryption'
        },
        {
          id: 'SEC-T2',
          name: 'Audit Controls',
          description: 'Hardware, software, and procedural mechanisms to record and examine activity'
        },
        {
          id: 'SEC-T3',
          name: 'Transmission Security',
          description: 'Technical security measures to guard against unauthorized access to ePHI in transit'
        }
      ]
    },
    {
      id: 'BRE',
      name: 'Breach Notification',
      description: 'Requirements for notification of breaches of unsecured PHI',
      subcontrols: [
        {
          id: 'BRE-1',
          name: 'Breach Definition',
          description: 'What constitutes a breach of unsecured protected health information'
        },
        {
          id: 'BRE-2',
          name: 'Risk Assessment',
          description: 'Assessment of probability that PHI has been compromised'
        },
        {
          id: 'BRE-3',
          name: 'Notification to Individuals',
          description: 'Requirements for notifying affected individuals of a breach'
        },
        {
          id: 'BRE-4',
          name: 'Notification to Media',
          description: 'Requirements for notifying media of breaches affecting more than 500 residents'
        },
        {
          id: 'BRE-5',
          name: 'Notification to Secretary',
          description: 'Requirements for notifying the Secretary of HHS of breaches'
        }
      ]
    },
    {
      id: 'ENF',
      name: 'Enforcement Rule',
      description: 'Compliance and investigation processes, and penalties for violations',
      subcontrols: [
        {
          id: 'ENF-1',
          name: 'Compliance Reviews',
          description: 'Process for reviewing compliance with HIPAA rules'
        },
        {
          id: 'ENF-2',
          name: 'Cooperation with Investigations',
          description: 'Requirements for cooperating with compliance investigations'
        },
        {
          id: 'ENF-3',
          name: 'Civil Money Penalties',
          description: 'Monetary penalties for violations of HIPAA rules'
        },
        {
          id: 'ENF-4',
          name: 'Criminal Penalties',
          description: 'Criminal penalties for knowing violations of HIPAA rules'
        }
      ]
    }
  ]
};
