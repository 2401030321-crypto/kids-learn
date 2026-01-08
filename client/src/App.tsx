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

function Router() {
  const [location] = useLocation();
  const isWatchPage = location.startsWith('/watch');

  return (
    <>
      {/* Hide TopBar on Watch page for immersion */}
      {!isWatchPage && <TopBar />}
      
      <main className="min-h-screen">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/watch/:id" component={Watch} />
          <Route path="/parent" component={ParentDashboard} />
          <Route path="/create" component={Create} />
          <Route component={NotFound} />
        </Switch>
      </main>

      {/* Hide BottomNav on Watch page */}
      {!isWatchPage && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <h1 className="text-5xl font-bold text-primary animate-bounce">
              KidSpace
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome to your playful learning adventure!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-card rounded-lg border-2 border-primary/20 kids-shadow kids-card-hover">
                <div className="h-12 w-12 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  ✨
                </div>
                <h3 className="font-bold text-lg">Stories</h3>
              </div>
              <div className="p-6 bg-card rounded-lg border-2 border-secondary/20 kids-shadow kids-card-hover">
                <div className="h-12 w-12 bg-secondary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  📚
                </div>
                <h3 className="font-bold text-lg">Learning</h3>
              </div>
              <div className="p-6 bg-card rounded-lg border-2 border-accent/20 kids-shadow kids-card-hover">
                <div className="h-12 w-12 bg-accent/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  🎨
                </div>
                <h3 className="font-bold text-lg">Creativity</h3>
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
