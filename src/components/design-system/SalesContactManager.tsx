import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Phone, Mail, Calendar, Save, Loader2 } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  title: string;
  email: string | null;
  phone: string | null;
  image_url: string | null;
}

interface SalesContactSetting {
  id: string;
  setting_key: string;
  employee_id: string | null;
  value: string | null;
  label: string | null;
  is_active: boolean;
}

export const SalesContactManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, { employee_id?: string; value?: string; label?: string }>>({});

  // Fetch employees for dropdown
  const { data: employees } = useQuery({
    queryKey: ['employees-for-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, title, email, phone, image_url')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      return data as Employee[];
    },
  });

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['sales-contact-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_contact_settings')
        .select('*')
        .order('setting_key');
      if (error) throw error;
      
      // Initialize form data
      const initialData: Record<string, { employee_id?: string; value?: string; label?: string }> = {};
      data?.forEach((s: SalesContactSetting) => {
        initialData[s.setting_key] = {
          employee_id: s.employee_id || undefined,
          value: s.value || undefined,
          label: s.label || undefined,
        };
      });
      setFormData(initialData);
      
      return data as SalesContactSetting[];
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: { setting_key: string; employee_id?: string | null; value?: string | null; label?: string | null }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('sales_contact_settings')
          .update({
            employee_id: update.employee_id,
            value: update.value,
            label: update.label,
            updated_at: new Date().toISOString(),
          })
          .eq('setting_key', update.setting_key);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-contact-settings-admin'] });
      queryClient.invalidateQueries({ queryKey: ['sales-contacts'] });
      toast.success('Sales contact settings saved');
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    },
  });

  const handleSave = () => {
    const updates = Object.entries(formData).map(([key, data]) => ({
      setting_key: key,
      employee_id: data.employee_id || null,
      value: data.value || null,
      label: data.label || null,
    }));
    updateMutation.mutate(updates);
  };

  const updateField = (settingKey: string, field: 'employee_id' | 'value' | 'label', value: string) => {
    setFormData(prev => ({
      ...prev,
      [settingKey]: {
        ...prev[settingKey],
        [field]: value,
      },
    }));
  };

  const getEmployeeById = (id: string) => employees?.find(e => e.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sales Contact Settings</h2>
          <p className="text-muted-foreground">
            Configure contact information shown on offer pages and booking links across the site.
          </p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Primary Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Primary Contact
            </CardTitle>
            <CardDescription>
              Main sales contact shown on offer pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Team Member</Label>
                <Select
                  value={formData.primary_contact?.employee_id || ''}
                  onValueChange={(v) => updateField('primary_contact', 'employee_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.primary_contact?.employee_id && (
                <div className="rounded-lg border p-3 bg-muted/50">
                  <p className="text-sm font-medium">{getEmployeeById(formData.primary_contact.employee_id)?.name}</p>
                  <p className="text-xs text-muted-foreground">{getEmployeeById(formData.primary_contact.employee_id)?.title}</p>
                  <p className="text-xs text-muted-foreground">{getEmployeeById(formData.primary_contact.employee_id)?.phone}</p>
                  <p className="text-xs text-muted-foreground">{getEmployeeById(formData.primary_contact.employee_id)?.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Secondary Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Secondary Contact
            </CardTitle>
            <CardDescription>
              Additional contact shown on offer pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Team Member</Label>
                <Select
                  value={formData.secondary_contact?.employee_id || ''}
                  onValueChange={(v) => updateField('secondary_contact', 'employee_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.secondary_contact?.employee_id && (
                <div className="rounded-lg border p-3 bg-muted/50">
                  <p className="text-sm font-medium">{getEmployeeById(formData.secondary_contact.employee_id)?.name}</p>
                  <p className="text-xs text-muted-foreground">{getEmployeeById(formData.secondary_contact.employee_id)?.title}</p>
                  <p className="text-xs text-muted-foreground">{getEmployeeById(formData.secondary_contact.employee_id)?.phone}</p>
                  <p className="text-xs text-muted-foreground">{getEmployeeById(formData.secondary_contact.employee_id)?.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking URL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Link
            </CardTitle>
            <CardDescription>
              Calendly or other booking URL used across the site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Booking URL</Label>
              <Input
                value={formData.booking_url?.value || ''}
                onChange={(e) => updateField('booking_url', 'value', e.target.value)}
                placeholder="https://calendly.com/..."
              />
            </div>
            <div>
              <Label>Button Label</Label>
              <Input
                value={formData.booking_url?.label || ''}
                onChange={(e) => updateField('booking_url', 'label', e.target.value)}
                placeholder="Book a meeting"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sales Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Sales Email
            </CardTitle>
            <CardDescription>
              Email address for sales inquiries and offer questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={formData.sales_email?.value || ''}
                onChange={(e) => updateField('sales_email', 'value', e.target.value)}
                placeholder="sales@company.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sales Phone */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Sales Phone
            </CardTitle>
            <CardDescription>
              Phone number shown on offer pages (fallback if contact has no phone)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={formData.sales_phone?.value || ''}
                onChange={(e) => updateField('sales_phone', 'value', e.target.value)}
                placeholder="+47 123 45 678"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
