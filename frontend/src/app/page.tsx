"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/Landing/Header";
import Footer from "@/components/Landing/Footer";
import Hero from "@/components/Landing/Hero";
import Vision from "@/components/Landing/Vision";
import Contributors from "@/components/Landing/Contributors";
import Demo from "@/components/Landing/Demo";
import AuthMenu from "@/components/Landing/AuthMenu";
import { Icon } from "@/components/UI/icons/Icon";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     router.push("/dashboard");
  //   }
  // }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <Hero title="Monocle" />
        <Vision />
        <Contributors />
        <Demo />
      </main>

      <AuthMenu />
      <Footer />
    </div>
  );
}
