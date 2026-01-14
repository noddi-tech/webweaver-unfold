import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  name: string;
  title: string;
  email: string | null;
  phone: string | null;
  image_url: string | null;
  linkedin_url: string | null;
}

interface SalesContactSetting {
  id: string;
  setting_key: string;
  employee_id: string | null;
  value: string | null;
  label: string | null;
  is_active: boolean;
  employee?: Employee | null;
}

interface SalesContacts {
  primaryContact: Employee | null;
  secondaryContact: Employee | null;
  bookingUrl: string;
  bookingLabel: string;
  salesEmail: string;
  salesPhone: string;
}

export function useSalesContacts() {
  return useQuery({
    queryKey: ['sales-contacts'],
    queryFn: async (): Promise<SalesContacts> => {
      // Fetch all settings with employee data
      const { data: settings, error } = await supabase
        .from('sales_contact_settings')
        .select(`
          id,
          setting_key,
          employee_id,
          value,
          label,
          is_active,
          employee:employees(id, name, title, email, phone, image_url, linkedin_url)
        `)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching sales contacts:', error);
        throw error;
      }

      const settingsMap = new Map<string, SalesContactSetting>();
      settings?.forEach((s) => {
        // Handle the employee join - it comes as an object or null
        const setting: SalesContactSetting = {
          ...s,
          employee: Array.isArray(s.employee) ? s.employee[0] : s.employee
        };
        settingsMap.set(s.setting_key, setting);
      });

      const primarySetting = settingsMap.get('primary_contact');
      const secondarySetting = settingsMap.get('secondary_contact');
      const bookingSetting = settingsMap.get('booking_url');
      const emailSetting = settingsMap.get('sales_email');
      const phoneSetting = settingsMap.get('sales_phone');

      return {
        primaryContact: primarySetting?.employee || null,
        secondaryContact: secondarySetting?.employee || null,
        bookingUrl: bookingSetting?.value || 'https://calendly.com/joachim-noddi/30min',
        bookingLabel: bookingSetting?.label || 'Book a meeting',
        salesEmail: emailSetting?.value || 'sales@info.naviosolutions.com',
        salesPhone: phoneSetting?.value || '+47 413 54 569',
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBookingLink() {
  const { data, isLoading, error } = useSalesContacts();
  
  return {
    url: data?.bookingUrl || 'https://calendly.com/joachim-noddi/30min',
    label: data?.bookingLabel || 'Book a meeting',
    isLoading,
    error,
  };
}
