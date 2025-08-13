import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  type ContactSettings = {
    form_title: string | null;
    form_description: string | null;
    get_in_touch_title: string;
    business_hours_title: string;
  };

  type ContactItem = {
    id: string;
    title: string;
    value: string;
    icon_name: string;
    link_url: string | null;
  };

  type BusinessHour = {
    id: string;
    day_name: string;
    open_time: string | null;
    close_time: string | null;
    closed: boolean;
    sort_order: number | null;
  };

  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [contactItems, setContactItems] = useState<ContactItem[]>([]);
  const [hours, setHours] = useState<BusinessHour[]>([]);

  useEffect(() => {
    const load = async () => {
      const [settingsRes, itemsRes, hoursRes] = await Promise.all([
        supabase.from('contact_settings').select('*').maybeSingle(),
        supabase.from('contact_items').select('*').eq('active', true).order('sort_order', { ascending: true }),
        supabase.from('business_hours').select('*').order('sort_order', { ascending: true }),
      ]);
      if (settingsRes.data) setSettings(settingsRes.data as any);
      if (itemsRes.data) setContactItems(itemsRes.data as any);
      if (hoursRes.data) setHours(hoursRes.data as any);
    };
    load();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.email || !formData.message) {
      toast({
        title: "Please fill in required fields",
        description: "Name, email, and message are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-to-slack', {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      
      <main className="container mx-auto px-6 py-12 pt-32">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold gradient-text mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get in touch with our team. We're here to help you succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">{settings?.form_title ?? "Send us a message"}</CardTitle>
              <CardDescription>{settings?.form_description ?? "Fill out the form below and we'll get back to you as soon as possible."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">First Name *</label>
                    <Input 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Your first name" 
                      className="mt-1" 
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Last Name</label>
                    <Input 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Your last name" 
                      className="mt-1" 
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm font-medium text-foreground">Email *</label>
                  <Input 
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com" 
                    className="mt-1" 
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Input 
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What's this about?" 
                    className="mt-1" 
                  />
                </div>
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground">Message *</label>
                  <Textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your inquiry..." 
                    className="mt-1 min-h-[120px]" 
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <Send className="mr-2" size={20} />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">{settings?.get_in_touch_title ?? "Get in touch"}</CardTitle>
                <CardDescription>
                  Reach out to us through any of these channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactItems.length > 0 ? (
                  contactItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        {item.icon_name === 'Phone' ? (
                          <Phone className="h-6 w-6 text-primary" />
                        ) : item.icon_name === 'MapPin' ? (
                          <MapPin className="h-6 w-6 text-primary" />
                        ) : (
                          <Mail className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        {item.link_url ? (
                          <a href={item.link_url} className="text-muted-foreground underline underline-offset-4">{item.value}</a>
                        ) : (
                          <p className="text-muted-foreground">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No contact items configured yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{settings?.business_hours_title ?? "Business Hours"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {hours.length > 0 ? (
                    hours.map((h) => (
                      <div key={h.id} className="flex justify-between">
                        <span className="text-muted-foreground">{h.day_name}</span>
                        <span className="text-foreground">{h.closed ? 'Closed' : `${h.open_time ?? ''}${h.open_time && h.close_time ? ' - ' : ''}${h.close_time ?? ''}`}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No business hours configured yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;