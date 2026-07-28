// import { Heart } from "lucide-react";

type AppFooterProps = {
  clinicName?: string;
  year?: number;
};

export function AppFooter({ 
  clinicName = "HealthTech Message Hub", 
  year = new Date().getFullYear() 
}: AppFooterProps) {
  return (
    <footer className="flex h-16 shrink-0 items-center justify-between border-t border-border bg-card/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>&copy; {year}</span>
        <span>{clinicName}</span>
        <span className="hidden sm:inline">- HealthTech Message Hub. All rights reserved.</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {/* <span className="hidden sm:inline">Dibuat</span> */}
        <span className="hidden sm:inline">Versi beta 1.1.2 Dibuat untuk fasilitas kesehatan</span>
      </div>
    </footer>
  );
}