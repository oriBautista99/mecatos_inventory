
export default function ReportsLayout({children} 
    : Readonly<{children: React.ReactNode}>) {
  return (
    <div className="flex">
      <main className="flex-1">{children}</main>
    </div>
  );
}