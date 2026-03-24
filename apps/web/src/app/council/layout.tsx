export default function CouncilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-agora-bg p-2 sm:p-3 gap-2">
      {children}
    </div>
  );
}
