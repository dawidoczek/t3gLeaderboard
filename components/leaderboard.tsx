"use client"

import { useState, useMemo } from "react"
import rawData from "../dane.json"; 
import { sortOptions, SortField, InstagramAccount } from "@/lib/instagram-data"
import { LeaderboardCard } from "./leaderboard-card"
import { ChevronDown, Trophy, ArrowUpDown } from "lucide-react"

export function Leaderboard() {
  const [sortBy, setSortBy] = useState<SortField>("followers_count")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const instagramData = useMemo(() => {
    return Object.entries(rawData).map(([teamName, baseData]) => {
      const base = baseData as any;
      const history = base.updates || [];
      
      // Pobieramy dwa ostatnie wpisy z historii
      const current = history.length >= 1 ? history[history.length - 1] : base;
      const previous = history.length >= 2 ? history[history.length - 2] : null;
      
      let growth = { followers: 0, engagement: 0, likes: 0, posts: 0 };

      // Jeśli mamy historię (przynajmniej 2 wpisy), liczmy wzrost między nimi
      if (previous) {
        growth = {
          followers: current.followers_count - previous.followers_count,
          engagement: parseFloat(current.engagement_rate) - parseFloat(previous.engagement_rate),
          likes: current.total_likes_analyzed - previous.total_likes_analyzed,
          posts: current.total_media_count - previous.total_media_count,
        };
      }

      return {
        ...base,           // Dane bazowe (id, avatar, bio)
        ...current,        // Nadpisujemy najświeższymi danymi z historii
        team_name: teamName,
        growth: growth     // Dodajemy obliczony trend
      };
    });
  }, []);

  const sortedAccounts = useMemo(() => {
    const activeAccounts = instagramData.filter(
      (account) => account.username !== null
    )

    return [...activeAccounts].sort((a, b) => {
      let aValue: number
      let bValue: number

      if (sortBy === "engagement_rate" || sortBy === "average_likes") {
        aValue = parseFloat(a[sortBy] || "0")
        bValue = parseFloat(b[sortBy] || "0")
      } else {
        aValue = a[sortBy] as number
        bValue = b[sortBy] as number
      }

      return bValue - aValue
    })
  }, [sortBy, instagramData])

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Instagramowa Topka</h2>
            <p className="text-sm text-muted-foreground">
              {sortedAccounts.length} aktywnych zespołów na Instagramie.
            </p>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium text-foreground w-full sm:w-auto justify-between sm:justify-start"
          >
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <span>Sortuj: {currentSortLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      sortBy === option.value
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Leaderboard Grid */}
      <div className="grid gap-4">
        {sortedAccounts.map((account, index) => (
          <LeaderboardCard 
            key={account.id || account.team_name} 
            account={account} 
            rank={index + 1} 
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Dane historyczne są teraz czytane bezpośrednio z bazy.
        </p>
      </div>
    </div>
  )
}