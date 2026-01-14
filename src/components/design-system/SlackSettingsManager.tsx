import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, Hash, Send, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface SlackSetting {
  id: string;
  category: string;
  webhook_url: string | null;
  enabled: boolean;
  channel_name: string | null;
  notification_types: string[];
}

const NOTIFICATION_LABELS: Record<string, Record<string, string>> = {
  sales: {
    offer_sent: "Offer Sent",
    offer_viewed: "Offer Viewed",
    offer_accepted: "Offer Accepted",
    offer_question: "Question Asked",
  },
  careers: {
    application_received: "Application Received",
    application_status_changed: "Status Changed",
  },
  general: {
    contact_form: "Contact Form",
    email_bounced: "Email Bounced",
  },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  sales: <Bell className="h-5 w-5" />,
  careers: <Bell className="h-5 w-5" />,
  general: <Bell className="h-5 w-5" />,
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  sales: "Notifications for pricing offers, quotes, and sales inquiries",
  careers: "Notifications for job applications and candidate updates",
  general: "General notifications including contact forms and system alerts",
};

export function SlackSettingsManager() {
  const queryClient = useQueryClient();
  const [showWebhooks, setShowWebhooks] = useState<Record<string, boolean>>({});
  const [testingCategory, setTestingCategory] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["slack-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slack_settings")
        .select("*")
        .order("category");
      
      if (error) throw error;
      return data as SlackSetting[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SlackSetting> }) => {
      const { error } = await supabase
        .from("slack_settings")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slack-settings"] });
      toast.success("Settings saved");
    },
    onError: (error) => {
      toast.error("Failed to save settings: " + error.message);
    },
  });

  const testWebhook = async (setting: SlackSetting) => {
    if (!setting.webhook_url) {
      toast.error("Please add a webhook URL first");
      return;
    }

    setTestingCategory(setting.category);

    try {
      const response = await fetch(setting.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `✅ Test notification from Navio CMS`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `✅ *Test notification successful!*\n\nCategory: \`${setting.category}\`\nChannel: ${setting.channel_name || "Not set"}`,
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `Sent from Navio CMS at ${new Date().toLocaleString()}`,
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        toast.success("Test notification sent to Slack!");
      } else {
        throw new Error("Webhook returned an error");
      }
    } catch (error) {
      toast.error("Failed to send test notification. Check your webhook URL.");
    } finally {
      setTestingCategory(null);
    }
  };

  const toggleNotificationType = (setting: SlackSetting, type: string) => {
    const currentTypes = setting.notification_types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    updateMutation.mutate({
      id: setting.id,
      updates: { notification_types: newTypes },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Slack Notifications</h2>
          <p className="text-muted-foreground">
            Configure where different types of notifications are sent
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {settings?.map((setting) => (
          <Card key={setting.id} className={!setting.enabled ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {CATEGORY_ICONS[setting.category]}
                  <div>
                    <CardTitle className="capitalize">{setting.category}</CardTitle>
                    <CardDescription>
                      {CATEGORY_DESCRIPTIONS[setting.category]}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {setting.webhook_url ? (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                      Not configured
                    </Badge>
                  )}
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={(enabled) =>
                      updateMutation.mutate({ id: setting.id, updates: { enabled } })
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Webhook URL */}
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showWebhooks[setting.category] ? "text" : "password"}
                      value={setting.webhook_url || ""}
                      onChange={(e) =>
                        updateMutation.mutate({
                          id: setting.id,
                          updates: { webhook_url: e.target.value || null },
                        })
                      }
                      placeholder="https://hooks.slack.com/services/..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() =>
                        setShowWebhooks((prev) => ({
                          ...prev,
                          [setting.category]: !prev[setting.category],
                        }))
                      }
                    >
                      {showWebhooks[setting.category] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testWebhook(setting)}
                    disabled={!setting.webhook_url || testingCategory === setting.category}
                  >
                    {testingCategory === setting.category ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="ml-2">Test</span>
                  </Button>
                </div>
              </div>

              {/* Channel Name */}
              <div className="space-y-2">
                <Label>Channel Name (display only)</Label>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={setting.channel_name?.replace("#", "") || ""}
                    onChange={(e) =>
                      updateMutation.mutate({
                        id: setting.id,
                        updates: { channel_name: e.target.value ? `#${e.target.value.replace("#", "")}` : null },
                      })
                    }
                    placeholder="sales-notifications"
                    className="max-w-xs"
                  />
                </div>
              </div>

              {/* Notification Types */}
              <div className="space-y-2">
                <Label>Notification Types</Label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(NOTIFICATION_LABELS[setting.category] || {}).map(
                    ([type, label]) => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={`${setting.category}-${type}`}
                          checked={setting.notification_types?.includes(type)}
                          onCheckedChange={() => toggleNotificationType(setting, type)}
                        />
                        <Label
                          htmlFor={`${setting.category}-${type}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">How to get a Slack Webhook URL</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener" className="text-primary underline">api.slack.com/apps</a></li>
            <li>Create a new app or select an existing one</li>
            <li>Go to "Incoming Webhooks" and enable them</li>
            <li>Click "Add New Webhook to Workspace"</li>
            <li>Select the channel and copy the webhook URL</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
