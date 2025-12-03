import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactHero from "@/components/contact/ContactHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HreflangTags } from "@/components/HreflangTags";
import { EditableBackground } from "@/components/EditableBackground";

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
    show_contact_methods_tab: boolean;
    show_business_hours_tab: boolean;
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
      // Load page data for meta tags
      const { data: page } = await supabase
        .from('pages')
        .select('title, meta_description')
        .eq('slug', 'contact')
        .eq('active', true)
        .maybeSingle();

      if (page) {
        document.title = page.title;
        if (page.meta_description) {
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', page.meta_description);
          } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = page.meta_description;
            document.head.appendChild(meta);
          }
        }
      }

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
    <div className="min-h-screen">
      <HreflangTags pageSlug="/contact" />
      <Header />
      
      <main>
        <ContactHero />

        <section className="py-12 md:py-16 lg:py-section px-2.5">
          <div className="container max-w-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <EditableBackground
            elementId="contact-form-card"
            defaultBackground="glass-card"
          >
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">{settings?.form_title ?? "Send us a message"}</CardTitle>
                <CardDescription>{settings?.form_description ?? "Fill out the form below and we'll get back to you as soon as possible."}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">First Name *</label>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Last Name</label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Subject</label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Message *</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your message..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Sending..." : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </EditableBackground>

          {/* Contact Information */}
          <div className="space-y-8">
            {settings?.show_contact_methods_tab !== false && (
              <EditableBackground
                elementId="contact-methods-card"
                defaultBackground="glass-card"
              >
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-foreground">{settings?.get_in_touch_title ?? "Get in touch"}</CardTitle>
                    <CardDescription>
                      Reach out to us through any of these channels.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contactItems.map((item) => {
                      const IconComponent = item.icon_name === 'Mail' ? Mail : 
                                           item.icon_name === 'Phone' ? Phone : MapPin;
                      return (
                        <a
                          key={item.id}
                          href={item.link_url || '#'}
                          className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/10 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-muted-foreground text-sm">{item.value}</p>
                          </div>
                        </a>
                      );
                    })}
                  </CardContent>
                </Card>
              </EditableBackground>
            )}

            {settings?.show_business_hours_tab !== false && (
              <EditableBackground
                elementId="contact-hours-card"
                defaultBackground="glass-card"
              >
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">{settings?.business_hours_title ?? "Business Hours"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hours.map((hour) => (
                        <div key={hour.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                          <span className="font-medium text-foreground">{hour.day_name}</span>
                          <span className="text-muted-foreground">
                            {hour.closed ? 'Closed' : `${hour.open_time} - ${hour.close_time}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </EditableBackground>
            )}
          </div>
        </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;