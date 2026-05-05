import type React from "react";
import { Link, NavLink } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/cms/portal" },
  { label: "Slides", href: "/cms/portal/slides" },
  { label: "Components", href: "/cms/portal/components-preview" },
  { label: "Customers", href: "/cms/portal/customers" },
  { label: "Financials", href: "/cms/portal/financials" },
  { label: "Team", href: "/cms/portal/team" },
  { label: "Round", href: "/cms/portal/round" },
  { label: "Style refs", href: "/cms/portal/style-references" },
  { label: "Investors", href: "/cms/investors" },
  { label: "Pledges", href: "/cms/investors/pledges" },
];

export function PortalCmsLayout({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-6 py-12 pt-32">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Button asChild variant="ghost" className="mb-3 px-0">
              <Link to="/cms">← Back to CMS</Link>
            </Button>
            <h1 className="text-4xl font-bold gradient-text">{title}</h1>
            {description ? <p className="mt-2 max-w-3xl text-muted-foreground">{description}</p> : null}
          </div>
          {action}
        </div>
        <div className="mb-8 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/cms/portal" || item.href === "/cms/investors"}
              className={({ isActive }) => cn("rounded-md border px-3 py-2 text-sm font-medium transition-colors", isActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-card-foreground hover:bg-muted hover:text-foreground")}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        {children}
      </main>
    </div>
  );
}
