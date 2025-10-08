import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Download, Mail, ExternalLink } from "lucide-react";

export const ButtonShowcase = () => {
  return (
    <section>
      <h2 className="text-4xl font-bold gradient-text mb-8">Button Hierarchy & CTA System</h2>
      <p className="text-muted-foreground mb-12 text-lg">
        B2B-optimized button system with clear hierarchy. Use Primary for conversion goals, Secondary for exploration, Outline for tertiary actions.
      </p>

      <div className="space-y-12">
        {/* Primary CTAs */}
        <Card className="glass-card p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Primary CTAs</h3>
            <p className="text-sm text-muted-foreground">
              Use for primary conversion actions: Book Demo, Get Started, Sign Up. 
              Maximum one per page section.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="default" size="lg">
              Book a Demo <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="default">
              Get Started
            </Button>
            <Button variant="default" size="sm">
              Sign Up Now
            </Button>
            <Button variant="default" size="icon">
              <Mail className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-md">
            <code className="text-xs">variant="default"</code>
            <p className="text-xs text-muted-foreground mt-1">
              Darkpurple-70 background, white text, hover lift effect
            </p>
          </div>
        </Card>

        {/* Secondary CTAs */}
        <Card className="glass-card p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Secondary CTAs</h3>
            <p className="text-sm text-muted-foreground">
              Use for secondary actions: Learn More, View Features, Explore. 
              Can appear alongside primary CTAs.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="secondary" size="lg">
              Learn More
            </Button>
            <Button variant="secondary">
              View Features
            </Button>
            <Button variant="secondary" size="sm">
              Download Guide <Download className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-md">
            <code className="text-xs">variant="secondary"</code>
            <p className="text-xs text-muted-foreground mt-1">
              Raspberry-40 background with border, maintains visual hierarchy
            </p>
          </div>
        </Card>

        {/* Outline/Tertiary */}
        <Card className="glass-card p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Outline/Tertiary Actions</h3>
            <p className="text-sm text-muted-foreground">
              Use for tertiary actions: Contact, View Details, Cancel. 
              Low visual weight, suitable for navigation.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
            <Button variant="outline">
              View Case Study <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              Details
            </Button>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-md">
            <code className="text-xs">variant="outline"</code>
            <p className="text-xs text-muted-foreground mt-1">
              Transparent background with darkpurple-70 border
            </p>
          </div>
        </Card>

        {/* Ghost/Subtle */}
        <Card className="glass-card p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Ghost/Subtle Actions</h3>
            <p className="text-sm text-muted-foreground">
              Use for low-emphasis actions: navigation links, menu items, dismissible actions.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="ghost" size="lg">
              Skip
            </Button>
            <Button variant="ghost">
              View All
            </Button>
            <Button variant="ghost" size="sm">
              Close
            </Button>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-md">
            <code className="text-xs">variant="ghost"</code>
            <p className="text-xs text-muted-foreground mt-1">
              Minimal styling, hover background only
            </p>
          </div>
        </Card>

        {/* Link Style */}
        <Card className="glass-card p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Link Style</h3>
            <p className="text-sm text-muted-foreground">
              Use for inline text links or when button appearance would be too heavy.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 items-center">
            <Button variant="link">
              Read the documentation
            </Button>
            <Button variant="link" size="sm">
              Terms of Service
            </Button>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-md">
            <code className="text-xs">variant="link"</code>
            <p className="text-xs text-muted-foreground mt-1">
              Text-only appearance with underline on hover
            </p>
          </div>
        </Card>

        {/* Usage Guidelines */}
        <Card className="glass-card p-8 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
          <h3 className="text-2xl font-semibold mb-4">CTA Hierarchy Guidelines</h3>
          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <p className="font-medium">One primary CTA per section</p>
                <p className="text-muted-foreground">Maintain clear visual hierarchy</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <p className="font-medium">Primary for conversion goals</p>
                <p className="text-muted-foreground">Book Demo, Get Started, Sign Up</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <p className="font-medium">Secondary for exploration</p>
                <p className="text-muted-foreground">Learn More, View Features, See Examples</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-600 font-bold">✗</span>
              <div>
                <p className="font-medium">Multiple primary CTAs competing</p>
                <p className="text-muted-foreground">Creates confusion and reduces conversions</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
