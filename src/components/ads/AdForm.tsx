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
import { formatWeekRangePreview, validateWeekRange } from "@/lib/utils/isoWeek";
import type {
  AdCampaign,
  AdCampaignCreate,
  AdCtaAction,
  AdvertiserType,
  AdMediaType,
} from "@/lib/types";

// Preset CTA labels (locked product decision — French-first market copy)
export const CTA_LABEL_PRESETS = [
  "En savoir plus",
  "Contacter",
  "Simuler mon crédit",
  "Voir les annonces",
  "Découvrir",
] as const;

const CTA_VALUE_META: Record<
  AdCtaAction,
  { label: string; placeholder: string }
> = {
  web: { label: "Web URL", placeholder: "https://example.tn/offer" },
  whatsapp: { label: "WhatsApp number", placeholder: "216XXXXXXXX" },
  phone: { label: "Phone number", placeholder: "+216 XX XXX XXX" },
  internal: { label: "Internal route", placeholder: "/loans?rate=5.5&bank=BIAT" },
};

const currentIsoYear = new Date().getFullYear();

const adFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    advertiser_type: z.enum(["external", "pro"]),
    advertiser_name: z.string().min(1, "Advertiser name is required"),
    advertiser_user_id: z.string().optional(),
    media_type: z.enum(["image", "video"]),
    title: z.string().min(1, "Title is required"),
    body: z.string().optional(),
    cta_kind: z.enum(["none", "web", "whatsapp", "phone", "internal"]),
    cta_value: z.string().optional(),
    cta_label: z.string().optional(),
    display_order: z.coerce.number().int("Display order must be an integer"),
    country_code: z.string().length(2, "2-letter country code"),
    target_governorate: z.string().optional(),
    target_property_type: z.string().optional(),
    target_transaction_type: z.string().optional(),
    start_year: z.coerce.number().int().min(2020).max(2100),
    start_week: z.coerce.number().int().min(1).max(53),
    end_year: z.coerce.number().int().min(2020).max(2100),
    end_week: z.coerce.number().int().min(1).max(53),
    max_impressions: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.cta_kind !== "none" && !v.cta_value?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cta_value"],
        message: "CTA value is required for the selected action",
      });
    }
    const weekErr = validateWeekRange(v.start_year, v.start_week, v.end_year, v.end_week);
    if (weekErr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_week"],
        message: weekErr,
      });
    }
    if (v.max_impressions?.trim() && !/^\d+$/.test(v.max_impressions.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_impressions"],
        message: "Must be a positive integer",
      });
    }
    if (v.advertiser_user_id?.trim() && !/^\d+$/.test(v.advertiser_user_id.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["advertiser_user_id"],
        message: "Must be a numeric user id",
      });
    }
  });

export type AdFormValues = z.infer<typeof adFormSchema>;

/** Map form values to the backend create/update payload.
 *  The CTA pair is always sent together (backend rejects half-set CTA). */
export function toAdPayload(values: AdFormValues): AdCampaignCreate {
  return {
    name: values.name,
    advertiser_type: values.advertiser_type,
    advertiser_name: values.advertiser_name,
    advertiser_user_id: values.advertiser_user_id?.trim()
      ? Number(values.advertiser_user_id.trim())
      : null,
    media_type: values.media_type,
    title: values.title,
    body: values.body?.trim() ? values.body.trim() : null,
    cta_label: values.cta_label?.trim() ? values.cta_label : null,
    cta_action: values.cta_kind === "none" ? null : values.cta_kind,
    cta_value: values.cta_kind === "none" ? null : values.cta_value?.trim() ?? null,
    display_order: values.display_order,
    country_code: values.country_code.toUpperCase(),
    target_governorate: values.target_governorate?.trim() || null,
    target_property_type: values.target_property_type?.trim() || null,
    target_transaction_type: values.target_transaction_type?.trim() || null,
    start_year: values.start_year,
    start_week: values.start_week,
    end_year: values.end_year,
    end_week: values.end_week,
    max_impressions: values.max_impressions?.trim()
      ? Number(values.max_impressions.trim())
      : null,
  };
}

interface AdFormProps {
  defaultValues?: Partial<AdCampaign>;
  onSubmit: (values: AdFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel?: string;
}

export function AdForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel = "Save",
}: AdFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      advertiser_type: defaultValues?.advertiser_type ?? "external",
      advertiser_name: defaultValues?.advertiser_name ?? "",
      advertiser_user_id:
        defaultValues?.advertiser_user_id != null
          ? String(defaultValues.advertiser_user_id)
          : "",
      media_type: defaultValues?.media_type ?? "image",
      title: defaultValues?.title ?? "",
      body: defaultValues?.body ?? "",
      cta_kind: defaultValues?.cta_action ?? "none",
      cta_value: defaultValues?.cta_value ?? "",
      cta_label: defaultValues?.cta_label ?? "",
      display_order: defaultValues?.display_order ?? 0,
      country_code: defaultValues?.country_code ?? "TN",
      target_governorate: defaultValues?.target_governorate ?? "",
      target_property_type: defaultValues?.target_property_type ?? "",
      target_transaction_type: defaultValues?.target_transaction_type ?? "",
      start_year: defaultValues?.start_year ?? currentIsoYear,
      start_week: defaultValues?.start_week ?? 1,
      end_year: defaultValues?.end_year ?? currentIsoYear,
      end_week: defaultValues?.end_week ?? 1,
      max_impressions:
        defaultValues?.max_impressions != null
          ? String(defaultValues.max_impressions)
          : "",
    },
  });

  const advertiserType = watch("advertiser_type");
  const mediaType = watch("media_type");
  const ctaKind = watch("cta_kind");
  const ctaLabel = watch("cta_label");
  const startYear = watch("start_year");
  const startWeek = watch("start_week");
  const endYear = watch("end_year");
  const endWeek = watch("end_week");

  const preview = formatWeekRangePreview(
    Number(startYear),
    Number(startWeek),
    Number(endYear),
    Number(endWeek)
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ad-name">Campaign name *</Label>
        <Input id="ad-name" {...register("name")} placeholder="BIAT July push" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Advertiser type *</Label>
          <Select
            value={advertiserType}
            onValueChange={(v) => setValue("advertiser_type", v as AdvertiserType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="external">External brand</SelectItem>
              <SelectItem value="pro">Pro user (agency / promoter)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ad-advertiser-name">Advertiser name *</Label>
          <Input
            id="ad-advertiser-name"
            {...register("advertiser_name")}
            placeholder="Best Bank"
          />
          {errors.advertiser_name && (
            <p className="text-sm text-red-600">{errors.advertiser_name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ad-advertiser-user">Advertiser user id (pro)</Label>
          <Input
            id="ad-advertiser-user"
            {...register("advertiser_user_id")}
            placeholder="Optional"
            inputMode="numeric"
          />
          {errors.advertiser_user_id && (
            <p className="text-sm text-red-600">{errors.advertiser_user_id.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Media type *</Label>
          <Select
            value={mediaType}
            onValueChange={(v) => setValue("media_type", v as AdMediaType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select media" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad-title">Title *</Label>
        <Input id="ad-title" {...register("title")} placeholder="0% intro rate" />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad-body">Body</Label>
        <textarea
          id="ad-body"
          {...register("body")}
          rows={2}
          placeholder="Limited time offer"
          className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-neutral-400 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        />
      </div>

      {/* CTA */}
      <fieldset className="space-y-3 rounded-md border border-neutral-200 p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Call to action
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Action kind</Label>
            <Select
              value={ctaKind}
              onValueChange={(v) => setValue("cta_kind", v as AdFormValues["cta_kind"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="web">Web URL</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="phone">Phone call</SelectItem>
                <SelectItem value="internal">Internal route</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Button label</Label>
            <Select
              value={ctaLabel || "__none__"}
              onValueChange={(v) => setValue("cta_label", v === "__none__" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Preset label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {CTA_LABEL_PRESETS.map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {ctaKind !== "none" && (
          <div className="space-y-2">
            <Label htmlFor="ad-cta-value">{CTA_VALUE_META[ctaKind].label} *</Label>
            <Input
              id="ad-cta-value"
              {...register("cta_value")}
              placeholder={CTA_VALUE_META[ctaKind].placeholder}
            />
            {errors.cta_value && (
              <p className="text-sm text-red-600">{errors.cta_value.message}</p>
            )}
          </div>
        )}
      </fieldset>

      {/* Booked weeks */}
      <fieldset className="space-y-3 rounded-md border border-neutral-200 p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Booked ISO weeks
        </legend>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ad-start-year">Start year *</Label>
            <Input id="ad-start-year" type="number" {...register("start_year")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ad-start-week">Start week *</Label>
            <Input
              id="ad-start-week"
              type="number"
              min={1}
              max={53}
              {...register("start_week")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ad-end-year">End year *</Label>
            <Input id="ad-end-year" type="number" {...register("end_year")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ad-end-week">End week *</Label>
            <Input
              id="ad-end-week"
              type="number"
              min={1}
              max={53}
              {...register("end_week")}
            />
          </div>
        </div>
        {errors.end_week && (
          <p className="text-sm text-red-600">{errors.end_week.message}</p>
        )}
        <p className="text-xs text-neutral-500">
          {preview ? (
            <>
              Campaign window: <span className="font-medium text-neutral-700">{preview}</span>{" "}
              (Africa/Tunis)
            </>
          ) : (
            "Enter a valid week range to preview the campaign window."
          )}
        </p>
      </fieldset>

      {/* Targeting + ordering */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ad-display-order">Display order *</Label>
          <Input id="ad-display-order" type="number" {...register("display_order")} />
          {errors.display_order && (
            <p className="text-sm text-red-600">{errors.display_order.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ad-country">Country code *</Label>
          <Input
            id="ad-country"
            {...register("country_code")}
            maxLength={2}
            className="uppercase"
          />
          {errors.country_code && (
            <p className="text-sm text-red-600">{errors.country_code.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ad-target-gov">Target governorate</Label>
          <Input id="ad-target-gov" {...register("target_governorate")} placeholder="Any" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ad-target-prop">Target property type</Label>
          <Input
            id="ad-target-prop"
            {...register("target_property_type")}
            placeholder="Any"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ad-target-tx">Target transaction</Label>
          <Input
            id="ad-target-tx"
            {...register("target_transaction_type")}
            placeholder="Any"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad-max-impressions">Max impressions (cap)</Label>
        <Input
          id="ad-max-impressions"
          {...register("max_impressions")}
          placeholder="Unlimited"
          inputMode="numeric"
        />
        {errors.max_impressions && (
          <p className="text-sm text-red-600">{errors.max_impressions.message}</p>
        )}
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
