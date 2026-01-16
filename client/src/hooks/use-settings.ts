import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function getAuthHeaders(): Record<string, string> {
  const savedUser = localStorage.getItem("kidspace_user");
  if (savedUser) {
    const user = JSON.parse(savedUser);
    if (user.token) {
      return { "Authorization": `Bearer ${user.token}` };
    }
  }
  return {};
}

export function useSettings(childId: number) {
  return useQuery({
    queryKey: ["settings", childId],
    enabled: !!childId && childId > 0,
    queryFn: async () => {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/settings/${childId}`, { 
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ kidId, updates }: { kidId: number; updates: any }) => {
      const authHeaders = getAuthHeaders();
      const res = await fetch(`/api/settings/${kidId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["settings", variables.kidId] });
    },
  });
}
