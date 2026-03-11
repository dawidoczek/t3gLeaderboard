"use client"

import { useState, useMemo, useEffect } from "react"
import rawData from "../dane.json"; 
import { sortOptions, SortField, InstagramAccount } from "@/lib/instagram-data"
import { LeaderboardCard } from "./leaderboard-card"
import { ChevronDown, Trophy, ArrowUpDown } from "lucide-react"

export function Leaderboard() {
  const [sortBy, setSortBy] = useState<SortField>("followers_count")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Stany do obsługi LocalStorage (zabezpieczenie przed błędem hydracji Next.js)
  const [isClient, setIsClient] = useState(false)
  const [lastSeenUpdate, setLastSeenUpdate] = useState<string | null>(null)

  useEffect(() => {
    // Odpala się tylko w przeglądarce po pierwszym załadowaniu
    setIsClient(true)
    
    // 1. Odczytujemy kiedy użytkownik był tu ostatnio
    const storedLastSeen = localStorage.getItem("instagram_last_seen")
    setLastSeenUpdate(storedLastSeen)

    // 2. Szukamy "najświeższej" daty ze wszystkich danych w bazie
    let globalLatestDate = ""
    Object.values(rawData).forEach((team: any) => {
      const history = team.updates || []
      if (history.length > 0) {
        const teamLatestDate = history[history.length - 1].updated_at
        if (teamLatestDate && teamLatestDate > globalLatestDate) {
          globalLatestDate = teamLatestDate
        }
      }
    })

    // 3. Zapisujemy nową najświeższą datę do localStorage. 
    // Przy kolejnym wejściu na stronę, ta nowa data stanie się jego "storedLastSeen".
    if (globalLatestDate && storedLastSeen !== globalLatestDate) {
      localStorage.setItem("instagram_last_seen", globalLatestDate)
    }
  }, [])

  const instagramData = useMemo(() => {
    return Object.entries(rawData).map(([teamName, baseData]) => {
      const base = baseData as any;
      const history = base.updates || [];
      
      const current = history.length > 0 ? history[history.length - 1] : base;
      let previous = current; // Domyślnie brak wzrostu (current vs current)
      
      let growth = { followers: 0, engagement: 0, likes: 0, posts: 0 };

      // Wzrosty liczymy tylko po załadowaniu na kliencie
      if (isClient) {
        if (!lastSeenUpdate) {
          // SCENARIUSZ 1: Użytkownik wchodzi PIERWSZY RAZ w życiu
          // Porównujemy najnowszy update z "bazą" (pierwotnym stanem konta)
          previous = base;
        } else {
          // SCENARIUSZ 2: Użytkownik wraca na stronę
          if (current.updated_at && current.updated_at > lastSeenUpdate) {
            // Mamy NOWY update, którego jeszcze nie widział!
            // Szukamy w historii najnowszego wpisu, który widział podczas ostatniej wizyty
            const seenUpdates = history.filter((u: any) => u.updated_at <= lastSeenUpdate);
            previous = seenUpdates.length > 0 ? seenUpdates[seenUpdates.length - 1] : base;
          } else {
            // SCENARIUSZ 3: Widział już te dane (odświeżył stronę)
            // previous pozostaje jako current, więc wzrost wyjdzie 0
            previous = current; 
          }
        }

        // Obliczamy matematyczną różnicę
        growth = {
          followers: current.followers_count - previous.followers_count,
          engagement: parseFloat(current.engagement_rate || "0") - parseFloat(previous.engagement_rate || "0"),
          likes: current.total_likes_analyzed - previous.total_likes_analyzed,
          posts: current.total_media_count - previous.total_media_count,
        };
      }

      return {
        ...base,           
        ...current,        
        team_name: teamName,
        growth: growth     
      };
    });
  }, [isClient, lastSeenUpdate]); // Ważne: useMemo przeliczy się po odczytaniu z localStorage

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
          Dane odświeżane są co tydzień jak nie zapomne lol.
        </p>
      </div>
    </div>
  )
}