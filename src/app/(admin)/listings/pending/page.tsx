"use client";

import { useState } from "react";
import { format } from "date-fns";
import { usePendingListings, useApproveListing, useRejectListing } from "@/lib/hooks/useListings";
import { RejectDialog } from "@/components/listings/RejectDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PropertyItem } from "@/lib/types";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface RejectTarget {
  id: number;
  title: string;
}

export default function PendingListingsPage() {
  const [page, setPage] = useState(1);
  const size = 20;
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);

  const { data, isLoading, isError } = usePendingListings(page, size);
  const { mutate: approve, isPending: approving } = useApproveListing();
  const { mutate: reject, isPending: rejecting } = useRejectListing();

  const totalPages = data ? Math.ceil(data.total / size) : 0;

  const handleApprove = (id: number) => {
    approve(id);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget) return;
    reject(
      { id: rejectTarget.id, reason },
      {
        onSuccess: () => setRejectTarget(null),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">Pending Listings</h1>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">Pending Listings</h1>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load pending listings. Check your permissions.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pending Listings</h1>
          <p className="text-sm text-neutral-500">{data?.total ?? 0} listings awaiting review</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data?.items.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
              No listings pending review
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data?.items.map((listing: PropertyItem) => (
                    <tr key={listing.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="font-medium text-neutral-900 truncate">{listing.title}</p>
                          {listing.price && (
                            <p className="text-xs text-neutral-500">
                              {listing.price.toLocaleString()} {listing.currency}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{listing.listing_type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{listing.city ?? "—"}</td>
                      <td className="px-4 py-3 text-neutral-600">{listing.country_code}</td>
                      <td className="px-4 py-3 text-neutral-500">
                        {format(new Date(listing.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(listing.id)}
                            disabled={approving}
                            className="gap-1.5 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setRejectTarget({ id: listing.id, title: listing.title })
                            }
                            disabled={rejecting}
                            className="gap-1.5"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      {rejectTarget && (
        <RejectDialog
          open={!!rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
          listingTitle={rejectTarget.title}
          isPending={rejecting}
        />
      )}
    </div>
  );
}
