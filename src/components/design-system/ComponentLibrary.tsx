import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Calendar, User, Settings, ChevronDown, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  notifications: z.boolean().default(false),
  category: z.string().min(1, { message: "Please select a category." }),
});

export const ComponentLibrary = () => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      notifications: false,
      category: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Form submitted",
      description: "Your form has been submitted successfully.",
    });
    console.log(values);
  }
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

        {/* Comprehensive Forms */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Forms</h3>
          <Card className="glass-card p-6">
            <h4 className="text-lg font-medium mb-4">Complete Form Example</h4>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your message" {...field} />
                      </FormControl>
                      <FormDescription>Your message will be reviewed within 24 hours.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email notifications</FormLabel>
                        <FormDescription>Receive email updates about your account.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">Submit Form</Button>
              </form>
            </Form>
            <div className="text-sm mt-6">
              <code className="bg-muted px-2 py-1 rounded">
                &lt;Form&gt;&lt;FormField&gt;&lt;FormControl&gt;...&lt;/Form&gt;
              </code>
            </div>
          </Card>
        </div>

        {/* Navigation Components */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Navigation</h3>
          <div className="grid gap-8">
            <Card className="glass-card p-6">
              <h4 className="text-lg font-medium mb-4">Navigation Menu</h4>
              <NavigationMenu className="mb-6">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                              <div className="mb-2 mt-4 text-lg font-medium">Design System</div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                Beautifully designed components built with Radix UI and Tailwind CSS.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Introduction</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Re-usable components built using Radix UI and Tailwind CSS.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <li>
                          <NavigationMenuLink asChild>
                            <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Alert Dialog</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                A modal dialog that interrupts the user with important content.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              <div className="text-sm">
                <code className="bg-muted px-2 py-1 rounded">
                  &lt;NavigationMenu&gt;&lt;NavigationMenuList&gt;...&lt;/NavigationMenu&gt;
                </code>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h4 className="text-lg font-medium mb-4">Dropdown Menu</h4>
              <div className="mb-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <User className="mr-2 h-4 w-4" />
                      Open Menu
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="text-sm">
                <code className="bg-muted px-2 py-1 rounded">
                  &lt;DropdownMenu&gt;&lt;DropdownMenuTrigger&gt;...&lt;/DropdownMenu&gt;
                </code>
              </div>
            </Card>
          </div>
        </div>

        {/* Layout Components */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Layout & Containers</h3>
          <div className="grid gap-8">
            <Card className="glass-card p-6">
              <h4 className="text-lg font-medium mb-4">Tabs</h4>
              <Tabs defaultValue="account" className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account</CardTitle>
                      <CardDescription>
                        Make changes to your account here. Click save when you're done.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue="Pedro Duarte" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="@peduarte" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="password" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>
                        Change your password here. After saving, you'll be logged out.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="current">Current password</Label>
                        <Input id="current" type="password" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new">New password</Label>
                        <Input id="new" type="password" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save password</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
              <div className="text-sm">
                <code className="bg-muted px-2 py-1 rounded">
                  &lt;Tabs&gt;&lt;TabsList&gt;&lt;TabsContent&gt;...&lt;/Tabs&gt;
                </code>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h4 className="text-lg font-medium mb-4">Accordion</h4>
              <Accordion type="single" collapsible className="mb-6">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is it styled?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It comes with default styles that matches the other components' aesthetic.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is it animated?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It's animated by default, but you can disable it if you prefer.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="text-sm">
                <code className="bg-muted px-2 py-1 rounded">
                  &lt;Accordion&gt;&lt;AccordionItem&gt;&lt;AccordionTrigger&gt;...&lt;/Accordion&gt;
                </code>
              </div>
            </Card>
          </div>
        </div>

        {/* Enhanced Cards */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Cards & Content</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">John Doe</CardTitle>
                    <CardDescription>Software Engineer</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Passionate about creating amazing user experiences with modern web technologies.
                </p>
                <Separator className="my-4" />
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Mail className="mr-1 h-3 w-3" />
                    john@example.com
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Connect</Button>
              </CardFooter>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming Event
                </CardTitle>
                <CardDescription>Next team meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Conference Room A</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">Decline</Button>
                <Button size="sm">Accept</Button>
              </CardFooter>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Your monthly progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tasks completed</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Goals achieved</span>
                    <span className="text-sm text-muted-foreground">72%</span>
                  </div>
                  <Progress value={72} />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-sm mt-6">
            <code className="bg-muted px-2 py-1 rounded">
              &lt;Card&gt;&lt;CardHeader&gt;&lt;CardContent&gt;&lt;CardFooter&gt;...&lt;/Card&gt;
            </code>
          </div>
        </div>

        {/* Data Tables */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Data & Tables</h3>
          <Card className="glass-card p-6">
            <h4 className="text-lg font-medium mb-4">Data Table</h4>
            <Table className="mb-6">
              <TableCaption>A list of your recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">INV001</TableCell>
                  <TableCell>
                    <Badge variant="outline">Paid</Badge>
                  </TableCell>
                  <TableCell>Credit Card</TableCell>
                  <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">INV002</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Pending</Badge>
                  </TableCell>
                  <TableCell>PayPal</TableCell>
                  <TableCell className="text-right">$150.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">INV003</TableCell>
                  <TableCell>
                    <Badge variant="outline">Paid</Badge>
                  </TableCell>
                  <TableCell>Bank Transfer</TableCell>
                  <TableCell className="text-right">$350.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">INV004</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Failed</Badge>
                  </TableCell>
                  <TableCell>Credit Card</TableCell>
                  <TableCell className="text-right">$450.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="text-sm">
              <code className="bg-muted px-2 py-1 rounded">
                &lt;Table&gt;&lt;TableHeader&gt;&lt;TableBody&gt;&lt;TableRow&gt;...&lt;/Table&gt;
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