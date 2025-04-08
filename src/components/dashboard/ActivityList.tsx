'use client';

import React from 'react';
import { RecentActivityItem } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileText, Check, AlertTriangle, ClipboardCheck, Activity, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ActivityListProps {
  data?: RecentActivityItem[];
  onViewMore: () => void;
}

export function ActivityList({ data = [], onViewMore }: ActivityListProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'evidence':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'verification':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'assessment':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'update':
        return <ClipboardCheck className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-4">
            {data.map((activity) => (
              <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start">
                  <div className="mr-2 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-gray-600">{activity.value}</p>
                    {activity.relatedEntity && (
                      <p className="text-xs text-gray-500">
                        {activity.relatedEntity.type}: {activity.relatedEntity.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp))} ago
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No recent activities</p>
            <p className="text-sm">Recent activities will appear here once available</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          className="w-full text-blue-600 hover:text-blue-800 flex items-center justify-center"
          onClick={onViewMore}
          disabled={data.length === 0}
        >
          View More <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
