'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { StorageService } from '@/services/storage';
import { Evidence, EvidenceMap } from '@/types/evidence';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EvidenceDialog from './evidence-dialog';

// Mock data - we'll replace this with actual data later
const frameworkData: Record<string, any> = {
  'nist-800-53': {
    name: 'NIST 800-53',
    version: 'Rev. 5',
    controls: [
      {
        id: 'AC',
        name: 'Access Control',
        description: 'Access Control family of controls',
        subcontrols: [
          {
            id: 'AC-1',
            name: 'Access Control Policy and Procedures',

            description: 'The organization develops, documents, and disseminates an access control policy.'
          },
          {
            id: 'AC-2',
            name: 'Account Management',

            description: 'The organization manages information system accounts.'
          },
          {
            id: 'AC-3',
            name: 'Access Enforcement',

            description: 'The system enforces approved authorizations for access.'
          }
        ]
      },
      {
        id: 'AU',
        name: 'Audit and Accountability',
        description: 'Audit and Accountability family of controls',
        subcontrols: [
          {
            id: 'AU-1',
            name: 'Audit and Accountability Policy and Procedures',

            description: 'The organization develops and maintains audit policies.'
          },
          {
            id: 'AU-2',
            name: 'Audit Events',

            description: 'The organization determines events to be audited.'
          }
        ]
      },
      {
        id: 'CM',
        name: 'Configuration Management',
        description: 'Configuration Management family of controls',
        subcontrols: [
          {
            id: 'CM-1',
            name: 'Configuration Management Policy and Procedures',

            description: 'The organization establishes configuration management policies.'
          }
        ]
      }
    ]
  },
  'pci-dss': {
    name: 'PCI DSS',
    version: '4.0',
    controls: [
      {
        id: 'REQ-1',
        name: 'Install and Maintain Network Security Controls',
        description: 'Install and maintain network security controls to protect systems and networks.',
        subcontrols: [
          {
            id: 'REQ-1.1',
            name: 'Network Security Controls',
            description: 'Network security controls (NSCs) are configured and maintained.',
            requirements: [
              'Define network security control standards',
              'Document approved services and protocols',
              'Review configurations quarterly',
              'Maintain documentation of business justification'
            ]
          },
          {
            id: 'REQ-1.2',
            name: 'Network Connections',
            description: 'Network connections between trusted and untrusted networks are controlled.',
            requirements: [
              'Restrict inbound and outbound traffic',
              'Review connection rules quarterly',
              'Maintain documentation of all connections',
              'Implement security features for high-risk services'
            ]
          }
        ]
      },
      {
        id: 'REQ-2',
        name: 'Apply Secure Configurations',
        description: 'Apply secure configurations to all system components.',
        subcontrols: [
          {
            id: 'REQ-2.1',
            name: 'Secure Configuration Standards',
            description: 'Maintain secure configuration standards for system components.',
            requirements: [
              'Define security configuration standards',
              'Update standards as new vulnerabilities are identified',
              'Apply standards to all system components',
              'Review configurations at least annually'
            ]
          },
          {
            id: 'REQ-2.2',
            name: 'Vendor Default Security',
            description: 'Manage vendor-supplied defaults and other security parameters.',
            requirements: [
              'Change vendor-supplied defaults',
              'Remove/disable unnecessary accounts',
              'Configure security parameters appropriately',
              'Document custom security parameters'
            ]
          }
        ]
      },
      {
        id: 'REQ-3',
        name: 'Protect Stored Account Data',
        description: 'Protect stored account data.',
        subcontrols: [
          {
            id: 'REQ-3.1',
            name: 'Data Storage and Retention',
            description: 'Keep cardholder data storage to a minimum.',
            requirements: [
              'Document data retention policies',
              'Implement data disposal procedures',
              'Maintain data inventory',
              'Review storage locations quarterly'
            ]
          }
        ]
      }
    ]
  },
  'iso-27001': {
    name: 'ISO 27001',
    version: '2013',
    controls: [
      {
        id: 'A.5',
        name: 'Information Security Policies',
        description: 'Management direction for information security',
        subcontrols: [
          {
            id: 'A.5.1.1',
            name: 'Policies for information security',
            description: 'A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.',
            requirements: [
              'Define information security policies',
              'Get management approval',
              'Publish and communicate policies',
              'Make policies available to relevant parties'
            ]
          },
          {
            id: 'A.5.1.2',
            name: 'Review of the policies for information security',
            description: 'The policies for information security shall be reviewed at planned intervals or if significant changes occur to ensure their continuing suitability, adequacy and effectiveness.',
            requirements: [
              'Schedule regular policy reviews',
              'Review after significant changes',
              'Assess policy effectiveness',
              'Update policies as needed'
            ]
          }
        ]
      },
      {
        id: 'A.6',
        name: 'Organization of Information Security',
        description: 'Internal organization and mobile devices/teleworking',
        subcontrols: [
          {
            id: 'A.6.1.1',
            name: 'Information security roles and responsibilities',
            description: 'All information security responsibilities shall be defined and allocated.',
            requirements: [
              'Define security roles',
              'Allocate responsibilities',
              'Document and communicate roles',
              'Review role assignments'
            ]
          },
          {
            id: 'A.6.1.2',
            name: 'Segregation of duties',
            description: 'Conflicting duties and areas of responsibility shall be segregated to reduce opportunities for unauthorized or unintentional modification or misuse of the organization\'s assets.',
            requirements: [
              'Identify conflicting duties',
              'Implement duty separation',
              'Document segregation controls',
              'Monitor effectiveness'
            ]
          }
        ]
      },
      {
        id: 'A.7',
        name: 'Human Resource Security',
        description: 'Security aspects for employees joining, moving, and leaving',
        subcontrols: [
          {
            id: 'A.7.1.1',
            name: 'Screening',
            description: 'Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws, regulations and ethics.',
            requirements: [
              'Define screening procedures',
              'Conduct background checks',
              'Document verification results',
              'Comply with regulations'
            ]
          },
          {
            id: 'A.7.1.2',
            name: 'Terms and conditions of employment',
            description: 'The contractual agreements with employees and contractors shall state their and the organization\'s responsibilities for information security.',
            requirements: [
              'Include security in contracts',
              'Define responsibilities',
              'Obtain acknowledgment',
              'Review agreements periodically'
            ]
          }
        ]
      }
    ]
  }
};



interface PageProps {
  params: { id: string };
}

const FrameworkDetail: React.FC<PageProps> = ({ params }) => {
  const framework = frameworkData[params.id as keyof typeof frameworkData];
  const [selectedSubcontrol, setSelectedSubcontrol] = useState<string | null>(null);
  const [evidenceMap, setEvidenceMap] = useState<EvidenceMap>({});
  const [error, setError] = useState<string>();
  const storageService = new StorageService();

  // Load evidence data
  useEffect(() => {
    const loadEvidence = async () => {
      const result = await storageService.getEvidence(params.id);
      if (result.success) {
        setEvidenceMap(result.data);
      } else {
        setError(result.error?.message);
      }
    };
    loadEvidence();
  }, [params.id]);

  // Save evidence data
  useEffect(() => {
    const saveEvidence = async () => {
      if (Object.keys(evidenceMap).length > 0) {
        const result = await storageService.setEvidence(params.id, evidenceMap);
        if (!result.success) {
          setError(result.error?.message);
        }
      }
    };
    saveEvidence();
  }, [evidenceMap, params.id]);
  
  if (!framework) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Framework Not Found</h1>
          <Link href="/frameworks" className="text-blue-600 hover:underline">
            Back to Frameworks
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/frameworks" className="text-blue-600 hover:underline">
            ← Back to Frameworks
          </Link>
          <h1 className="text-2xl font-bold">{framework.name}</h1>
          <span className="px-2 py-1 bg-gray-100 rounded text-sm">
            Version {framework.version}
          </span>
        </div>
      </header>

      <div className="space-y-8">
        {framework.controls.map((control) => (
          <div key={control.id} className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {control.id} - {control.name}
              </h2>
              <span className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                {control.subcontrols.length} Subcontrols
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {control.subcontrols.map((subcontrol) => (
                <div key={subcontrol.id} className="border rounded-lg p-3 hover:border-blue-500 hover:shadow-sm transition-all bg-white">

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">{subcontrol.id}</span>
                      <span className="text-gray-800">{subcontrol.name}</span>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setSelectedSubcontrol(subcontrol.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Upload Evidence"
                      >
                        📎
                      </button>
                      {evidenceMap[subcontrol.id]?.length > 0 && (
                        <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {evidenceMap[subcontrol.id].length}
                        </span>
                      )}
                    </div>
                  </div>
                  <EvidenceDialog
                    subcontrolId={subcontrol.id}
                    isOpen={selectedSubcontrol === subcontrol.id}
                    onClose={() => setSelectedSubcontrol(null)}
                    onSubmit={(evidence) => {
                      setEvidenceMap(prev => ({
                        ...prev,
                        [subcontrol.id]: [...(prev[subcontrol.id] || []), evidence]
                      }));
                    }}
                    onDelete={(evidenceId) => {
                      setEvidenceMap(prev => ({
                        ...prev,
                        [subcontrol.id]: prev[subcontrol.id].filter(e => e.id !== evidenceId)
                      }));
                    }}
                    onUpdate={(evidenceId, updatedEvidence) => {
                      setEvidenceMap(prev => ({
                        ...prev,
                        [subcontrol.id]: prev[subcontrol.id].map(e => 
                          e.id === evidenceId ? updatedEvidence : e
                        )
                      }));
                    }}
                    existingEvidence={evidenceMap[subcontrol.id] || []}
                  />


                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    );
    </ErrorBoundary>
  );
};

export default FrameworkDetail;
