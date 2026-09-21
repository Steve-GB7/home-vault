"use client";

import { useState, useEffect, useCallback } from "react";
import { useRole } from "@/hooks/useRole";
import type { AssetWithCoverage } from "@/types/domain";

export function useAssets() {
  const { user } = useRole();
  const [assets, setAssets] = useState<AssetWithCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const url = user?.householdId
        ? `/api/assets?household_id=${user.householdId}`
        : "/api/assets";
      const res = await fetch(url);
      const json = await res.json();
      if (json.ok && json.data) {
        setAssets(json.data);
      } else {
        throw new Error(json.error || "Failed to load assets");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.householdId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refreshAssets: fetchAssets, setAssets };
}
