"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type UsageWarningToastProps = {
  usagePercentage: number;
  usedMessages: number;
  maxMessages: number;
};

export function UsageWarningToast({
  usagePercentage,
  usedMessages,
  maxMessages,
}: UsageWarningToastProps) {
  useEffect(() => {
    if (usagePercentage >= 100) {
      toast.error("今月の上限通数に到達しています。プラン変更をご検討ください。");
      return;
    }

    if (usagePercentage >= 80) {
      toast.warning(
        `今月の利用率が ${Math.floor(usagePercentage)}% です（${usedMessages.toLocaleString()}/${maxMessages.toLocaleString()}通）。`,
      );
    }
  }, [usagePercentage, usedMessages, maxMessages]);

  return null;
}
