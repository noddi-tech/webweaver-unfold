import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { useJobApplications, ApplicationFormData } from "@/hooks/useJobApplications";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { motion, AnimatePresence } from "framer-motion";

interface ApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
}

export function ApplicationForm({ open, onOpenChange, jobId, jobTitle }: ApplicationFormProps) {
  const { t } = useAppTranslation();
  const { submitApplication, isSubmitting, hasApplied } = useJobApplications();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    linkedin_url: "",
    portfolio_url: "",
    cover_letter: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitApplication({ jobId, formData });
      setSubmitted(true);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (submitted) {
      setSubmitted(false);
      setFormData({
        applicant_name: "",
        applicant_email: "",
        applicant_phone: "",
        linkedin_url: "",
        portfolio_url: "",
        cover_letter: "",
      });
    }
  };

  const alreadyApplied = hasApplied(jobId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("careers.apply.success.title", "Application Submitted!")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("careers.apply.success.description", "Thank you for applying. We'll review your application and get back to you soon.")}
              </p>
              <Button onClick={handleClose}>
                {t("common.close", "Close")}
              </Button>
            </motion.div>
          ) : alreadyApplied ? (
            <motion.div
              key="already-applied"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("careers.apply.alreadyApplied.title", "Already Applied")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("careers.apply.alreadyApplied.description", "You've already submitted an application for this position. Check your applications dashboard to track its status.")}
              </p>
              <Button onClick={handleClose}>
                {t("common.close", "Close")}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle>{t("careers.apply.title", "Apply for Position")}</DialogTitle>
                <DialogDescription>
                  {t("careers.apply.subtitle", "Applying for:")} <strong>{jobTitle}</strong>
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">{t("careers.apply.name", "Full Name")} *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.applicant_name}
                      onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">{t("careers.apply.email", "Email")} *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.applicant_email}
                      onChange={(e) => setFormData({ ...formData, applicant_email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">{t("careers.apply.phone", "Phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.applicant_phone}
                      onChange={(e) => setFormData({ ...formData, applicant_phone: e.target.value })}
                      placeholder="+47 123 45 678"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="linkedin">{t("careers.apply.linkedin", "LinkedIn URL")}</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio">{t("careers.apply.portfolio", "Portfolio / GitHub URL")}</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    placeholder="https://github.com/johndoe"
                  />
                </div>

                <div>
                  <Label htmlFor="cover">{t("careers.apply.coverLetter", "Cover Letter")}</Label>
                  <Textarea
                    id="cover"
                    value={formData.cover_letter}
                    onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                    placeholder={t("careers.apply.coverLetterPlaceholder", "Tell us why you're interested in this role...")}
                    rows={5}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    {t("common.cancel", "Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("careers.apply.submitting", "Submitting...")}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t("careers.apply.submit", "Submit Application")}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
