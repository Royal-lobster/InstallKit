"use client";

import {
  ArrowsClockwiseIcon,
  CheckIcon,
  CopyIcon,
  LinkIcon,
  TerminalWindowIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useCopyToClipboard } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SYNC_COMMAND = "curl -fsSL installkit.vercel.app/s | bash";

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

export function SyncDialog({ open, onOpenChange }: SyncDialogProps) {
  const [copiedText, copy] = useCopyToClipboard();
  const copied = copiedText === SYNC_COMMAND;

  const handleCopy = async () => {
    await copy(SYNC_COMMAND);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogClose />
        <DialogHeader className="items-center pt-6 pb-2">
          <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/20">
            <TerminalWindowIcon
              className="size-7 text-primary"
              weight="duotone"
            />
          </div>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Sync Your Existing Setup
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Already have apps installed via Homebrew? Generate a shareable
            InstallKit link from your current setup.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Run this in Terminal
            </span>
            <div className="group relative">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-3 pr-12 font-mono text-sm transition-colors group-hover:border-primary/30 group-hover:bg-secondary/70">
                <span className="text-muted-foreground">$</span>
                <code className="flex-1 select-all text-foreground">
                  {SYNC_COMMAND}
                </code>
              </div>
              <Button
                size="sm"
                variant={copied ? "default" : "ghost"}
                onClick={handleCopy}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                {copied ? (
                  <CheckIcon className="size-4" weight="bold" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground">
              What happens
            </h3>
            <div className="grid gap-2.5">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 p-3 transition-colors hover:border-border hover:bg-card"
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

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              <span className="font-medium">Note:</span> This only reads your
              installed Homebrew packages. It doesn't modify anything on your
              Mac.
            </p>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
