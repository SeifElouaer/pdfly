import React from "react";
import Link from "next/link";
import { ShieldCheck, Zap, Lock, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12 text-xs text-muted-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Trust Badges - Clean & Purposeful */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-border/60">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand/10 text-brand">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">100% Privacy & Ephemeral</h4>
              <p className="mt-0.5 text-xs">Files are processed in temporary scratch storage and automatically destroyed after download or 60 minutes.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand/10 text-brand">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">Instant Client Previews</h4>
              <p className="mt-0.5 text-xs">Page rendering and drag-and-drop reordering happen directly in your browser with zero latency.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand/10 text-brand">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">Standard AES-256 Security</h4>
              <p className="mt-0.5 text-xs">Encrypted documents are safeguarded using industry-standard cryptography.</p>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-white">
              <Send className="h-3 w-3 -rotate-45 ml-0.5" />
            </div>
            <p>© {new Date().getFullYear()} <span className="font-bold text-foreground">PDFly</span>. Crafted for speed, precision, and privacy.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">All Tools</Link>
            <Link href="/compress-pdf" className="hover:text-foreground transition-colors">Compress</Link>
            <Link href="/merge-pdf" className="hover:text-foreground transition-colors">Merge</Link>
            <Link href="/split-pdf" className="hover:text-foreground transition-colors">Split</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
