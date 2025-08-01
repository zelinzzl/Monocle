"use client";
import { Header } from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Vision from "@/components/landing/Vision";
import Contributors from "@/components/landing/Contributors";
import Demo from "@/components/landing/Demo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <Hero title="Monocle" />
        <Vision />
        <Demo />
        <Contributors />
      </main>

      <Footer />
    </div>
  );
}
