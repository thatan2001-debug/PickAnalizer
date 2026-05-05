import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useUserRole() {
  const { data, isLoading } = useQuery({
    queryKey: ["current-user"],

    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      return {
        ...user,

        // Temporal mientras creamos perfiles premium
        role: "admin",
      };
    },

    staleTime: 5 * 60 * 1000,
  });

  const role = data?.role || "free";

  const isPremium =
    role === "premium" ||
    role === "admin";

  const isAdmin =
    role === "admin";

  return {
    user: data,
    role,
    isPremium,
    isAdmin,
    isLoading,
  };
}
