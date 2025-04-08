'use client';

import React, { useState } from 'react';
import { PendingTaskItem } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChevronRight, AlertCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';

interface TaskListProps {
  data?: PendingTaskItem[];
  onViewMore: () => void;
  onTaskComplete: (taskId: string) => void;
}

export function TaskList({ data = [], onViewMore, onTaskComplete }: TaskListProps) {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const handleTaskToggle = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
      onTaskComplete(taskId);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertOctagon className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-3">
            {data.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-start p-3 rounded-lg border ${
                  completedTasks.includes(task.id) 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Checkbox 
                  checked={completedTasks.includes(task.id)}
                  onCheckedChange={() => handleTaskToggle(task.id)}
                  className="mr-3 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    {getPriorityIcon(task.priority)}
                    <span className={`ml-2 font-medium ${
                      completedTasks.includes(task.id) ? 'line-through text-gray-500' : ''
                    }`}>
                      {task.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.framework}</p>
                  {task.dueDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {formatDistanceToNow(new Date(task.dueDate))} from now
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No pending tasks</p>
            <p className="text-sm">Tasks will appear here when they need your attention</p>
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
