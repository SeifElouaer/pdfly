"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Sliders, Check } from "lucide-react";

export interface ToolOptionValues {
  compressionLevel: "extreme" | "recommended" | "low";
  splitMode: "all" | "ranges";
  splitRanges: string;
  watermarkText: string;
  watermarkPosition: string;
  watermarkOpacity: number;
  watermarkFontSize: number;
  watermarkRotation: number;
  watermarkColor: string;
  pageNumberTemplate: string;
  pageNumberPosition: string;
  pageNumberStart: number;
  pageNumberMargin: number;
  password: string;
  imagePageSize: string;
  imageOrientation: string;
  imageMargin: number;
  imageFormat: "jpg" | "png";
  imageDpi: number;
  rotateAngle: number;
}

interface ToolOptionsProps {
  toolId: string;
  values: ToolOptionValues;
  onChange: (newValues: Partial<ToolOptionValues>) => void;
}

export function ToolOptions({ toolId, values, onChange }: ToolOptionsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Sliders className="h-4 w-4 text-brand" />
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Tool Options
        </h3>
      </div>

      {/* COMPRESS PDF */}
      {toolId === "compress-pdf" && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Compression Level
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              {
                id: "extreme",
                title: "Extreme Compression",
                desc: "Highest reduction, lower image resolution (~75% reduction).",
              },
              {
                id: "recommended",
                title: "Recommended Compression",
                desc: "Optimal balance of quality and file size (~50% reduction).",
              },
              {
                id: "low",
                title: "Low Compression",
                desc: "High visual quality, mild compression (~20% reduction).",
              },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ compressionLevel: preset.id as any })}
                className={`flex flex-col text-left p-3.5 rounded-xl border text-xs transition-all ${
                  values.compressionLevel === preset.id
                    ? "border-brand bg-brand/5 dark:bg-brand/10 ring-1 ring-brand font-semibold text-foreground"
                    : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{preset.title}</span>
                  {values.compressionLevel === preset.id && (
                    <Check className="h-4 w-4 text-brand" />
                  )}
                </div>
                <span className="mt-1 text-[11px] opacity-80">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SPLIT PDF */}
      {toolId === "split-pdf" && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Split Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChange({ splitMode: "all" })}
                className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                  values.splitMode === "all"
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                }`}
              >
                Extract All Pages
              </button>
              <button
                type="button"
                onClick={() => onChange({ splitMode: "ranges" })}
                className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                  values.splitMode === "ranges"
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                }`}
              >
                Custom Ranges
              </button>
            </div>
          </div>

          {values.splitMode === "ranges" && (
            <div>
              <label className="font-semibold text-foreground block mb-1">
                Page Ranges (comma-separated)
              </label>
              <input
                type="text"
                value={values.splitRanges}
                onChange={(e) => onChange({ splitRanges: e.target.value })}
                placeholder="e.g. 1-3, 5, 7-10"
                className="w-full h-9 rounded-lg border border-border bg-background px-3 font-mono text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Define the ranges or pages to extract into separate files.
              </span>
            </div>
          )}
        </div>
      )}

      {/* WATERMARK PDF */}
      {toolId === "watermark-pdf" && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1">Watermark Text</label>
            <input
              type="text"
              value={values.watermarkText}
              onChange={(e) => onChange({ watermarkText: e.target.value })}
              placeholder="e.g. CONFIDENTIAL, DRAFT"
              className="w-full h-9 rounded-lg border border-border bg-background px-3 font-semibold text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* 3x3 Position Matrix */}
          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Position
            </label>
            <div className="grid grid-cols-3 gap-1.5 w-48 mx-auto bg-muted/30 p-2 rounded-xl border border-border">
              {[
                "top-left",
                "top-center",
                "top-right",
                "middle-left",
                "center",
                "middle-right",
                "bottom-left",
                "bottom-center",
                "bottom-right",
              ].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => onChange({ watermarkPosition: pos })}
                  className={`h-9 rounded-md border text-[10px] font-mono transition-all ${
                    values.watermarkPosition === pos
                      ? "border-brand bg-brand text-white font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                  title={pos}
                >
                  {pos === "center" ? "•" : pos.split("-").map((s) => s[0].toUpperCase()).join("")}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity slider */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Opacity</span>
              <span className="font-mono text-muted-foreground">{Math.round(values.watermarkOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={values.watermarkOpacity}
              onChange={(e) => onChange({ watermarkOpacity: parseFloat(e.target.value) })}
              className="w-full accent-brand"
            />
          </div>

          {/* Font size */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Font Size</span>
              <span className="font-mono text-muted-foreground">{values.watermarkFontSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="80"
              step="2"
              value={values.watermarkFontSize}
              onChange={(e) => onChange({ watermarkFontSize: parseInt(e.target.value) })}
              className="w-full accent-brand"
            />
          </div>

          {/* Rotation angle */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Rotation Angle</span>
              <span className="font-mono text-muted-foreground">{values.watermarkRotation}°</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ watermarkRotation: 0 })}
                className={`py-1 px-2.5 rounded border text-[11px] ${
                  values.watermarkRotation === 0 ? "border-brand bg-brand text-white" : "border-border"
                }`}
              >
                0° (Horizontal)
              </button>
              <button
                type="button"
                onClick={() => onChange({ watermarkRotation: 45 })}
                className={`py-1 px-2.5 rounded border text-[11px] ${
                  values.watermarkRotation === 45 ? "border-brand bg-brand text-white" : "border-border"
                }`}
              >
                45° (Diagonal)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGE NUMBERS */}
      {toolId === "page-numbers" && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Number Format
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                "Page {n} of {total}",
                "{n} / {total}",
                "Page {n}",
                "{n}",
              ].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => onChange({ pageNumberTemplate: template })}
                  className={`py-2 px-3 rounded-lg border text-left font-mono font-semibold transition-all ${
                    values.pageNumberTemplate === template
                      ? "border-brand bg-brand/5 dark:bg-brand/10 text-brand ring-1 ring-brand"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "bottom-left", label: "Bottom Left" },
                { id: "bottom-center", label: "Bottom Center" },
                { id: "bottom-right", label: "Bottom Right" },
                { id: "top-left", label: "Top Left" },
                { id: "top-center", label: "Top Center" },
                { id: "top-right", label: "Top Right" },
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onChange({ pageNumberPosition: pos.id })}
                  className={`py-1.5 px-2 rounded-lg border text-center text-[10px] font-medium transition-all ${
                    values.pageNumberPosition === pos.id
                      ? "border-brand bg-brand text-white font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROTECT PDF / UNLOCK PDF */}
      {(toolId === "protect-pdf" || toolId === "unlock-pdf") && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1">
              {toolId === "protect-pdf" ? "Set Document Password" : "Enter Document Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={values.password}
                onChange={(e) => onChange({ password: e.target.value })}
                placeholder="Enter password..."
                className="w-full h-10 rounded-lg border border-border bg-background px-3 pr-10 font-mono text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {toolId === "protect-pdf"
                ? "Uses standard AES-256 encryption. Do not lose your password."
                : "Enter the password to remove encryption and restrictions."}
            </p>
          </div>
        </div>
      )}

      {/* IMAGES TO PDF */}
      {toolId === "jpg-to-pdf" && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Page Orientation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["auto", "portrait", "landscape"].map((orient) => (
                <button
                  key={orient}
                  type="button"
                  onClick={() => onChange({ imageOrientation: orient })}
                  className={`py-2 px-3 rounded-lg border capitalize font-semibold transition-all ${
                    values.imageOrientation === orient
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {orient}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Page Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "a4", label: "A4 (Standard)" },
                { id: "letter", label: "US Letter" },
                { id: "fit", label: "Fit to Image" },
              ].map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => onChange({ imagePageSize: size.id })}
                  className={`py-2 px-2 rounded-lg border font-semibold text-[11px] transition-all ${
                    values.imagePageSize === size.id
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PDF TO JPG */}
      {toolId === "pdf-to-jpg" && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Output Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["jpg", "png"].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onChange({ imageFormat: fmt as any })}
                  className={`py-2 px-3 rounded-lg border uppercase font-bold transition-all ${
                    values.imageFormat === fmt
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Image Quality / Resolution
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { dpi: 150, label: "Normal (150 DPI)" },
                { dpi: 300, label: "High (300 DPI)" },
              ].map((res) => (
                <button
                  key={res.dpi}
                  type="button"
                  onClick={() => onChange({ imageDpi: res.dpi })}
                  className={`py-2 px-3 rounded-lg border font-semibold text-[11px] transition-all ${
                    values.imageDpi === res.dpi
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROTATE PDF */}
      {toolId === "rotate-pdf" && (
        <div className="space-y-4 text-xs">
          <label className="font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
            Rotate Angle
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[90, 180, 270].map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => onChange({ rotateAngle: angle })}
                className={`py-2 px-3 rounded-lg border font-bold transition-all ${
                  values.rotateAngle === angle
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                +{angle}°
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
