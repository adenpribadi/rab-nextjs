import { Sidebar, Topbar } from "@/components/Navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-layout" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* ERP Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Sleek Topbar */}
        <Topbar />

        {/* Scrollable Content */}
        <main className="scrollable-main" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', minHeight: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
