import { ParticlesBackground } from "@/components/layout/ParticlesBackground";

export default function CouncilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-[#050505]">
      <ParticlesBackground />
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  );
}