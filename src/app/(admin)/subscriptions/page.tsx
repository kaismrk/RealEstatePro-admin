"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  useSubscriptionPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeactivatePlan,
} from "@/lib/hooks/usePlans";
import { PlanForm, type PlanFormValues } from "@/components/plans/PlanForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SubscriptionPlan } from "@/lib/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function SubscriptionPlansPage() {
  const { data, isLoading, isError } = useSubscriptionPlans();
  const { mutate: createPlan, isPending: creating } = useCreatePlan();
  const { mutate: updatePlan, isPending: updating } = useUpdatePlan();
  const { mutate: deactivatePlan, isPending: deactivating } = useDeactivatePlan();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);

  const handleCreate = (values: PlanFormValues) => {
    createPlan(values, { onSuccess: () => setShowCreateDialog(false) });
  };

  const handleUpdate = (values: PlanFormValues) => {
    if (!editPlan) return;
    updatePlan(
      { id: editPlan.id, payload: values },
      { onSuccess: () => setEditPlan(null) }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load plans. Check your permissions (requires billing:manage).
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} plans total</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data?.items.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-500">
              No subscription plans yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Billing</th>
                    <th className="px-4 py-3">Listing Limit</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.items.map((plan: SubscriptionPlan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{plan.name}</td>
                      <td className="px-4 py-3 text-gray-700">
                        ${plan.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">
                        {plan.billing_cycle}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{plan.listing_limit}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{plan.country_code}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {plan.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {format(new Date(plan.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditPlan(plan)}
                            className="gap-1.5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          {plan.is_active && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deactivatePlan(plan.id)}
                              disabled={deactivating}
                              className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Deactivate
                            </Button>
                          )}
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

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Subscription Plan</DialogTitle>
          </DialogHeader>
          <PlanForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
            isPending={creating}
            submitLabel="Create Plan"
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editPlan} onOpenChange={(open) => !open && setEditPlan(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
          </DialogHeader>
          {editPlan && (
            <PlanForm
              defaultValues={editPlan}
              onSubmit={handleUpdate}
              onCancel={() => setEditPlan(null)}
              isPending={updating}
              submitLabel="Update Plan"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
