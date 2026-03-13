import { createServerSupabase } from "@/lib/supabase-server";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const supabase = await createServerSupabase();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AdminDashboard posts={posts || []} userEmail={user?.email || ""} />
  );
}
