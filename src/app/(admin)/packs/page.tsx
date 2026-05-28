"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { adminApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ListingPackList } from "@/lib/types";

export default function PacksPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "listing-packs"],
    queryFn: async () => {
      const res = await adminApi.getListingPacks();
      return res.data as ListingPackList;
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">Listing Packs</h1>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">Listing Packs</h1>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load listing packs.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Listing Packs</h1>
        <p className="text-sm text-neutral-500">{data?.total ?? 0} packs total</p>
      </div>

      <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        Note: Admin create/edit endpoints for listing packs require backend implementation
        (POST /admin/listing-packs/ is not yet in the admin router). Currently showing read-only view from the public endpoint.
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Listing Packs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data?.items.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
              No listing packs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Listing Count</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data?.items.map((pack) => (
                    <tr key={pack.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-900">{pack.name}</td>
                      <td className="px-4 py-3 text-neutral-700">{pack.listing_count}</td>
                      <td className="px-4 py-3 text-neutral-700">${pack.price.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{pack.country_code}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {pack.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {format(new Date(pack.created_at), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
