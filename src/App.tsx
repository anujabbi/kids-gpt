
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import ParentDashboard from "./pages/ParentDashboard";
import ChildChatPage from "./pages/ChildChatPage";
import PersonalizedPage from "./pages/PersonalizedPage";
import Comic from "./pages/Comic";
import PublishedComic from "./pages/PublishedComic";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/parent-dashboard" 
                  element={
                    <ProtectedRoute requireRole="parent">
                      <ParentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/parents" 
                  element={<Navigate to="/parent-dashboard" replace />} 
                />
                <Route 
                  path="/child-chat/:childId" 
                  element={
                    <ProtectedRoute requireRole="parent">
                      <ChildChatPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-page" 
                  element={
                    <ProtectedRoute requireRole="child">
                      <PersonalizedPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/comic" 
                  element={
                    <ProtectedRoute>
                      <Comic />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/publishedComic/:id" 
                  element={<PublishedComic />} 
                />
                <Route path="/chat" element={<Navigate to="/" replace />} />
                <Route path="/chats" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
