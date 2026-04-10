"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ListingBoostList } from "@/lib/types";

// NOTE: The backend does not expose GET /admin/boosts/ in the admin router.
// Boosts are property-scoped: GET /properties/{id}/boosts.
// This page shows a backend gap notice. We fetch what's available from the
// public boosts endpoint if possible.

export default function BoostsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "boosts"],
    queryFn: async () => {
      // The admin boosts list endpoint does not exist yet in backend.
      // This will return 404 from the backend until implemented.
      const res = await apiClient.get("/admin/boosts/");
      return res.data as ListingBoostList;
    },
    retry: false,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Boost Monitor</h1>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Boost Monitor</h1>
        <p className="text-sm text-gray-500">Active boost campaigns across the platform</p>
      </div>

      {(isError || !data) && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <strong>Backend Gap:</strong> The endpoint <code>GET /admin/boosts/</code> is not yet implemented in the admin router. Boosts are currently only accessible per-property via <code>GET /properties/{"{id}"}/boosts</code>. This page will display data once the backend exposes a global admin boosts endpoint.
        </div>
      )}

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Active Boosts ({data.total})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.items.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-gray-500">
                No active boosts
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Placement</th>
                      <th className="px-4 py-3">Starts</th>
                      <th className="px-4 py-3">Ends</th>
                      <th className="px-4 py-3">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.items.map((boost) => (
                      <tr key={boost.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          #{boost.property_id}
                          {boost.property_title && (
                            <span className="ml-1 text-gray-500">— {boost.property_title}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{boost.placement_type}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {format(new Date(boost.starts_at), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {format(new Date(boost.ends_at), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {boost.amount_paid.toLocaleString()} {boost.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
