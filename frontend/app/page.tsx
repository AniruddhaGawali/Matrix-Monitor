"use client";

import AttackGlobe from "@/components/globle";
import Iplist from "@/components/ipList";
import IPDetail from "@/components/ipDetail";
import { withAttackData } from "@/components/globle/withAttackData";
import Navbar from "@/components/navbar";
import { memo, Suspense } from "react";

const GlobeWithData = memo(withAttackData(AttackGlobe));

export default function MatrixMonitor() {
  return (
    <main className="w-full min-h-screen bg-background relative">
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Navbar />
        <GlobeWithData />
        <Iplist />
        <IPDetail />
      </Suspense>
    </main>
  );
}
