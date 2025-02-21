'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartBarIcon, BellIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(true);
  const [autoRemediation, setAutoRemediation] = useState(false);

  const metrics = [
    { name: 'Compliance Score', value: '85%', change: '+5%', status: 'positive' },
    { name: 'Active Monitors', value: '24', change: '+2', status: 'positive' },
    { name: 'Alert Count', value: '3', change: '-1', status: 'positive' },
    { name: 'Last Scan', value: '2h ago', change: '', status: 'neutral' },
  ];

  return (
    <div className="container mx-auto p-6 md:p-8 space-y-8 pt-20 md:pt-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monitoring</h1>
          <p className="text-gray-500">Monitor and manage your compliance controls</p>
        </div>
        <Button>Configure New Monitor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{metric.name}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  {metric.change && (
                    <span className={`text-sm ${metric.status === 'positive' ? 'text-green-500' : 'text-gray-500'}`}>
                      {metric.change}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <BellIcon className="h-4 w-4" />
            <span>Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4" />
            <span>Schedule</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Settings</CardTitle>
              <CardDescription>Configure your monitoring preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive alerts via email</p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Remediation</Label>
                  <p className="text-sm text-gray-500">Automatically fix common issues</p>
                </div>
                <Switch
                  checked={autoRemediation}
                  onCheckedChange={setAutoRemediation}
                />
              </div>
              <div className="space-y-2">
                <Label>Alert Threshold</Label>
                <Input type="number" placeholder="Enter threshold value" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>View and manage compliance alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Password Policy Violation', severity: 'High', time: '2h ago' },
                  { title: 'Access Control Update', severity: 'Medium', time: '4h ago' },
                  { title: 'Encryption Check Failed', severity: 'High', time: '6h ago' },
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-gray-500">{alert.time}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      alert.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Schedule</CardTitle>
              <CardDescription>Configure monitoring frequency and timing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Scan Frequency</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Every 6 hours</option>
                      <option>Every 12 hours</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quiet Hours</Label>
                    <div className="flex space-x-2">
                      <Input type="time" className="flex-1" />
                      <span className="flex items-center">to</span>
                      <Input type="time" className="flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
