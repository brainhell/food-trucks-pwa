import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-white text-foreground flex flex-col items-center">
            {/* Mobile-centric container */}
            <div className="w-full max-w-md min-h-screen flex flex-col bg-card shadow-xl shadow-gray-200/50">
                <header className="p-6 sticky top-0 bg-white/80 glass z-20 flex justify-between items-center border-b border-orange-50">
                    <h1 className="text-xl font-bold italic text-primary">FoodTruck Hub</h1>
                    <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                        🛒
                    </div>
                </header>
                <main className="flex-1 p-6">
                    {children}
                </main>
                <footer className="p-6 text-center text-muted-foreground text-sm border-t border-gray-50">
                    <p>© 2026 FoodTruck Hub. Hecho con ❤️ para tu comunidad.</p>
                </footer>
            </div>
        </div>
    );
}
