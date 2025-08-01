import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DateProvider } from "@/contexts/DateContext";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/pages/Dashboard";
import { Safety } from "@/pages/Safety";
import { Quality } from "@/pages/Quality";
import { Cost } from "@/pages/Cost";
import { Inventory } from "@/pages/Inventory";
import { Delivery } from "@/pages/Delivery";
import { Production } from "@/pages/Production";
import { People } from "@/pages/People";
import { GraphView } from "@/pages/GraphView";
import { CreateMeetingEmail } from "@/pages/CreateMeetingEmail";
import { AllActionItems } from "@/pages/AllActionItems";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DateProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/quality" element={<Quality />} />
              <Route path="/cost" element={<Cost />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/production" element={<Production />} />
              <Route path="/people" element={<People />} />
              <Route path="/graph-view" element={<GraphView />} />
              <Route path="/create-meeting-email" element={<CreateMeetingEmail />} />
              <Route path="/all-action-items" element={<AllActionItems />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </DateProvider>
  </QueryClientProvider>
);

export default App;
