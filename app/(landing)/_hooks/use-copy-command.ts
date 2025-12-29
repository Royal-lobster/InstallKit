import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import {
  type CopyEvent,
  useAnalytics,
} from "@/app/(landing)/_hooks/use-analytics";

export function useCopyCommand() {
  const [, copy] = useCopyToClipboard();
  const [copiedText, setCopiedText] = useState<string>("");
  const { trackCopy } = useAnalytics();

  const handleCopy = (text: string, trackingData?: CopyEvent) => {
    if (!text) return false;

    copy(text);
    setCopiedText(text);

    // Clear copied state after 2 seconds
    setTimeout(() => setCopiedText(""), 2000);

    // Track the copy event if tracking data provided
    if (trackingData) {
      trackCopy(trackingData);
    }

    return true;
  };

  const isCopied = (text: string) => copiedText === text;

  return {
    handleCopy,
    isCopied,
  };
}
