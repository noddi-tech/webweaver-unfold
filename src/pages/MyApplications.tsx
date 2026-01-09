import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  MapPin, 
  Heart, 
  FileText, 
  ExternalLink, 
  Loader2, 
  LogIn,
  Trash2
} from "lucide-react";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useJobApplications, ApplicationStatus } from "@/hooks/useJobApplications";
import { ApplicationStatusBadge, ApplicationTimeline } from "@/components/jobs/ApplicationStatus";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyApplications() {
  const { t, i18n } = useAppTranslation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const { savedJobs, isLoading: savedLoading, toggleSaveJob } = useSavedJobs();
  const { applications, isLoading: appsLoading, withdrawApplication } = useJobApplications();

  useEffect(() => {
    document.title = t("careers.myApplications.pageTitle", "My Applications");
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session?.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, [t]);

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-32">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-32">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <LogIn className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle>{t("careers.myApplications.signInRequired", "Sign In Required")}</CardTitle>
              <CardDescription>
                {t("careers.myApplications.signInDescription", "Please sign in to view your saved jobs and applications.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/cms-login">{t("common.signIn", "Sign In")}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const activeApplications = applications.filter((a) => a.status !== "withdrawn");
  const withdrawnApplications = applications.filter((a) => a.status === "withdrawn");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-32 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            {t("careers.myApplications.title", "My Career Dashboard")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t("careers.myApplications.subtitle", "Track your applications and saved jobs")}
          </p>

          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="applications" className="gap-2">
                <FileText className="w-4 h-4" />
                {t("careers.myApplications.applications", "Applications")} ({activeApplications.length})
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2">
                <Heart className="w-4 h-4" />
                {t("careers.myApplications.savedJobs", "Saved Jobs")} ({savedJobs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="space-y-4">
              {appsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : activeApplications.length === 0 ? (
                <Card className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    {t("careers.myApplications.noApplications", "You haven't applied to any jobs yet.")}
                  </p>
                  <Button asChild variant="outline">
                    <Link to={`/${i18n.language}/careers`}>
                      {t("careers.myApplications.browseJobs", "Browse Open Positions")}
                    </Link>
                  </Button>
                </Card>
              ) : (
                activeApplications.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {(app.job_listings as any)?.title || "Unknown Position"}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                                  {(app.job_listings as any)?.department && (
                                    <span className="flex items-center gap-1">
                                      <Briefcase className="w-3 h-3" />
                                      {(app.job_listings as any).department}
                                    </span>
                                  )}
                                  {(app.job_listings as any)?.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {(app.job_listings as any).location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ApplicationStatusBadge status={app.status as ApplicationStatus} />
                            </div>

                            <ApplicationTimeline
                              status={app.status as ApplicationStatus}
                              createdAt={app.created_at}
                              statusUpdatedAt={app.status_updated_at}
                            />
                          </div>

                          <div className="flex gap-2 md:flex-col">
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/${i18n.language}/careers/${(app.job_listings as any)?.slug}`}>
                                <ExternalLink className="w-4 h-4 mr-1" />
                                {t("careers.myApplications.viewJob", "View Job")}
                              </Link>
                            </Button>
                            
                            {app.status === "submitted" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    {t("careers.myApplications.withdraw", "Withdraw")}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {t("careers.myApplications.withdrawConfirm.title", "Withdraw Application?")}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("careers.myApplications.withdrawConfirm.description", "This will withdraw your application. You can apply again later if the position is still open.")}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => withdrawApplication(app.id)}>
                                      {t("careers.myApplications.withdraw", "Withdraw")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              {savedLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : savedJobs.length === 0 ? (
                <Card className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    {t("careers.myApplications.noSavedJobs", "You haven't saved any jobs yet.")}
                  </p>
                  <Button asChild variant="outline">
                    <Link to={`/${i18n.language}/careers`}>
                      {t("careers.myApplications.browseJobs", "Browse Open Positions")}
                    </Link>
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {savedJobs.map((saved) => (
                    <motion.div
                      key={saved.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">
                                {(saved.job_listings as any)?.title || "Unknown Position"}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                {(saved.job_listings as any)?.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {(saved.job_listings as any).location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleSaveJob(saved.job_id)}
                              className="text-brand-pink hover:text-brand-pink/80"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </Button>
                          </div>
                          
                          {(saved.job_listings as any)?.department && (
                            <Badge variant="secondary" className="mb-3">
                              {(saved.job_listings as any).department}
                            </Badge>
                          )}

                          <Button asChild className="w-full" size="sm">
                            <Link to={`/${i18n.language}/careers/${(saved.job_listings as any)?.slug}`}>
                              {t("careers.jobs.apply", "Apply Now")}
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
