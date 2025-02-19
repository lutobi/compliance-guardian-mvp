import Link from 'next/link';

const frameworks = [
  {
    id: 'nist-800-53',
    name: 'NIST 800-53',
    description: 'Security and Privacy Controls for Information Systems and Organizations',
    version: 'Rev. 5',
    categories: ['Access Control', 'Audit and Accountability', 'Security Assessment']
  },
  {
    id: 'iso-27001',
    name: 'ISO 27001',
    description: 'Information Security Management System (ISMS) Standard',
    version: '2013',
    categories: ['Information Security Policies', 'Asset Management', 'Access Control']
  },
  {
    id: 'pci-dss',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    version: '4.0',
    categories: ['Build and Maintain a Secure Network', 'Protect Cardholder Data', 'Maintain Vulnerability Management Program']
  }
];

export default async function FrameworksPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Compliance Frameworks</h1>

      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {frameworks.map((framework) => (
          <Link 
            key={framework.id}
            href={`/frameworks/${framework.id}`}
            className="block p-6 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-semibold mb-2">{framework.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{framework.description}</p>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600">Version {framework.version}</span>
                <span className="text-gray-500">{framework.categories.length} Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {framework.categories.map((category, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

          </Link>
        ))}
      </div>
    </div>
  );
}
