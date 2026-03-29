import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, DollarSign, BookOpen, Languages,
  TrendingUp, FileText, Users,
  Home, Sparkles, Puzzle, Handshake, Building2, Briefcase,
  PenSquare, Phone, CreditCard, Calendar,
  Lock, Palette, LogOut
} from "lucide-react";

interface RouteCard {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

interface Category {
  name: string;
  cards: RouteCard[];
}

const categories: Category[] = [
  {
    name: "Content Management",
    cards: [
      { title: "CMS Dashboard", description: "Main content management", href: "/cms", icon: LayoutDashboard },
      { title: "Pricing Config", description: "Manage pricing plans", href: "/cms?tab=pricing", icon: DollarSign },
      { title: "Blog Manager", description: "Create and edit posts", href: "/cms?tab=blog", icon: BookOpen },
      { title: "Translations", description: "Multi-language content", href: "/cms?tab=translations", icon: Languages },
    ],
  },
  {
    name: "Sales & Business",
    cards: [
      { title: "Pricing (Detailed)", description: "Public pricing page", href: "/en/pricing_detailed", icon: TrendingUp },
      { title: "Offers", description: "Manage client offers", href: "/cms?tab=offers", icon: FileText },
      { title: "Leads", description: "Track incoming leads", href: "/cms?tab=leads", icon: Users },
    ],
  },
  {
    name: "Pages (Public)",
    cards: [
      { title: "Homepage", description: "Main landing page", href: "/en", icon: Home },
      { title: "Features", description: "Product features", href: "/en/features", icon: Sparkles },
      { title: "Solutions", description: "Solution pages", href: "/en/solutions", icon: Puzzle },
      { title: "Partners", description: "Partner program", href: "/en/partners", icon: Handshake },
      { title: "About Us", description: "Company info", href: "/en/about-us", icon: Building2 },
      { title: "Careers", description: "Job listings", href: "/en/careers", icon: Briefcase },
      { title: "Blog", description: "Articles & news", href: "/en/blog", icon: PenSquare },
      { title: "Contact", description: "Contact page", href: "/en/contact", icon: Phone },
      { title: "Pricing", description: "Pricing overview", href: "/en/pricing", icon: CreditCard },
      { title: "Book Meeting", description: "Booking calendar", href: "/en/book", icon: Calendar },
    ],
  },
  {
    name: "Admin & Settings",
    cards: [
      { title: "Auth / Login", description: "Authentication page", href: "/auth", icon: Lock },
      { title: "Design System", description: "Brand & tokens", href: "/cms?tab=design", icon: Palette },
    ],
  },
];

const Internal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Internal Hub | Navio";
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }
      setUserEmail(session.user.email ?? null);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>Internal Hub</h1>
            {userEmail && (
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-6xl px-6 py-8 space-y-10">
        {categories.map((category) => (
          <section key={category.name}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--primary))' }}>
              {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.cards.map((card) => (
                <Link
                  key={card.href}
                  to={card.href}
                  className="group bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-4 p-4 border-l-4"
                  style={{ borderLeftColor: 'hsl(var(--accent))' }}
                >
                  <div
                    className="mt-0.5 flex-shrink-0 rounded-md p-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {card.title}
                    </h3>
                    <p className="text-sm text-white/60">{card.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default Internal;
