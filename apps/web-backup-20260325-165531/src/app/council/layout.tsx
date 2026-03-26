import { ParticlesBackground } from "@/components/layout/ParticlesBackground";

export default function CouncilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD:apps/web/src/app/council/layout.tsx
    <div className="relative flex flex-col h-screen overflow-hidden bg-[#050505]">
      <ParticlesBackground />
      <div className="relative z-10 flex flex-col h-full">{children}</div>
=======
    <div className="flex flex-col h-screen overflow-hidden bg-agora-bg">
      {children}
>>>>>>> origin/main:apps/web-backup-20260325-165531/src/app/council/layout.tsx
    </div>
  );
}