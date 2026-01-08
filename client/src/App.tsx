import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav, TopBar } from "@/components/Navigation";

import Home from "@/pages/Home";
import Watch from "@/pages/Watch";
import ParentDashboard from "@/pages/ParentDashboard";
import Create from "@/pages/Create";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <div className="p-8 max-w-7xl mx-auto w-full">
          <h2 className="text-3xl font-bold mb-6">Welcome Back, Explorer!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="aspect-video bg-muted rounded-2xl animate-pulse" />
            <div className="aspect-video bg-muted rounded-2xl animate-pulse" />
            <div className="aspect-video bg-muted rounded-2xl animate-pulse" />
          </div>
        </div>
      )}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
