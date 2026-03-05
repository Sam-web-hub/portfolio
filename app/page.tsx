"use client";

import React from "react";
import dynamic from "next/dynamic";
const Hero = dynamic(() => import("@/components/Hero"), { ssr: false });
import { FloatingNav } from "@/components/ui/FloatingNav";
import Grid from "@/components/Grid";
const RecentProjects = dynamic(() => import("@/components/RecentProjects"), {
  ssr: false,
});
import { navItems } from "@/data";
import Clients from "@/components/Clients";
import Experience from "@/components/Experience";
import Approach from "@/components/Approach";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-clip mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <FloatingNav navItems={navItems} />
        <Hero />
        <Grid />
        <RecentProjects />
        <Clients />
        <Experience />
        <Approach />
        <Footer />
      </div>
    </main>
  );
}
