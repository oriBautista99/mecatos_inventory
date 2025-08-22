export default function InventoryLayout({children} 
    : Readonly<{children: React.ReactNode}>) {
  return (
    <div className="flex">
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}