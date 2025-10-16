"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const isLocal =
  typeof window !== "undefined" && window.location.hostname === "localhost";
const API_BASE_URL = isLocal ? "http://localhost:8080" : "";

type DashboardData = {
  turmasVigentes: number;
  alunosAtivos: number;
  alunosMatriculados: number;
  mediaAlunosPorTurma: number;
  novosAlunosUltimoAno: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dashboard`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-10 text-gray-600">Carregando...</div>;

  const pizzaData = [
    { name: "Ativos Matriculados", value: data.alunosMatriculados },
    { name: "Ativos Não Matriculados", value: data.alunosAtivos - data.alunosMatriculados },
  ];

  const COLORS = ["#4CAF50", "#FFC107"];

  return (
    <main className="min-h-screen p-10 bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">📊 Dashboard Escolar</h1>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-5 gap-6 mb-10">
        {/* Turmas Vigentes */}
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-blue-700">{data.turmasVigentes}</h2>
          <p className="text-gray-500">Turmas Vigentes</p>
        </div>

        {/* Alunos Ativos */}
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-green-700">{data.alunosAtivos}</h2>
          <p className="text-gray-500">Alunos Ativos</p>
        </div>

        {/* Matrículas Ativas */}
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-amber-600">{data.alunosMatriculados}</h2>
          <p className="text-gray-500">Matrículas Ativas</p>
        </div>

        {/* Média de Alunos por Turma */}
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-purple-600">
            {data.mediaAlunosPorTurma.toFixed(1)}
          </h2>
          <p className="text-gray-500">Média de Alunos por Turma</p>
        </div>

        {/* ✅ Novos Alunos (Último Ano) */}
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-indigo-600">{data.novosAlunosUltimoAno}</h2>
          <p className="text-gray-500">Novos Alunos (Último Ano)</p>
        </div>
      </div>

      {/* Gráfico de Pizza */}
      <div className="bg-white rounded-2xl shadow p-8 max-w-2xl">
        <h3 className="text-xl font-semibold text-blue-700 mb-4 text-center">
          Distribuição de Alunos Ativos
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pizzaData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pizzaData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
