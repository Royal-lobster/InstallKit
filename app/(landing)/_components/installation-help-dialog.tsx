"use client";

import {
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  FolderIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { defineStepper } from "@stepperize/react";
import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const { useStepper } = defineStepper(
  { id: "terminal", title: "Open Terminal" },
  { id: "homebrew", title: "Ensure Homebrew" },
  { id: "paste", title: "Paste Command" },
  { id: "run", title: "Run & Finish" },
);

interface InstallationHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  command: string;
  isUninstallMode?: boolean;
}

export function InstallationHelpDialog({
  open,
  onOpenChange,
  command,
  isUninstallMode = false,
}: InstallationHelpDialogProps) {
  const [, copy] = useCopyToClipboard();
  const [copiedCommand, setCopiedCommand] = useState<string>("");
  const stepper = useStepper();

  const HOMEBREW_INSTALL_COMMAND =
    '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';

  const handleCopyCommand = (cmd: string) => {
    copy(cmd);
    setCopiedCommand(cmd);
    setTimeout(() => setCopiedCommand(""), 2000);
  };

  const isCopied = (cmd: string) => copiedCommand === cmd;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden border-border/40 shadow-2xl">
        <DialogTitle className="sr-only">Installation Guide</DialogTitle>

        {/* Compact Progress Bar */}
        <div className="flex h-1 w-full bg-secondary/50">
          {stepper.all.map((step, index) => {
            const currentIndex = stepper.all.findIndex(
              (s) => s.id === stepper.current.id,
            );
            const isCompleted = index <= currentIndex;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex-1 transition-all duration-500",
                  isCompleted ? "bg-primary" : "bg-transparent",
                )}
              />
            );
          })}
        </div>

        <div className="p-6 pb-2">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Step{" "}
                {stepper.all.findIndex((s) => s.id === stepper.current.id) + 1}{" "}
                of {stepper.all.length}
              </span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              {stepper.current.title}
            </h2>
          </div>

          <div className="min-h-60">
            {stepper.switch({
              homebrew: () => (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Homebrew is required. If you don't have it, copy and run
                    this command first.
                  </p>

                  <div className="overflow-hidden rounded-lg border bg-zinc-950 shadow-sm">
                    <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-3 py-2">
                      <span className="text-[10px] font-medium text-zinc-400">
                        Install Command
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 gap-1.5 px-2 text-[10px] text-zinc-400 hover:text-white hover:bg-white/10"
                        onClick={() =>
                          handleCopyCommand(HOMEBREW_INSTALL_COMMAND)
                        }
                      >
                        {isCopied(HOMEBREW_INSTALL_COMMAND) ? (
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
                        {HOMEBREW_INSTALL_COMMAND}
                      </code>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircleIcon className="size-4 text-muted-foreground/50" />
                    <span>Already have it? Skip this step.</span>
                  </div>
                </div>
              ),
              terminal: () => (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Open the Terminal app to run the command. Choose one of
                    these methods:
                  </p>

                  <div className="grid gap-2">
                    <div className="flex items-center gap-3 rounded-lg border bg-card/50 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <MagnifyingGlassIcon className="size-4" weight="bold" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          Spotlight Search
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Press{" "}
                          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>Space
                          </kbd>
                          , type "Terminal"
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-dashed" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-background px-2 text-muted-foreground">
                          or
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border bg-card/50 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <FolderIcon className="size-4" weight="bold" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Finder</div>
                        <div className="text-[11px] text-muted-foreground">
                          Applications → Utilities → Terminal
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ),
              paste: () => (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Paste the command into your terminal window.
                  </p>

                  <div className="relative overflow-hidden rounded-lg border bg-zinc-950 shadow-sm">
                    <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-3 py-1.5">
                      <div className="flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-500/50" />
                        <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                        <div className="h-2 w-2 rounded-full bg-green-500/50" />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 gap-1 px-1.5 text-[10px] text-zinc-400 hover:text-white hover:bg-white/10"
                        onClick={() => handleCopyCommand(command)}
                      >
                        {isCopied(command) ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <div className="p-3 font-mono text-[11px]">
                      <div className="flex gap-2 text-zinc-300 break-all">
                        <span className="text-green-400 shrink-0">➜</span>
                        <span className="text-blue-400 shrink-0">~</span>
                        <span>{command}</span>
                        <span className="animate-pulse bg-zinc-500 w-1.5 h-4 block" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                    <kbd className="rounded bg-background border px-1.5 py-0.5 font-mono text-[10px]">
                      ⌘V
                    </kbd>
                    <span>to paste</span>
                  </div>
                </div>
              ),
              run: () => (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Press Enter and wait for the installation to complete.
                  </p>

                  <div className="rounded-lg border bg-zinc-950 p-3 font-mono text-[10px] shadow-sm">
                    <div className="space-y-1">
                      <div className="text-zinc-400">==&gt; Downloading...</div>
                      <div className="text-zinc-500">##O#- # #</div>
                      <div className="text-zinc-300">
                        ==&gt; {isUninstallMode ? "Uninstalling" : "Installing"}
                        ...
                      </div>
                      <div className="text-green-400 mt-2">✔ Success!</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-green-500/10 p-3">
                    <CheckCircleIcon
                      className="size-5 text-green-600 shrink-0"
                      weight="fill"
                    />
                    <div className="text-xs text-green-700 dark:text-green-400">
                      <p className="font-medium">All done!</p>
                      <p className="mt-0.5 opacity-90">
                        Your apps are ready to use.
                      </p>
                    </div>
                  </div>
                </div>
              ),
            })}
          </div>
        </div>

        <div className="p-4 pt-0 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={stepper.prev}
            disabled={stepper.isFirst}
            className="text-muted-foreground hover:text-foreground"
          >
            Back
          </Button>

          {stepper.isLast ? (
            <Button
              size="sm"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              Finish
            </Button>
          ) : (
            <Button size="sm" onClick={stepper.next} className="px-6">
              Next
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
