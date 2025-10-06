
export default function OrdersLayout({children} 
    : Readonly<{children: React.ReactNode}>) {
  return (
    <div className="flex">
      <main className="flex-1 max-w-full overflow-x-hidden">{children}</main>
    </div>
  );
}