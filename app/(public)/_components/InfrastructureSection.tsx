"use client";

import { Globe } from "lucide-react";

export default function InfrastructureSection() {
  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <Globe className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl md:text-2xl font-semibold mb-3">
          Our own infrastructure
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          We&apos;re not another course platform wrapper. We built our own learning
          infrastructure, handle content delivery, and manage our servers
          ourselves. Better performance, lower costs.
        </p>
      </div>
    </section>
  );
}

