import "./globals.css";
import Sidebar from "./components/sidebar";

export const metadata = {
  title: "Artemanha",
  description: "Sistema escolar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      style={{ colorScheme: "light" }} // força esquema claro (evita auto-dark do navegador)
    >
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
      </head>

      {/* nada de 'group' aqui; deixa o hover restrito ao sidebar via 'peer' */}
      <body className="antialiased text-[#171717] bg-gray-50 min-h-screen">
        <div className="flex min-h-screen">
          {/* wrapper do sidebar marcado como 'peer' */}
          <div className="peer">
            <Sidebar />
          </div>

          {/* o main só desloca quando o peer (sidebar) está em hover */}
          <main className="ml-16 transition-all duration-300 flex-1 peer-hover:ml-56">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
