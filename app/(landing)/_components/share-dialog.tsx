"use client";

import { CheckIcon, CopyIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import type * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCopyToClipboard } from "usehooks-ts";
import { z } from "zod";
import {
  useSelectedApps,
  useSelectedFullCatalogPackages,
} from "@/app/(landing)/_hooks/use-package-state";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { createShortURL } from "@/lib/integrations/shorturl";

interface ShareDialogProps {
  children: React.ReactNode;
  disabled?: boolean;
  triggerProps?: Omit<React.ComponentProps<typeof DialogTrigger>, "children">;
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
  children,
  disabled,
  triggerProps,
}: ShareDialogProps) {
  // Get selection data from Zustand store
  const selectedApps = useSelectedApps();
  const selectedFullCatalogPackages = useSelectedFullCatalogPackages();

  const selectedAppIds = Array.from(selectedApps);
  const fullCatalogPackageTokens = Array.from(selectedFullCatalogPackages);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      createShortLink: true,
    },
  });

  const [urlType, setUrlType] = useState<"short" | "long">("short");
  const [copiedText, copy] = useCopyToClipboard();

  const generateLink = useMutation({
    mutationFn: async (data: FormData) => {
      const allPackages = [...selectedAppIds, ...fullCatalogPackageTokens];
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
          : "https://installkit.app";
      const longUrl = `${baseUrl}?${params.toString()}`;

      let shortUrl = null;
      if (data.createShortLink) {
        shortUrl = await createShortURL(longUrl);
      }

      return { longUrl, shortUrl };
    },
  });

  const name = watch("name");
  const description = watch("description");
  const createShortLink = watch("createShortLink");

  const { longUrl, shortUrl } = generateLink.data ?? {
    longUrl: "",
    shortUrl: null,
  };
  const urlToCopy = shortUrl && urlType === "short" ? shortUrl : longUrl;
  const copied = copiedText === urlToCopy;
  const isLinkGenerated = generateLink.isSuccess;

  const handleCopyUrl = async () => {
    if (!urlToCopy) return;
    await copy(urlToCopy);
  };

  const handleReset = () => {
    reset();
    generateLink.reset();
    setUrlType("short");
  };

  return (
    <Dialog onOpenChange={(open) => !open && handleReset()}>
      <DialogTrigger disabled={disabled} {...triggerProps}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <DialogClose className="absolute right-4 top-4 z-50" />

        <div className="p-6 pb-2">
          <DialogHeader className="items-start text-left p-0">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <ShareNetworkIcon className="size-5" weight="duotone" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Share Installation Kit
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1.5">
              Create a shareable link for your selected apps that others can use
              for quick installation.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit((data) => generateLink.mutate(data))}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <DialogBody className="space-y-5 px-6 py-4 pb-6">
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="name">Kit Name</FieldLabel>
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
                  Description{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
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
                className="resize-none"
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
              <div className="flex items-center justify-between gap-3 px-1 pb-2">
                <Label
                  htmlFor="create-short-link"
                  className="cursor-pointer font-medium text-sm"
                >
                  Create short link
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

            {generateLink.isError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium">
                {generateLink.error instanceof Error
                  ? generateLink.error.message
                  : "Failed to generate short URL. Please try again."}
              </div>
            )}

            {isLinkGenerated && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {shortUrl && (
                  <Field>
                    <FieldLabel htmlFor="url-type">Link Type</FieldLabel>
                    <div className="flex gap-2">
                      <Toggle
                        pressed={urlType === "long"}
                        onPressedChange={() => setUrlType("long")}
                        variant="outline"
                        className="flex-1"
                      >
                        Long URL
                      </Toggle>
                      <Toggle
                        pressed={urlType === "short"}
                        onPressedChange={() => setUrlType("short")}
                        variant="outline"
                        className="flex-1"
                      >
                        Short URL
                      </Toggle>
                    </div>
                  </Field>
                )}

                <Field>
                  <FieldLabel htmlFor="shareable-url">
                    Shareable Link
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="shareable-url"
                      value={
                        shortUrl && urlType === "short" ? shortUrl : longUrl
                      }
                      readOnly
                      className="font-mono text-sm bg-muted/50"
                    />
                    <Button
                      variant="outline"
                      onClick={handleCopyUrl}
                      className="shrink-0 h-9 px-3 text-sm"
                      type="button"
                    >
                      {copied ? (
                        <CheckIcon className="size-4" weight="bold" />
                      ) : (
                        <CopyIcon className="size-4" />
                      )}
                    </Button>
                  </div>
                </Field>
              </div>
            )}
          </DialogBody>

          <div className="flex justify-end gap-2 p-4 border-t bg-muted/30">
            {!isLinkGenerated ? (
              <>
                <DialogClose
                  type="button"
                  className={buttonVariants({ variant: "ghost" })}
                >
                  Cancel
                </DialogClose>
                <Button
                  type="submit"
                  disabled={generateLink.isPending}
                  className="gap-2"
                >
                  {generateLink.isPending ? (
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
              <DialogClose type="button" className={buttonVariants({})}>
                Done
              </DialogClose>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
