import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const portalTabs = [
  { value: "pitch", label: "Pitch" },
  { value: "traction", label: "Traction" },
  { value: "financials", label: "Financials" },
  { value: "customers", label: "Customers" },
  { value: "team", label: "Team & Story" },
  { value: "invest", label: "Invest" },
] as const;

export type PortalTabValue = (typeof portalTabs)[number]["value"];

const validTabs = new Set<PortalTabValue>(portalTabs.map((tab) => tab.value));

export function resolvePortalTab(value: string | null): PortalTabValue {
  return value && validTabs.has(value as PortalTabValue) ? (value as PortalTabValue) : "pitch";
}

interface PortalTabsProps {
  activeTab: PortalTabValue;
}

export function PortalTabs({ activeTab }: PortalTabsProps) {
  const [, setSearchParams] = useSearchParams();

  const handleTabChange = (value: string) => {
    const nextTab = resolvePortalTab(value);
    if (nextTab === "pitch") {
      setSearchParams({});
      return;
    }
    setSearchParams({ tab: nextTab });
  };

  return (
    <div className="sticky top-[128px] z-40 border-b border-border bg-background md:top-[96px]">
      <div className="mx-auto max-w-screen-2xl px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div
            className="overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            <TabsList className="h-12 min-w-max justify-start rounded-none bg-transparent p-0 text-muted-foreground">
              {portalTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 text-sm font-medium shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                    "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
