import { useEffect, useRef, useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import {
  type CopyEvent,
  useAnalytics,
} from "@/app/(landing)/_hooks/use-analytics";

export function useCopyCommand() {
  const [, copy] = useCopyToClipboard();
  const [copiedText, setCopiedText] = useState<string>("");
  const { trackCopy } = useAnalytics();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = (text: string, trackingData?: CopyEvent) => {
    if (!text) return false;

    copy(text);
    setCopiedText(text);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Clear copied state after 2 seconds
    timeoutRef.current = setTimeout(() => {
      setCopiedText("");
      timeoutRef.current = null;
    }, 2000);

    // Track the copy event if tracking data provided
    if (trackingData) {
      trackCopy(trackingData);
    }

    return true;
  };

  const isCopied = (text: string) => copiedText !== "" && copiedText === text;

  return {
    handleCopy,
    isCopied,
  };
}
