import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  Inbox, 
  Send, 
  User, 
  Mail, 
  Clock, 
  Briefcase,
  ChevronLeft,
  Loader2,
  MessageSquare,
  Circle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ApplicationMessage {
  id: string;
  application_id: string;
  sender_type: "admin" | "candidate";
  sender_name: string;
  sender_email: string;
  subject: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
}

interface ApplicationWithMessages {
  id: string;
  applicant_name: string;
  applicant_email: string;
  status: string;
  created_at: string;
  job_listings: {
    id: string;
    title: string;
    slug: string;
  } | null;
  messages: ApplicationMessage[];
  unread_count: number;
  last_message_at: string | null;
}

export default function InboxManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch all applications with their messages
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["inbox-applications"],
    queryFn: async () => {
      // First get all applications
      const { data: apps, error: appsError } = await supabase
        .from("job_applications")
        .select(`
          id,
          applicant_name,
          applicant_email,
          status,
          created_at,
          job_listings (
            id,
            title,
            slug
          )
        `)
        .order("created_at", { ascending: false });

      if (appsError) throw appsError;

      // Then get all messages
      const { data: messages, error: msgsError } = await supabase
        .from("application_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (msgsError) throw msgsError;

      // Combine applications with their messages
      const applicationsWithMessages: ApplicationWithMessages[] = (apps || []).map((app) => {
        const appMessages = (messages || []).filter((m) => m.application_id === app.id) as ApplicationMessage[];
        const unreadCount = appMessages.filter((m) => !m.is_read && m.sender_type === "candidate").length;
        const lastMessage = appMessages[appMessages.length - 1];

        return {
          ...app,
          messages: appMessages,
          unread_count: unreadCount,
          last_message_at: lastMessage?.created_at || null,
        };
      });

      // Sort by last message or created_at
      return applicationsWithMessages.sort((a, b) => {
        const aDate = a.last_message_at || a.created_at;
        const bDate = b.last_message_at || b.created_at;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
    },
  });

  const selectedApplication = applications.find((a) => a.id === selectedApplicationId);

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("application_messages")
        .update({ is_read: true })
        .eq("application_id", applicationId)
        .eq("sender_type", "candidate")
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox-applications"] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ applicationId, body }: { applicationId: string; body: string }) => {
      const app = applications.find((a) => a.id === applicationId);
      if (!app) throw new Error("Application not found");

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert message into database
      const { error: insertError } = await supabase
        .from("application_messages")
        .insert({
          application_id: applicationId,
          sender_type: "admin",
          sender_name: "Navio Team",
          sender_email: user.email || "careers@navio.no",
          body,
        });

      if (insertError) throw insertError;

      // Send email notification to candidate
      const { error: emailError } = await supabase.functions.invoke("send-candidate-message", {
        body: {
          applicationId,
          applicantName: app.applicant_name,
          applicantEmail: app.applicant_email,
          jobTitle: app.job_listings?.title || "Position",
          messageBody: body,
        },
      });

      if (emailError) {
        console.error("Email send error:", emailError);
        // Don't throw - message is saved, email is optional
      }
    },
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["inbox-applications"] });
      toast({ title: "Message sent", description: "Your message has been sent to the candidate." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    },
  });

  const handleSelectApplication = (appId: string) => {
    setSelectedApplicationId(appId);
    markAsReadMutation.mutate(appId);
  };

  const handleSendReply = () => {
    if (!selectedApplicationId || !replyText.trim()) return;
    sendMessageMutation.mutate({ applicationId: selectedApplicationId, body: replyText.trim() });
  };

  const totalUnread = applications.reduce((sum, a) => sum + a.unread_count, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6" />
            Inbox
            {totalUnread > 0 && (
              <Badge variant="destructive" className="ml-2">
                {totalUnread} unread
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            Communicate with candidates about their applications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversation List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[500px]">
              {applications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No applications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {applications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => handleSelectApplication(app.id)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                        selectedApplicationId === app.id && "bg-muted"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          {app.unread_count > 0 && (
                            <Circle className="h-3 w-3 fill-primary text-primary absolute -top-0.5 -right-0.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn(
                              "font-medium truncate",
                              app.unread_count > 0 && "font-semibold"
                            )}>
                              {app.applicant_name}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(app.last_message_at || app.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {app.job_listings?.title || "Unknown position"}
                          </p>
                          {app.messages.length > 0 && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {app.messages[app.messages.length - 1]?.body.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedApplication ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedApplicationId(null)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {selectedApplication.applicant_name}
                      <Badge variant="outline" className="ml-2">
                        {selectedApplication.status?.replace(/_/g, " ")}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {selectedApplication.job_listings?.title}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedApplication.applicant_email}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                <ScrollArea className="flex-1 h-[380px] p-4">
                  {selectedApplication.messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation below</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedApplication.messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.sender_type === "admin" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-lg p-3",
                              message.sender_type === "admin"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                            <div className={cn(
                              "flex items-center gap-2 mt-2 text-xs",
                              message.sender_type === "admin"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}>
                              <Clock className="h-3 w-3" />
                              {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <Separator />
                <div className="p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.metaKey) {
                          handleSendReply();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sendMessageMutation.isPending}
                      className="self-end"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press ⌘+Enter to send. The candidate will receive an email notification.
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a candidate from the list to view messages</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
