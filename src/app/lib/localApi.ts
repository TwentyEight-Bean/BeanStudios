/**
 * localApi.ts (REFACTORED for Neon + Prisma Backend)
 * Drop-in replacement for existing UI components to fetch from /api routes.
 * Transitions from client-side localStorage to server-side Postgres.
 */

// ── Types (Preserved for compatibility) ────────────────────────────────────
export interface Creator {
  id: string;
  name: string;
  role: string;
  jobs: number;
  rating: number;
  img: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  price: string;
  specialty: string[];
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  creatorId: string;
  creatorName: string;
  creatorRole: string;
  creatorImg: string;
  serviceTitle: string;
  price: string;
  date: string;
  time: string;
  duration: string;
  note?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  tag: string;
  tagColor: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  status: string;
  date: string;
  img: string;
  budget: string;
  color: string;
}

export interface SearchResult {
  type: "creator" | "booking" | "blog";
  title: string;
  subtitle: string;
  link: string;
}

export interface Notification {
  id: string;
  type: "booking" | "message" | "system" | "promo";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
  color: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  authorId: string;
  avatar: string;
  img: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  content: string;
  status: "pending" | "published";
  createdAt: string;
}

export interface FeedPost {
  id: number;
  user: { name: string; role: string; avatar: string };
  img: string;
  caption: string;
  likes: number;
  comments: number;
  time: string;
  tags: string[];
  isVideo: boolean;
  commentList: any[];
}

export interface UserSettings {
  notifications: { booking: boolean; message: boolean; system: boolean; promo: boolean };
  privacy: { showOnline: boolean; showProfile: boolean; showStats: boolean };
  display: { compactMode: boolean; animationsEnabled: boolean };
  language: string;
}

// ── API Fetch Client Functions ─────────────────────────────────────────────

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`API Error: ${path} (${res.status})`);
  return res.json();
}

// Creators
export async function getCreators(): Promise<Creator[]> { return apiFetch("/api/creators"); }

// Bookings
export async function getAllBookings(): Promise<Booking[]> { return apiFetch("/api/bookings"); }
export async function getUserBookings(userId: string): Promise<Booking[]> { return apiFetch(`/api/bookings?userId=${userId}`); }
export async function createBooking(data: any): Promise<Booking> {
  return apiFetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
export async function updateBookingStatus(id: string, status: string): Promise<void> {
  await apiFetch(`/api/bookings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

// Users
export async function getAllUsers(): Promise<UserProfile[]> { return apiFetch("/api/users"); }
export async function getUserProfile(id: string): Promise<UserProfile | null> { return apiFetch(`/api/users/${id}`); }

// Blog
export async function getBlogPosts(): Promise<BlogPost[]> { return apiFetch("/api/blogs"); }
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> { return apiFetch(`/api/blogs/${slug}`); }
export async function saveBlogPost(data: any): Promise<BlogPost> {
  return apiFetch("/api/blogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
export async function approveBlogPost(id: string): Promise<void> {
  await apiFetch(`/api/blogs/${id}/approve`, { method: "PATCH" });
}
export async function deleteBlogPost(id: string): Promise<void> {
  await apiFetch(`/api/blogs/${id}`, { method: "DELETE" });
}

// Feed
export async function getFeedPosts(): Promise<FeedPost[]> { return apiFetch("/api/feed"); }
export async function createFeedPost(data: any): Promise<void> {
  await apiFetch("/api/feed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
export async function toggleFeedLike(id: number, doLike: boolean): Promise<void> {
  await apiFetch(`/api/feed/${id}/like`, { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doLike })
  });
}
export async function addFeedComment(id: number, comment: any): Promise<void> {
  await apiFetch(`/api/feed/${id}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(comment),
  });
}

// Settings
export async function getUserSettings(): Promise<UserSettings> { return apiFetch("/api/settings"); }
export async function saveUserSettings(settings: UserSettings): Promise<void> {
  await apiFetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
}

// Portfolio & Projects
export async function getPortfolio(userId: string): Promise<string[]> { return apiFetch(`/api/portfolio/${userId}`); }
export async function savePortfolio(userId: string, imgs: string[]): Promise<void> {
  await apiFetch(`/api/portfolio/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imgs }),
  });
}
export async function getProjects(userId: string): Promise<Project[]> { return apiFetch(`/api/projects/${userId}`); }
export async function saveProject(userId: string, proj: any): Promise<void> {
  await apiFetch(`/api/projects/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proj),
  });
}

// Global Search
export async function globalSearch(q: string): Promise<SearchResult[]> { return apiFetch(`/api/search?q=${encodeURIComponent(q)}`); }

// Notifications
export async function getNotifications(): Promise<Notification[]> { return apiFetch("/api/notifications"); }
export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch(`/api/notifications/${id}`, { method: "PATCH" });
}
export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch("/api/notifications/read-all", { method: "POST" });
}
export async function getUnreadNotificationCount(): Promise<number> {
  const notifs = await getNotifications();
  return notifs.filter(n => !n.read).length;
}

// Analytics (Admin Only)
export async function getAnalytics() { return apiFetch("/api/analytics"); }

// No longer needed but kept for structural compatibility
export function seedAll() {}