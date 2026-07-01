import React from 'react';
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import { Shell } from "@/components/layout/Shell";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Monitoring from "@/pages/Monitoring";
import Forecasting from "@/pages/Forecasting";
import Nowcasting from "@/pages/Nowcasting";
import Analytics from "@/pages/Analytics";
import Datasets from "@/pages/Datasets";
import Explainability from "@/pages/Explainability";
import Alerts from "@/pages/Alerts";
import Performance from "@/pages/Performance";
import Mission from "@/pages/Mission";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 30000,
      refetchOnWindowFocus: false,
      retry: 2,
    }
  }
});

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/monitoring" component={Monitoring} />
        <Route path="/forecasting" component={Forecasting} />
        <Route path="/nowcasting" component={Nowcasting} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/datasets" component={Datasets} />
        <Route path="/explainability" component={Explainability} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/performance" component={Performance} />
        <Route path="/mission" component={Mission} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
