import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchX, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    console.error("404: rota inexistente:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-lg space-y-6 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-soft">
          <SearchX className="h-12 w-12 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl font-bold text-primary">404</h1>
          <p className="text-xl font-medium text-foreground">Página não encontrada</p>
        </div>

        <p className="text-lg italic text-muted-foreground">
          "Essa página ainda não faz parte da minha trilha de estudos."
        </p>

        <p className="text-sm text-muted-foreground">
          Voltando ao início em <span className="font-semibold text-primary">{countdown}s</span>
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={() => navigate(-1)} variant="outline" className="gap-2 rounded-full">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <Button onClick={() => navigate("/")} className="gap-2 rounded-full">
            <Home className="h-4 w-4" /> Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
