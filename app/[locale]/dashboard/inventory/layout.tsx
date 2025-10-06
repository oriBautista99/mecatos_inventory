export default function InventoryLayout({children} 
    : Readonly<{children: React.ReactNode}>) {
  return (
    <div className="flex overflow-hidden">
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}