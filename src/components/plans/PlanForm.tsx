"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubscriptionPlan } from "@/lib/types";

const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().positive("Price must be positive"),
  listing_limit: z.coerce.number().int().positive("Listing limit must be positive"),
  billing_cycle: z.enum(["monthly", "annual"]),
  country_code: z.string().min(2, "Country code is required").max(3),
});

export type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormProps {
  defaultValues?: Partial<SubscriptionPlan>;
  onSubmit: (values: PlanFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel?: string;
}

export function PlanForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel = "Save",
}: PlanFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      price: defaultValues?.price ?? 0,
      listing_limit: defaultValues?.listing_limit ?? 10,
      billing_cycle: defaultValues?.billing_cycle ?? "monthly",
      country_code: defaultValues?.country_code ?? "",
    },
  });

  const billingCycle = watch("billing_cycle");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Plan name *</Label>
        <Input id="name" {...register("name")} placeholder="Professional Monthly" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register("price")}
          />
          {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="listing_limit">Listing limit *</Label>
          <Input
            id="listing_limit"
            type="number"
            min="1"
            {...register("listing_limit")}
          />
          {errors.listing_limit && (
            <p className="text-sm text-red-600">{errors.listing_limit.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Billing cycle *</Label>
          <Select
            value={billingCycle}
            onValueChange={(v) => setValue("billing_cycle", v as "monthly" | "annual")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
          {errors.billing_cycle && (
            <p className="text-sm text-red-600">{errors.billing_cycle.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country_code">Country code *</Label>
          <Input
            id="country_code"
            {...register("country_code")}
            placeholder="TN"
            maxLength={3}
            className="uppercase"
          />
          {errors.country_code && (
            <p className="text-sm text-red-600">{errors.country_code.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
