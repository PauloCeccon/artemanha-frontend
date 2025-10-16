"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BookOpen,
  DollarSign,
  Settings,
  Building2,
  FileText,
  BarChart2, // ✅ Ícone do Dashboard
} from "lucide-react";

const menuItems = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Alunos", icon: Users, href: "/alunos" },
  { name: "Turmas", icon: Building2, href: "/turmas" },
  { name: "Matrícula", icon: FileText, href: "/matriculas" },
  { name: "Professores", icon: BookOpen, href: "/professores" },
  { name: "Dashboard", icon: BarChart2, href: "/dashboard" }, // ✅ nova posição
  { name: "Financeiro", icon: DollarSign, href: "/financeiro" },
  { name: "Configurações", icon: Settings, href: "/config" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      className="fixed left-0 top-0 h-screen bg-blue-700 text-white shadow-lg
                 transition-all duration-300 group hover:w-56 w-16 flex flex-col z-50"
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-center h-16 text-2xl font-bold border-b border-blue-500">
        <span className="hidden group-hover:block ml-3">Arte&Manha</span>
        <span className="group-hover:hidden text-xl">🎨</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-colors duration-200
                ${active ? "bg-blue-900" : "hover:bg-blue-800"}
              `}
            >
              <Icon size={20} />
              <span className="hidden group-hover:block">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <footer className="border-t border-blue-600 text-xs text-center py-3 text-blue-200">
        <span className="hidden group-hover:block">© 2025 Artemanha</span>
      </footer>
    </div>
  );
}
