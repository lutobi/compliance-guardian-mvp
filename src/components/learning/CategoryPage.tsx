'use client';

import Link from 'next/link';
import { ChevronRight, LayoutGrid, List } from 'lucide-react';
import { frameworkRegistry } from '@/data/registry';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

interface CategoryPageProps {
  categoryId: string;
  title: string;
  description: string;
}

export function CategoryPage({ categoryId, title, description }: CategoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'completion' | 'recent'>('name');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Filter frameworks for this category
  const frameworks = Object.values(frameworkRegistry)
    .filter(framework => framework.category === categoryId)
    .filter(framework => 
      searchTerm === '' || 
      framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      framework.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'completion':
          return (b.completion || 0) - (a.completion || 0);
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 mb-8">
        <Link href="/learning" className="hover:text-blue-600">
          Learning Hub
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900">{title}</span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-gray-600 max-w-4xl">
          {description}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="w-full md:w-96">
          <Input
            type="search"
            placeholder="Search frameworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as typeof sortBy)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="completion">Completion</SelectItem>
              <SelectItem value="recent">Recently Updated</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Frameworks Display */}
      {view === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworks.map(framework => (
            <Link
              key={framework.id}
              href={`/learning/${categoryId}/${framework.id}`}
              className="block group"
            >
              <Card className="h-full p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                  {framework.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {framework.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Version {framework.version}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={framework.completion || 0} className="w-24" />
                    <span>{framework.completion || 0}% Complete</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {frameworks.map(framework => (
            <Card key={framework.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link 
                    href={`/learning/${categoryId}/${framework.id}`}
                    className="text-xl font-semibold hover:text-blue-600"
                  >
                    {framework.name}
                  </Link>
                  <p className="text-gray-600 mt-2">{framework.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm text-gray-500">Version {framework.version}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={framework.completion || 0} className="w-24" />
                    <span className="text-sm text-gray-500">
                      {framework.completion || 0}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
