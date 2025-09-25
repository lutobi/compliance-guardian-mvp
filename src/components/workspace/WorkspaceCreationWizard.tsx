/**
 * Workspace Creation Wizard
 * 
 * A step-by-step form wizard for creating a new workspace:
 * - Step 1: Basic information (name, industry, company size)
 * - Step 2: Compliance framework selection
 * - Step 3: Team setup options
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Check, ChevronRight, Building, Users, Shield } from 'lucide-react';
import { useWorkspaceContext } from '@/lib/hooks/WorkspaceContext';

const INDUSTRY_OPTIONS = [
  { label: 'Finance & Banking', value: 'finance' },
  { label: 'Healthcare & Life Sciences', value: 'healthcare' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Retail & Consumer Goods', value: 'retail' },
  { label: 'Technology', value: 'technology' },
  { label: 'Government', value: 'government' },
  { label: 'Education', value: 'education' },
  { label: 'Other', value: 'other' }
];

const COMPANY_SIZE_OPTIONS = [
  { label: '1-10 employees', value: 'small' },
  { label: '11-50 employees', value: 'medium' },
  { label: '51-200 employees', value: 'large' },
  { label: '201-500 employees', value: 'xlarge' },
  { label: '501+ employees', value: 'enterprise' }
];

const COMPLIANCE_FRAMEWORKS = [
  { id: 'gdpr', name: 'GDPR', description: 'General Data Protection Regulation' },
  { id: 'hipaa', name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act' },
  { id: 'pci', name: 'PCI DSS', description: 'Payment Card Industry Data Security Standard' },
  { id: 'sox', name: 'SOX', description: 'Sarbanes-Oxley Act' },
  { id: 'iso27001', name: 'ISO 27001', description: 'Information Security Management' },
  { id: 'ccpa', name: 'CCPA', description: 'California Consumer Privacy Act' }
];

interface WorkspaceFormData {
  name: string;
  industry: string;
  companySize: string;
  frameworks: string[];
  inviteTeamNow: boolean;
}

const WorkspaceCreationWizard = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshWorkspaces } = useWorkspaceContext();
  const router = useRouter();
  
  const { register, handleSubmit, control, watch, formState: { errors, isValid } } = useForm<WorkspaceFormData>({
    defaultValues: {
      name: '',
      industry: '',
      companySize: '',
      frameworks: [],
      inviteTeamNow: false
    }
  });
  
  const watchedFrameworks = watch('frameworks', []);
  const watchedInviteTeam = watch('inviteTeamNow');
  
  const nextStep = () => {
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const onSubmit = async (data: WorkspaceFormData) => {
    setIsLoading(true);
    
    try {
      // Create workspace
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          industry: data.industry,
          companySize: data.companySize,
          settings: {
            compliance_frameworks: data.frameworks,
          }
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create workspace');
      }
      
      // Update workspace context
      await refreshWorkspaces();
      
      toast({
        title: 'Workspace Created!',
        description: `${data.name} has been created successfully.`,
      });
      
      // Redirect to team invitation page if selected
      if (data.inviteTeamNow) {
        router.push(`/workspaces/${result.data.id}/invite`);
      } else {
        router.push('/dashboard');
      }
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create workspace',
        variant: 'destructive',
      });
      console.error('Workspace creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <Card className="border-2 border-muted">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create Your Workspace</CardTitle>
          <div className="flex justify-center mt-4">
            <div className="flex items-center">
              <div className={`rounded-full p-2 ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Building size={20} />
              </div>
              <div className={`h-1 w-12 ${step > 1 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`rounded-full p-2 ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Shield size={20} />
              </div>
              <div className={`h-1 w-12 ${step > 2 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`rounded-full p-2 ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Users size={20} />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Workspace Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Workspace Name</Label>
                    <Input
                      id="name"
                      placeholder="Acme Corporation"
                      {...register('name', { required: 'Workspace name is required' })}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Controller
                      name="industry"
                      control={control}
                      rules={{ required: 'Please select an industry' }}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.industry && (
                      <p className="text-sm text-destructive">{errors.industry.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Controller
                      name="companySize"
                      control={control}
                      rules={{ required: 'Please select a company size' }}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Company Size" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPANY_SIZE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.companySize && (
                      <p className="text-sm text-destructive">{errors.companySize.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Compliance Frameworks</h3>
                <p className="text-muted-foreground">Select the compliance frameworks relevant to your organization.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {COMPLIANCE_FRAMEWORKS.map((framework) => (
                    <div key={framework.id} className="flex items-start space-x-2 border rounded-md p-4">
                      <Controller
                        name="frameworks"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={framework.id}
                            checked={field.value?.includes(framework.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, framework.id]);
                              } else {
                                field.onChange(
                                  field.value?.filter((value) => value !== framework.id)
                                );
                              }
                            }}
                          />
                        )}
                      />
                      <div className="space-y-1">
                        <label
                          htmlFor={framework.id}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {framework.name}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {framework.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Team Setup</h3>
                <p className="text-muted-foreground">Would you like to invite team members now?</p>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    name="inviteTeamNow"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="inviteTeamNow"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="inviteTeamNow"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Invite team members after workspace creation
                    </label>
                    <p className="text-xs text-muted-foreground">
                      You'll be redirected to team invitation page after workspace is created
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => router.push('/')}>
                Cancel
              </Button>
            )}
            
            {step < 3 ? (
              <Button type="button" onClick={nextStep} disabled={step === 1 && (!watch('name') || !watch('industry') || !watch('companySize'))}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Workspace'}
                {!isLoading && <Check className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default WorkspaceCreationWizard;
