import { User, Settings, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { value: "/", label: "Dashboard" },
    { value: "/safety", label: "Safety" },
    { value: "/quality", label: "Quality" },
    { value: "/inventory", label: "Inventory" },
    { value: "/delivery", label: "Delivery" },
    { value: "/production", label: "Production" },
    { value: "/people", label: "People" }
  ];

  const moreViewsItems = [
    { value: "/cost", label: "Cost" },
    { value: "/all-action-items", label: "All Action Items" },
    { value: "/graph-view", label: "Admin Graph View" },
    { value: "/create-meeting-email", label: "Create Meeting Email" }
  ];

  const isMoreViewsActive = moreViewsItems.some(item => item.value === currentPath);

  return (
    <header className="bg-gradient-header text-navy-foreground border-b border-navy/20 shadow-lg">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-navy-foreground rounded-lg flex items-center justify-center">
              <span className="text-navy font-bold text-sm">KPI</span>
            </div>
            <span className="text-lg font-semibold">Operations Dashboard</span>
          </Link>


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-navy/20">
                <User className="w-4 h-4 mr-2" />
                Admin User
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs value={currentPath} className="w-full">
          <TabsList className="grid grid-cols-8 w-full bg-navy/20">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
                asChild
                className="data-[state=active]:bg-navy-foreground data-[state=active]:text-navy"
              >
                <Link to={tab.value}>{tab.label}</Link>
              </TabsTrigger>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    isMoreViewsActive 
                      ? 'shadow-sm bg-navy-foreground text-navy' 
                      : 'text-muted-foreground hover:text-navy-foreground'
                  }`}
                >
                  More Pages
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {moreViewsItems.map((item) => (
                  <DropdownMenuItem key={item.value} asChild>
                    <Link to={item.value} className="w-full">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};