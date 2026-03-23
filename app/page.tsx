import { Leaderboard } from "@/components/leaderboard"
import { Instagram } from "lucide-react"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Instagram className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">T3G Leaderboard</h1>
              <p className="text-xs text-muted-foreground">Turniej Trójgamiczny instagramy</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="px-4 py-8">
        <Leaderboard />
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Copyright &copy; {new Date().getFullYear()} Dawid Rej
          </p>
        </div>
      </footer>
    </main>
  )
}
