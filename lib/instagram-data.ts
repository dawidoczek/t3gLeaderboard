// lib/instagram-data.ts

export interface InstagramAccount {
  team_name: string
  id: string | null
  username: string | null
  name: string
  biography: string | null
  website: string | null
  profile_picture_url: string | null
  local_profile_picture?: string // Dodajemy to pole!
  followers_count: number
  follows_count: number
  total_media_count: number
  analyzed_posts: number
  total_likes_analyzed: number
  total_comments_analyzed: number
  average_likes: string
  average_comments: string
  engagement_rate: string | null
  weekly_posts: string | null
  comments_to_likes_ratio: string | null
  followers_to_follows_ratio: string | null
  updated_at: string
}

// Typy dla sortowania zostają bez zmian
export type SortField = 
  | "followers_count" 
  | "engagement_rate" 
  | "total_likes_analyzed" 
  | "total_media_count" 
  | "average_likes"

export const sortOptions: { value: SortField; label: string }[] = [
  { value: "followers_count", label: "Obserwujący" },
  { value: "engagement_rate", label: "Zaangażowanie" },
  { value: "total_likes_analyzed", label: "Łącznie lajków" },
  { value: "total_media_count", label: "Posty" },
  { value: "average_likes", label: "Średnie lajki na post" },
]