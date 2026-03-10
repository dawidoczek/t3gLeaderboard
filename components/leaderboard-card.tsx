"use client"

import { useEffect, useState } from "react"
import { InstagramAccount } from "@/lib/instagram-data"
import { ExternalLink, Heart, MessageCircle, Users, ImageIcon, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

// Rozszerzamy interfejs o dane o wzroście
interface LeaderboardCardProps {
  account: InstagramAccount & {
    growth?: {
      followers: number;
      engagement: number;
      likes: number;
      posts: number;
    }
  }
  rank: number
}

// Komponent pomocniczy do wyświetlania trendu
function TrendIndicator({ value, isPercent = false }: { value: number | undefined, isPercent?: boolean }) {
  if (!value || value === 0) return null;

  const isPositive = value > 0;
  const ColorClass = isPositive ? "text-emerald-500" : "text-rose-500";
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <span className={`inline-flex items-center text-[10px] font-bold ml-1 ${ColorClass}`}>
      <Icon className="w-3 h-3 mr-0.5" />
      {isPositive ? "+" : ""}{isPercent ? value.toFixed(1) : value}{isPercent ? "%" : ""}
    </span>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}

function getElapsedTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h temu`
  if (hours > 0) return `${hours}h ${minutes % 60}m temu`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s temu`
  return `${seconds}s temu`
}

function getRankBadge(rank: number) {
  const commonClasses = "absolute -top-2 -left-2 rounded-full flex items-center justify-center shadow-lg z-10 font-bold";
  if (rank === 1) return <div className={`${commonClasses} w-10 h-10 bg-amber-400 text-amber-900 text-lg`}>1</div>;
  if (rank === 2) return <div className={`${commonClasses} w-9 h-9 bg-slate-300 text-slate-700 text-base`}>2</div>;
  if (rank === 3) return <div className={`${commonClasses} w-8 h-8 bg-amber-600 text-amber-100 text-sm`}>3</div>;
  return (
    <div className="absolute -top-1.5 -left-1.5 w-7 h-7 bg-secondary rounded-full flex items-center justify-center z-10">
      <span className="text-xs font-semibold text-muted-foreground">{rank}</span>
    </div>
  )
}

export function LeaderboardCard({ account, rank }: LeaderboardCardProps) {
  const [elapsedTime, setElapsedTime] = useState(getElapsedTime(account.updated_at))

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime(account.updated_at))
    }, 1000)
    return () => clearInterval(interval)
  }, [account.updated_at])

  const instagramUrl = account.username ? `https://www.instagram.com/${account.username}` : null
  const engagementRate = account.engagement_rate ? parseFloat(account.engagement_rate).toFixed(1) : "N/A"

  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      {getRankBadge(rank)}

      <div className="flex items-start gap-4">
        {/* Profile Picture */}
        <div className="relative shrink-0">
          {account.local_profile_picture ? (
            <img
              src={account.local_profile_picture}
              alt={account.team_name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/50 transition-all"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center ring-2 ring-border">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate text-lg leading-tight">
                {account.team_name}
              </h3>
              {account.username && (
                <p className="text-sm text-muted-foreground truncate">
                  @{account.username}
                </p>
              )}
            </div>
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {/* Obserwujący */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground">
                  {formatNumber(account.followers_count)}
                </span>
                <TrendIndicator value={account.growth?.followers} />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Followers</span>
            </div>

            {/* Zaangażowanie */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-foreground">
                  {engagementRate}%
                </span>
                <TrendIndicator value={account.growth?.engagement} isPercent />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Engagement</span>
            </div>

            {/* Lajki */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-bold text-foreground">
                  {formatNumber(account.total_likes_analyzed)}
                </span>
                <TrendIndicator value={account.growth?.likes} />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Likes</span>
            </div>

            {/* Media */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-bold text-foreground">
                  {account.total_media_count}
                </span>
                <TrendIndicator value={account.growth?.posts} />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Posts</span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <span className="text-[11px] text-muted-foreground italic">
              Ostatni update: {new Date(account.updated_at).toLocaleDateString()}
            </span>
            <span className="text-[11px] text-primary font-semibold">
              {elapsedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}