"use client";

import QRCode from "react-qr-code";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LabelAsset = {
  id: number;
  serialNo: string;
  brand: string | null;
  model: string | null;
};

export function LabelPrinter({ assets }: { assets: LabelAsset[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((asset) =>
      [asset.serialNo, asset.brand, asset.model].some((value) =>
        (value ?? "").toLowerCase().includes(q),
      ),
    );
  }, [assets, query]);

  const selectedAssets = assets.filter((asset) => selected.includes(asset.id));

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-end gap-3">
        <div className="min-w-[240px]">
          <Input
            placeholder="ค้นหา S/N, Brand, Model"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => window.print()} disabled={selectedAssets.length === 0}>
          พิมพ์ป้าย ({selectedAssets.length})
        </Button>
      </div>

      <div className="no-print grid gap-2 md:grid-cols-2">
        {filtered.map((asset) => (
          <label key={asset.id} className="flex items-center gap-3 rounded-lg border p-3">
            <input
              type="checkbox"
              checked={selected.includes(asset.id)}
              onChange={() => toggle(asset.id)}
            />
            <span>
              {asset.serialNo} — {asset.brand} {asset.model}
            </span>
          </label>
        ))}
      </div>

      <div className="grid gap-4 print:grid-cols-2">
        {selectedAssets.map((asset) => {
          const url =
            typeof window !== "undefined"
              ? `${window.location.origin}/assets/${asset.id}`
              : `/assets/${asset.id}`;
          return (
            <Card key={asset.id} className="break-inside-avoid">
              <CardHeader>
                <CardTitle className="text-base">{asset.serialNo}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <QRCode value={url} size={96} />
                <div>
                  <p className="font-medium">
                    {asset.brand} {asset.model}
                  </p>
                  <p className="text-sm text-slate-500">IT Asset Label</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
