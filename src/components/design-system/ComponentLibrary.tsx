import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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

export const ComponentLibrary = () => {
  return (
    <section>
      <h2 className="text-4xl font-bold gradient-text mb-8">Component Library</h2>
      <p className="text-muted-foreground mb-12 text-lg">
        Reusable UI components built with consistent styling and behavior patterns.
      </p>

      <div className="space-y-16">
        {/* Buttons */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Buttons</h3>
          <div className="grid gap-8">
            <Card className="glass-card p-6">
              <h4 className="text-lg font-medium mb-4">Button Variants</h4>
              <div className="flex flex-wrap gap-4 mb-6">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="text-sm">
                <code className="bg-muted px-2 py-1 rounded">
                  &lt;Button variant="default"&gt;Default&lt;/Button&gt;
                </code>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h4 className="text-lg font-medium mb-4">Button Sizes</h4>
              <div className="flex items-center gap-4 mb-6">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">📦</Button>
              </div>
              <div className="text-sm">
                <code className="bg-muted px-2 py-1 rounded">
                  &lt;Button size="lg"&gt;Large&lt;/Button&gt;
                </code>
              </div>
            </Card>
          </div>
        </div>

        {/* Badges */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Badges</h3>
          <Card className="glass-card p-6">
            <h4 className="text-lg font-medium mb-4">Badge Variants</h4>
            <div className="flex flex-wrap gap-4 mb-6">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="text-sm">
              <code className="bg-muted px-2 py-1 rounded">
                &lt;Badge variant="default"&gt;Default&lt;/Badge&gt;
              </code>
            </div>
          </Card>
        </div>

        {/* Form Elements */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Form Elements</h3>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="glass-card p-6">
              <h4 className="text-lg font-medium mb-4">Input Fields</h4>
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter password" />
                </div>
              </div>
              <div className="text-sm">
                <code className="bg-muted px-2 py-1 rounded">
                  &lt;Input type="email" placeholder="Email" /&gt;
                </code>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h4 className="text-lg font-medium mb-4">Selection Controls</h4>
              <div className="space-y-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" />
                  <Label htmlFor="notifications">Enable notifications</Label>
                </div>

                <RadioGroup defaultValue="option1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="option1" />
                    <Label htmlFor="option1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="option2" />
                    <Label htmlFor="option2">Option 2</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="text-sm">
                <code className="bg-muted px-2 py-1 rounded">
                  &lt;Checkbox /&gt; &lt;Switch /&gt; &lt;RadioGroup /&gt;
                </code>
              </div>
            </Card>
          </div>
        </div>

        {/* Progress & Status */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Progress & Status</h3>
          <Card className="glass-card p-6">
            <h4 className="text-lg font-medium mb-4">Progress Indicators</h4>
            <div className="space-y-6 mb-6">
              <div>
                <Label>Loading Progress</Label>
                <Progress value={33} className="mt-2" />
              </div>
              <div>
                <Label>Upload Progress</Label>
                <Progress value={66} className="mt-2" />
              </div>
              <div>
                <Label>Complete</Label>
                <Progress value={100} className="mt-2" />
              </div>
            </div>
            <div className="text-sm">
              <code className="bg-muted px-2 py-1 rounded">
                &lt;Progress value={66} /&gt;
              </code>
            </div>
          </Card>
        </div>

        {/* Dialogs */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Dialogs & Modals</h3>
          <Card className="glass-card p-6">
            <h4 className="text-lg font-medium mb-4">Alert Dialog</h4>
            <div className="mb-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Show Dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="text-sm">
              <code className="bg-muted px-2 py-1 rounded">
                &lt;AlertDialog&gt;&lt;AlertDialogTrigger&gt;...&lt;/AlertDialog&gt;
              </code>
            </div>
          </Card>
        </div>

        {/* Glass Morphism Cards */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Glass Morphism</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass p-6 text-white">
              <h4 className="text-lg font-medium mb-2">Glass Effect</h4>
              <p className="text-white/80 mb-4">
                Subtle glass morphism with transparency and blur.
              </p>
              <code className="text-xs bg-white/20 px-2 py-1 rounded">
                className="glass"
              </code>
            </Card>
            
            <Card className="glass-card p-6">
              <h4 className="text-lg font-medium mb-2">Glass Card</h4>
              <p className="text-muted-foreground mb-4">
                Enhanced glass effect for content cards.
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                className="glass-card"
              </code>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};