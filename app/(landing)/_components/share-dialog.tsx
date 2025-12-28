"use client";

import { CheckIcon, CopyIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { createShortURL } from "@/lib/api/shorturl";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAppIds: string[];
  customPackageTokens: string[];
}

const MAX_NAME_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 200;

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Please enter a name for your installation kit")
    .max(MAX_NAME_LENGTH, `Name must be ${MAX_NAME_LENGTH} characters or less`),
  description: z
    .string()
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
    )
    .optional(),
  createShortLink: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

export function ShareDialog({
  open,
  onOpenChange,
  selectedAppIds,
  customPackageTokens,
}: ShareDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      createShortLink: true,
    },
  });

  const [shortUrl, setShortUrl] = React.useState("");
  const [longUrl, setLongUrl] = React.useState("");
  const [useShortUrl, setUseShortUrl] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState("");

  const name = watch("name");
  const description = watch("description");
  const createShortLink = watch("createShortLink");

  const onSubmit = async (data: FormData) => {
    setError("");

    try {
      const allPackages = [...selectedAppIds, ...customPackageTokens];
      const params = new URLSearchParams({
        name: data.name.trim(),
        packages: allPackages.join(","),
      });

      if (data.description?.trim()) {
        params.append("description", data.description.trim());
      }

      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://installkit.vercel.app";
      const fullUrl = `${baseUrl}?${params.toString()}`;
      setLongUrl(fullUrl);

      if (data.createShortLink) {
        const shortUrl = await createShortURL(fullUrl);
        setShortUrl(shortUrl);
      }
    } catch (err) {
      setError("Failed to generate short URL. Please try again.");
      console.error(err);
    }
  };

  const handleCopyUrl = async () => {
    const urlToCopy = shortUrl && useShortUrl ? shortUrl : longUrl;
    if (!urlToCopy) return;
    await navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    reset();
    setShortUrl("");
    setLongUrl("");
    setUseShortUrl(true);
    setError("");
    setCopied(false);
    onOpenChange(false);
  };

  const isLinkGenerated = !!shortUrl || !!longUrl;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col gap-1.5 p-6 pb-0">
          <DialogTitle>Share Installation Kit</DialogTitle>
          <DialogDescription>
            Create a shareable link for your selected apps that others can use
            for quick installation.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 py-4">
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="name">Kit Name *</FieldLabel>
              <span className="text-xs text-muted-foreground">
                {name.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
            <Input
              id="name"
              placeholder="e.g., My Development Setup"
              disabled={isLinkGenerated}
              maxLength={MAX_NAME_LENGTH}
              {...register("name")}
            />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="description">
                Description (optional)
              </FieldLabel>
              <span className="text-xs text-muted-foreground">
                {description?.length || 0}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <Textarea
              id="description"
              placeholder="Describe what this kit is for..."
              disabled={isLinkGenerated}
              rows={3}
              {...register("description", {
                onChange: (e) => {
                  const value = e.target.value;
                  if (value.length > MAX_DESCRIPTION_LENGTH) {
                    e.target.value = value.slice(0, MAX_DESCRIPTION_LENGTH);
                  }
                },
              })}
            />
            <FieldError
              errors={errors.description ? [errors.description] : undefined}
            />
          </Field>

          {!isLinkGenerated && (
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor="create-short-link"
                className="cursor-pointer font-normal text-sm"
              >
                Create short link for easier sharing
              </Label>
              <Switch
                id="create-short-link"
                checked={createShortLink}
                onCheckedChange={(checked: boolean) =>
                  setValue("createShortLink", checked)
                }
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          {isLinkGenerated && (
            <>
              {shortUrl && (
                <Field>
                  <FieldLabel htmlFor="url-type">Link Type</FieldLabel>
                  <div className="flex gap-2">
                    <Toggle
                      pressed={!useShortUrl}
                      onPressedChange={() => setUseShortUrl(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Long URL
                    </Toggle>
                    <Toggle
                      pressed={useShortUrl}
                      onPressedChange={() => setUseShortUrl(true)}
                      variant="outline"
                      className="flex-1"
                    >
                      Short URL
                    </Toggle>
                  </div>
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="shareable-url">Shareable Link</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="shareable-url"
                    value={shortUrl && useShortUrl ? shortUrl : longUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyUrl}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckIcon className="size-4" weight="bold" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Button>
                </div>
              </Field>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            {!isLinkGenerated ? (
              <>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    "Generating..."
                  ) : (
                    <>
                      <ShareNetworkIcon className="size-4" />
                      Generate Link
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={handleClose}>
                Done
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
