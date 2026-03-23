export default function CouncilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-agora-bg">
      {children}
    </div>
  );
}
