"use client";

import { useEffect, useState } from "react";

const API_BASE_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "";

type Status = {
  id: number;
  descricao: string;
};

type Aluno = {
  id?: number;
  nome: string;
  dataNascimento?: string;
  responsavelPedagogico?: string;
  parentesco?: string;
  emailResponsavel?: string;
  telefone1?: string;
  telefone2?: string;
  status?: Status;
  dataCriacao?: string;
  // Campos vindos da turma
  turma?: string;
  matricula?: string;
  professora?: string;
  auxiliar?: string;
  horarioInicio?: string;
  horarioFim?: string;
  periodo?: string;
  ano?: string;
};

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erroNome, setErroNome] = useState(false);

  const [filtros, setFiltros] = useState({
    nome: "",
    turma: "",
    matricula: "",
    status: "",
  });

  // Busca inicial
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/alunos`)
      .then((res) => res.json())
      .then((data) => {
        const formatados = data.map((a: Aluno) => {
          if (a.dataNascimento && a.dataNascimento.includes("-")) {
            const [ano, mes, dia] = a.dataNascimento.split("-");
            a.dataNascimento = `${dia}/${mes}/${ano}`;
          }
          return a;
        });
        setAlunos(formatados);
      })
      .catch(console.error);

    fetch(`${API_BASE_URL}/api/status`)
      .then((res) => res.json())
      .then(setStatusList)
      .catch(console.error);
  }, []);

  const abrirModal = (aluno?: Aluno) => {
    if (aluno) {
      setAlunoSelecionado(aluno);
      setModoEdicao(false);
    } else {
      setAlunoSelecionado({
        nome: "",
      });
      setModoEdicao(true);
    }
    setShowModal(true);
  };

  const salvarAluno = async () => {
    if (!alunoSelecionado) return;

    const alunoParaSalvar = { ...alunoSelecionado };

    delete alunoParaSalvar.turma;
    delete alunoParaSalvar.matricula;

    if (alunoParaSalvar.dataNascimento?.includes("/")) {
      const [dia, mes, ano] = alunoParaSalvar.dataNascimento.split("/");
      alunoParaSalvar.dataNascimento = `${ano}-${mes}-${dia}`;
    }

    const metodo = alunoSelecionado.id ? "PUT" : "POST";
    const url = alunoSelecionado.id
      ? `${API_BASE_URL}/api/alunos/${alunoSelecionado.id}`
      : `${API_BASE_URL}/api/alunos`;

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alunoParaSalvar),
      });

      if (!response.ok) throw new Error("Erro ao salvar aluno");

      setMensagem(
        alunoSelecionado.id
          ? "✅ Aluno atualizado com sucesso!"
          : "🎉 Aluno cadastrado com sucesso!"
      );
      setShowModal(false);

      const novos = await fetch(`${API_BASE_URL}/api/alunos`).then((r) =>
        r.json()
      );
      const formatados = novos.map((a: Aluno) => {
        if (a.dataNascimento && a.dataNascimento.includes("-")) {
          const [ano, mes, dia] = a.dataNascimento.split("-");
          a.dataNascimento = `${dia}/${mes}/${ano}`;
        }
        return a;
      });
      setAlunos(formatados);
      setTimeout(() => setMensagem(null), 4000);
    } catch (err) {
      console.error(err);
      setMensagem("❌ Erro ao salvar aluno");
      setTimeout(() => setMensagem(null), 4000);
    }
  };

  // Filtros continuam funcionando (turma e matrícula só para exibir)
  const alunosFiltrados = alunos.filter((a) => {
    const nome = a.nome?.toLowerCase() || "";
    const turma = a.turma?.toLowerCase() || "";
    const matricula = a.matricula?.toLowerCase() || "";
    const statusDescricao = a.status?.descricao?.toLowerCase() || "";
    const filtroStatus = filtros.status?.toLowerCase() || "";

    return (
      nome.includes(filtros.nome.toLowerCase()) &&
      turma.includes(filtros.turma.toLowerCase()) &&
      matricula.includes(filtros.matricula.toLowerCase()) &&
      (filtroStatus === "" || statusDescricao === filtroStatus)
    );
  });

  return (
    <main className="p-10 font-sans min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <header className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">📚 Lista de Alunos</h1>
          <button
            onClick={() => abrirModal()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all"
          >
            + Cadastrar Aluno
          </button>
        </header>

        {mensagem && (
          <div className="text-center bg-green-100 text-green-700 py-2 font-medium">
            {mensagem}
          </div>
        )}

        {/* Filtros */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-blue-50 border-b">
          <input
            placeholder="Filtrar por nome"
            className="p-2 rounded border"
            value={filtros.nome}
            onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
          />
          <input
            placeholder="Filtrar por turma"
            className="p-2 rounded border"
            value={filtros.turma}
            onChange={(e) => setFiltros({ ...filtros, turma: e.target.value })}
          />
          <input
            placeholder="Filtrar por matrícula"
            className="p-2 rounded border"
            value={filtros.matricula}
            onChange={(e) =>
              setFiltros({ ...filtros, matricula: e.target.value })
            }
          />
          <select
            className="p-2 rounded border"
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
          >
            <option value="">Todos os Status</option>
            {statusList.map((s) => (
              <option key={s.id} value={s.descricao}>
                {s.descricao}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="p-4 text-left text-sm font-semibold">ID</th>
                <th className="p-4 text-left text-sm font-semibold">Nome</th>
                <th className="p-4 text-left text-sm font-semibold">Turma</th>
                <th className="p-4 text-left text-sm font-semibold">
                  Responsável
                </th>
                <th className="p-4 text-left text-sm font-semibold">Matrícula</th>
                <th className="p-4 text-left text-sm font-semibold">Status</th>
                <th className="p-4 text-center text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunosFiltrados.map((a, i) => (
                <tr
                  key={a.id}
                  className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-blue-50"
                    } hover:bg-blue-100`}
                >
                  <td className="p-4">{a.id}</td>
                  <td className="p-4">{a.nome}</td>
                  <td className="p-4">{a.turma}</td>
                  <td className="p-4">{a.responsavelPedagogico}</td>
                  <td className="p-4">{a.matricula}</td>
                  <td className="p-4">{a.status?.descricao || "—"}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => abrirModal(a)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-all"
                    >
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && alunoSelecionado && (
        <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
          <div className="bg-white w-[900px] rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">
              🧾 Dados do Aluno
            </h2>

            <div className="grid grid-cols-3 gap-8">
              {/* Foto */}
              <div className="col-span-1 flex flex-col items-center">
                <div className="w-40 h-40 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-gray-500">
                  Foto
                </div>

                <h3 className="font-semibold text-lg">
                  {alunoSelecionado.nome}
                </h3>
                <p className="text-gray-600">
                  {alunoSelecionado.dataNascimento ? (
                    (() => {
                      const data = alunoSelecionado.dataNascimento;
                      const [dia, mes, ano] = data.split("/");
                      const nascimento = new Date(+ano, +mes - 1, +dia);
                      const hoje = new Date();
                      let anos = hoje.getFullYear() - nascimento.getFullYear();
                      let meses = hoje.getMonth() - nascimento.getMonth();
                      if (meses < 0) {
                        anos--;
                        meses += 12;
                      }
                      return `${anos} ano${anos !== 1 ? "s" : ""
                        } e ${meses} mês${meses !== 1 ? "es" : ""}`;
                    })()
                  ) : (
                    "Idade não informada"
                  )}
                </p>
              </div>

              {/* Campos */}
              <div className="col-span-2 space-y-6">
                {/* Informações do aluno */}
                <section>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">
                    Informações do Aluno
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nome
                      </label>
                      <input
                        className="p-2 border rounded w-full"
                        value={alunoSelecionado.nome || ""}
                        disabled={!modoEdicao}
                        onChange={(e) =>
                          setAlunoSelecionado({
                            ...alunoSelecionado,
                            nome: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Data de nascimento
                      </label>
                      <input
                        className="p-2 border rounded w-full"
                        value={alunoSelecionado.dataNascimento || ""}
                        disabled={!modoEdicao}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length > 8) value = value.slice(0, 8);
                          if (value.length >= 5)
                            value = `${value.slice(0, 2)}/${value.slice(
                              2,
                              4
                            )}/${value.slice(4)}`;
                          else if (value.length >= 3)
                            value = `${value.slice(0, 2)}/${value.slice(2)}`;
                          setAlunoSelecionado({
                            ...alunoSelecionado,
                            dataNascimento: value,
                          });
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Matrícula
                      </label>
                      <input
                        className="p-2 border rounded w-full"
                        value={alunoSelecionado.matricula || ""}
                        disabled={!modoEdicao}
                        onChange={(e) =>
                          setAlunoSelecionado({
                            ...alunoSelecionado,
                            matricula: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        className="p-2 border rounded w-full"
                        value={alunoSelecionado.status?.id || ""}
                        disabled={!modoEdicao}
                        onChange={(e) => {
                          const selected = statusList.find(
                            (s) => s.id === Number(e.target.value)
                          );
                          setAlunoSelecionado({
                            ...alunoSelecionado,
                            status: selected,
                          });
                        }}
                      >
                        <option value="">Selecione o status</option>
                        {statusList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.descricao}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* Acadêmico */}
                <section>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">
                    Acadêmico
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { key: "turma", label: "Turma" },
                        { key: "periodo", label: "Período" },
                        { key: "ano", label: "Ano" },
                        { key: "horarioInicio", label: "Horário Início" },
                        { key: "horarioFim", label: "Horário Fim" },
                        { key: "professora", label: "Professora" },
                        { key: "auxiliar", label: "Auxiliar" },
                      ] as { key: keyof Aluno; label: string }[]
                    ).map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-1">
                          {label}
                        </label>
                        <input
                          className="p-2 border rounded w-full"
                          value={
                            typeof alunoSelecionado[key] === "string" ||
                              typeof alunoSelecionado[key] === "number"
                              ? (alunoSelecionado[key] as string | number)
                              : ""
                          }
                          disabled={!modoEdicao}
                          onChange={(e) =>
                            setAlunoSelecionado({
                              ...alunoSelecionado,
                              [key]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Responsável */}
                <section>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">
                    Responsável Pedagógico
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { key: "responsavelPedagogico", label: "Nome" },
                        { key: "parentesco", label: "Parentesco" },
                        { key: "emailResponsavel", label: "E-mail" },
                        { key: "telefone1", label: "Telefone 1" },
                        { key: "telefone2", label: "Telefone 2" },
                      ] as { key: keyof Aluno; label: string }[]
                    ).map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-1">
                          {label}
                        </label>
                        <input
                          className="p-2 border rounded w-full"
                          value={
                            typeof alunoSelecionado[key] === "string" ||
                              typeof alunoSelecionado[key] === "number"
                              ? (alunoSelecionado[key] as string | number)
                              : ""
                          }
                          disabled={!modoEdicao}
                          onChange={(e) =>
                            setAlunoSelecionado({
                              ...alunoSelecionado,
                              [key]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Botões */}
                <div className="flex justify-between mt-6">
                  {!modoEdicao ? (
                    <button
                      onClick={() => setModoEdicao(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                      Editar
                    </button>
                  ) : (
                    <button
                      onClick={salvarAluno}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      Salvar
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
