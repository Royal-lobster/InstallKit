"use client";

import {
  ArrowsClockwiseIcon,
  CheckIcon,
  CopyIcon,
  LinkIcon,
  TerminalWindowIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import type * as React from "react";
import { useCopyToClipboard } from "usehooks-ts";
import { useAnalytics } from "@/app/(landing)/_hooks/use-analytics";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SyncDialogProps {
  children: React.ReactNode;
  triggerProps?: Omit<React.ComponentProps<typeof DialogTrigger>, "children">;
}

const SYNC_COMMAND = "curl -fsSL installkit.app/s | bash";

const BENEFITS = [
  {
    icon: LinkIcon,
    title: "Generate shareable link",
    description: "Creates a unique URL with all your installed apps",
  },
  {
    icon: ArrowsClockwiseIcon,
    title: "Set up another Mac",
    description: "Open the link on a new machine and install everything",
  },
  {
    icon: UsersIcon,
    title: "Share with friends",
    description: "Send your curated app list to colleagues or friends",
  },
];

export function SyncDialog({ children, triggerProps }: SyncDialogProps) {
  const [copiedText, copy] = useCopyToClipboard();
  const { trackCopy } = useAnalytics();
  const copied = copiedText === SYNC_COMMAND;

  const handleCopy = async () => {
    // Track the copy event
    trackCopy({
      type: "sync_command",
      command: SYNC_COMMAND,
    });

    await copy(SYNC_COMMAND);
  };

  return (
    <Dialog>
      <DialogTrigger {...triggerProps}>{children}</DialogTrigger>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden border-border/40 shadow-2xl">
        <DialogClose className="absolute right-4 top-4 z-50" />

        <div className="p-6 pb-2">
          <DialogHeader className="items-start text-left">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <TerminalWindowIcon className="size-5" weight="duotone" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Sync Your Setup
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1.5">
              Generate a shareable InstallKit link from your current Homebrew
              setup.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-2 space-y-6">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border bg-zinc-950 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-3 py-2">
                <span className="text-[10px] font-medium text-zinc-400">
                  Terminal Command
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 gap-1.5 px-2 text-[10px] text-zinc-400 hover:text-white hover:bg-white/10"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="size-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="size-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-3 overflow-x-auto">
                <code className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap break-all">
                  {SYNC_COMMAND}
                </code>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              Paste this into your Terminal to generate your link
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              What you can do
            </h3>
            <div className="grid gap-2">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-3 rounded-lg border bg-card/50 p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <benefit.icon className="size-4" weight="duotone" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">
                      {benefit.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-muted/30 p-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            <span className="font-medium text-foreground">Safe & Secure:</span>{" "}
            This only reads your installed packages. It doesn't modify your
            system.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
