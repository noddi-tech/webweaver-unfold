// Shared sales configuration utility for edge functions
// Fetches dynamic sales contact settings from the database

export interface SalesConfig {
  salesEmail: string;
  salesPhone: string;
  bookingUrl: string;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
}

export async function getSalesConfig(supabase: any): Promise<SalesConfig> {
  try {
    // Fetch all active settings with employee joins
    const { data: settings, error } = await supabase
      .from('sales_contact_settings')
      .select(`
        setting_key,
        value,
        employee_id,
        employees(name, email, phone)
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching sales config:', error);
    }

    // Create a map for easy lookup
    const settingsMap = new Map(settings?.map((s: any) => [s.setting_key, s]) || []);
    
    const primaryContact = settingsMap.get('primary_contact') as any;
    
    return {
      salesEmail: (settingsMap.get('sales_email') as any)?.value || 'sales@info.naviosolutions.com',
      salesPhone: (settingsMap.get('sales_phone') as any)?.value || '+47 413 54 569',
      bookingUrl: (settingsMap.get('booking_url') as any)?.value || 'https://calendly.com/joachim-noddi/30min',
      primaryContactName: primaryContact?.employees?.name || null,
      primaryContactEmail: primaryContact?.employees?.email || null,
    };
  } catch (e) {
    console.error('Error in getSalesConfig:', e);
    // Return defaults on error
    return {
      salesEmail: 'sales@info.naviosolutions.com',
      salesPhone: '+47 413 54 569',
      bookingUrl: 'https://calendly.com/joachim-noddi/30min',
      primaryContactName: null,
      primaryContactEmail: null,
    };
  }
}
