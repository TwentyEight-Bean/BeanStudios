import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

// Singleton Supabase client shared across the app.
// createClient with the same URL+key reuses the same internal session store
// within the same browser tab, so getSession() always reflects the live auth state.
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

/**
 * Returns the freshest available Bearer token.
 * - Calls getSession() so the SDK can auto-refresh an expiring token.
 * - Falls back to the static publicAnonKey if the user is not signed in.
 */
export async function getAuthToken(): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
  } catch (err) {
    console.warn("getAuthToken: could not get session, using anon key.", err);
  }
  return publicAnonKey;
}
