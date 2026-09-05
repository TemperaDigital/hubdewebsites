import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";

import { SiteLayout } from "@/components/SiteLayout";
import { AdminLayout } from "@/components/AdminLayout";

import Home from "./pages/Home";
import Tracks from "./pages/Tracks";
import Platforms from "./pages/Platforms";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import News from "./pages/News";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTracks from "./pages/admin/AdminTracks";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminPlatforms from "./pages/admin/AdminPlatforms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/trilhas" element={<Tracks />} />
                <Route path="/plataformas" element={<Platforms />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/noticias" element={<News />} />
              </Route>

              <Route path="/auth" element={<Auth />} />

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="trilhas" element={<AdminTracks />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="plataformas" element={<AdminPlatforms />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
