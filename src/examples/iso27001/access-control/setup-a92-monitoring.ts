import { MonitoringService } from '@/services/MonitoringService';
import { HttpEndpointIntegration } from '@/services/integrations/HttpEndpointIntegration';
import { FileSystemIntegration } from '@/services/integrations/FileSystemIntegration';

interface A92Control {
  id: string;
  title: string;
  description: string;
  monitoringPoints: Array<{
    metric: string;
    type: 'automated' | 'semi-automated' | 'manual';
    frequency: string;
    threshold: string;
    description: string;
  }>;
}

// Define the controls we want to monitor
const a92Controls: A92Control[] = [
  {
    id: 'A.9.2.1',
    title: 'User registration and de-registration',
    description: 'A formal user registration and de-registration process shall be implemented to enable assignment of access rights.',
    monitoringPoints: [
      {
        metric: 'user.management.compliance',
        type: 'automated',
        frequency: '1h',
        threshold: '95',
        description: 'Monitor user registration process compliance'
      },
      {
        metric: 'user.inactive.accounts',
        type: 'automated',
        frequency: '1d',
        threshold: '30',
        description: 'Monitor inactive user accounts (days)'
      }
    ]
  },
  {
    id: 'A.9.2.2',
    title: 'User access provisioning',
    description: 'A formal user access provisioning process shall be implemented to assign or revoke access rights for all user types to all systems and services.',
    monitoringPoints: [
      {
        metric: 'access.review.compliance',
        type: 'automated',
        frequency: '1d',
        threshold: '90',
        description: 'Monitor access review compliance'
      },
      {
        metric: 'access.review.overdue',
        type: 'automated',
        frequency: '1h',
        threshold: '5',
        description: 'Monitor overdue access reviews'
      }
    ]
  },
  {
    id: 'A.9.2.3',
    title: 'Management of privileged access rights',
    description: 'The allocation and use of privileged access rights shall be restricted and controlled.',
    monitoringPoints: [
      {
        metric: 'privileged.accounts.review',
        type: 'automated',
        frequency: '6h',
        threshold: '100',
        description: 'Monitor privileged account review status'
      },
      {
        metric: 'privileged.access.logs',
        type: 'automated',
        frequency: '5m',
        threshold: '1',
        description: 'Monitor privileged access activity'
      }
    ]
  },
  {
    id: 'A.9.2.4',
    title: 'Management of secret authentication information of users',
    description: 'The allocation of secret authentication information shall be controlled through a formal management process.',
    monitoringPoints: [
      {
        metric: 'password.compliance',
        type: 'automated',
        frequency: '1h',
        threshold: '95',
        description: 'Monitor password policy compliance'
      },
      {
        metric: 'password.expiry',
        type: 'automated',
        frequency: '1d',
        threshold: '10',
        description: 'Monitor passwords expiring soon'
      }
    ]
  }
];

async function setupA92Monitoring() {
  const monitoringService = MonitoringService.getInstance();
  
  // 1. Configure HTTP Endpoint Integration
  const httpIntegration = new HttpEndpointIntegration();
  await httpIntegration.configure({
    endpoints: {
      'user.management.compliance': 'http://localhost:3002/api/access-control/user-management',
      'access.review.compliance': 'http://localhost:3002/api/access-control/access-review',
      'password.compliance': 'http://localhost:3002/api/access-control/password-management'
    }
  });

  // 2. Configure File System Integration for log monitoring
  const fileIntegration = new FileSystemIntegration();
  await fileIntegration.configure({
    paths: {
      'privileged.access.logs': '/var/log/auth/privileged-access.log',
      'user.inactive.accounts': '/var/log/auth/user-activity.log'
    }
  });

  // 3. Set up monitoring points for each control
  for (const control of a92Controls) {
    console.log(`Setting up monitoring for ${control.id}: ${control.title}`);
    
    for (const point of control.monitoringPoints) {
      await monitoringService.createMonitoringPoint({
        control_id: `ISO27001-${control.id}`,
        ...point,
        evidence_required: true
      });
      
      console.log(`Created monitoring point: ${point.metric}`);
    }
  }
}

// Function to get current compliance status
async function getA92ComplianceStatus() {
  const monitoringService = MonitoringService.getInstance();
  const status = [];

  for (const control of a92Controls) {
    const controlStatus = {
      id: control.id,
      title: control.title,
      status: 'compliant' as 'compliant' | 'non-compliant' | 'partial',
      metrics: [] as any[]
    };

    for (const point of control.monitoringPoints) {
      const result = await monitoringService.checkMonitoringPoint({
        control_id: `ISO27001-${control.id}`,
        metric: point.metric
      });

      controlStatus.metrics.push({
        metric: point.metric,
        status: result.status,
        value: result.value,
        threshold: point.threshold
      });

      if (result.status === 'failed') {
        controlStatus.status = 'non-compliant';
      } else if (result.status === 'warning') {
        controlStatus.status = 'partial';
      }
    }

    status.push(controlStatus);
  }

  return status;
}

export { setupA92Monitoring, getA92ComplianceStatus };
