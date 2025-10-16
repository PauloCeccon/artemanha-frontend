"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

const isLocal =
  typeof window !== "undefined" && window.location.hostname === "localhost";
const API_BASE_URL = isLocal
  ? "http://localhost:8080"
  : "https://artemanha-backend.onrender.com";

/** Tipos base vindos do backend */
type Situacao = { id: number; descricao: string };
type Aluno = { id: number; nome: string; matricula?: number | null };
type Turma = { id: number; nome: string; maximoAlunos?: number | null };

/** Como o backend entrega (ISO em string ou null) */
type MatriculaApi = {
  id: number;
  aluno: Aluno | null;
  turma: Turma | null;
  situacao: Situacao | null;
  dataMatricula?: string | null;
  inicio?: string | null;
  termino?: string | null;
  observacoes?: string | null;
};

/** Como a UI usa (datas em dd/MM/aaaa) */
type Matricula = {
  id?: number;
  aluno: Aluno | null;
  turma: Turma | null;
  situacao: Situacao | null;
  dataMatricula?: string; // dd/MM/aaaa
  inicio?: string;        // dd/MM/aaaa
  termino?: string;       // dd/MM/aaaa
  observacoes?: string | null;
};

export default function MatriculasPage() {
  // Dados
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [situacoes, setSituacoes] = useState<Situacao[]>([]);

  // UI
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [sel, setSel] = useState<Matricula | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [filtros, setFiltros] = useState({
    aluno: "",
    turma: "",
    situacao: "",
  });

  /* ================= Helpers de datas ================= */
  const maskDate = (v: string) => {
    let value = v.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length >= 5) return `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    if (value.length >= 3) return `${value.slice(0, 2)}/${value.slice(2)}`;
    return value;
  };

  const toISO = (br?: string) => {
    if (!br) return undefined;
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br);
    if (!m) return undefined;
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  };

  const fromISO = (iso?: string | null) => {
    if (!iso) return "";
    if (iso.includes("/")) return iso;
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  };

  const isValidBRDate = (br?: string) => {
    if (!br) return false;
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br);
    if (!m) return false;
    const [, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return (
      d.getFullYear() === Number(yyyy) &&
      d.getMonth() === Number(mm) - 1 &&
      d.getDate() === Number(dd)
    );
  };

  /* ================= Fetch helper tipado ================= */
  const fetchJson = async <T,>(url: string): Promise<T> => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status} ao buscar ${url}`);
    return (await r.json()) as T;
  };

  /* ================= Map API -> UI ================= */
  const mapApiToUi = (m: MatriculaApi): Matricula => ({
    id: m.id,
    aluno: m.aluno,
    turma: m.turma,
    situacao: m.situacao,
    dataMatricula: fromISO(m.dataMatricula ?? undefined),
    inicio: fromISO(m.inicio ?? undefined),
    termino: fromISO(m.termino ?? undefined),
    observacoes: m.observacoes ?? "",
  });

  /* ================= Carregamentos ================= */
  const loadMatriculas = useCallback(async () => {
    const list = await fetchJson<MatriculaApi[]>(`${API_BASE_URL}/api/matriculas`);
    setMatriculas(list.map(mapApiToUi));
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [mats, als, trs, sits] = await Promise.all([
        fetchJson<MatriculaApi[]>(`${API_BASE_URL}/api/matriculas`),
        fetchJson<Aluno[]>(`${API_BASE_URL}/api/alunos`),
        fetchJson<Turma[]>(`${API_BASE_URL}/api/turmas`),
        fetchJson<Situacao[]>(`${API_BASE_URL}/api/matricula-situacoes`),
      ]);
      setMatriculas(mats.map(mapApiToUi));
      setAlunos(als);
      setTurmas(trs);
      setSituacoes(Array.isArray(sits) ? sits : []);
    } catch (e) {
      console.error("Falha ao carregar dados:", e);
      setSituacoes([]);
    }
  }, []);

  useEffect(() => {
    loadAll().catch(console.error);
  }, [loadAll]);

  /* ================= Ordenações / dropdowns ================= */

  // Função genérica pra ordenar por nome (ignora acentos e maiúsculas/minúsculas)
  const sortByNome = useCallback(
    <T extends { nome: string }>(arr: T[]) =>
      [...arr].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
      ),
    []
  );

  // Alunos para o dropdown:
  // - Só quem NÃO tem aluno.matricula (null, undefined ou string vazia)
  // - MAS se estiver editando, manter o aluno já selecionado na lista
  // - Ordenados por nome
  const alunosDropdown = useMemo(() => {
    const selectedId = sel?.aluno?.id;
const base = alunos.filter(
  (a) =>
    a.matricula == null || // sem matrícula (null ou undefined)
    (selectedId != null && a.id === selectedId) // mantém selecionado
);
    return sortByNome(base);
  }, [alunos, sel?.aluno?.id, sortByNome]);

  // Turmas ordenadas (só por consistência visual)
  const turmasDropdown = useMemo(() => sortByNome(turmas), [turmas, sortByNome]);

  // Situações ordenadas alfabeticamente
  const situacoesDropdown = useMemo(
    () =>
      [...situacoes].sort((a, b) =>
        a.descricao.localeCompare(b.descricao, "pt-BR", { sensitivity: "base" })
      ),
    [situacoes]
  );

  /* ================= Filtro tabela ================= */
  const matriculasFiltradas = useMemo(() => {
    const fAluno = filtros.aluno.toLowerCase();
    const fTurma = filtros.turma.toLowerCase();
    const fSit = filtros.situacao.toLowerCase();
    return matriculas.filter((m) => {
      const nAluno = m.aluno?.nome?.toLowerCase() ?? "";
      const nTurma = m.turma?.nome?.toLowerCase() ?? "";
      const nSit = m.situacao?.descricao?.toLowerCase() ?? "";
      return (
        nAluno.includes(fAluno) &&
        nTurma.includes(fTurma) &&
        (fSit === "" || nSit === fSit)
      );
    });
  }, [matriculas, filtros]);

  /* ================= Modal ================= */
  const abrirModal = (m?: Matricula) => {
    if (m) {
      setSel({ ...m });
      setModoEdicao(false);
    } else {
      const sitAtiva =
        situacoes.find((s) => s.descricao.toLowerCase() === "ativa") || null;
      setSel({
        aluno: null,
        turma: null,
        situacao: sitAtiva,
        dataMatricula: "",
        inicio: "",
        termino: "",
        observacoes: "",
      });
      setModoEdicao(true);
    }
    setErroForm(null);
    setShowModal(true);
  };

  /* ================= Validação cliente ================= */
  const validar = (m: Matricula): string | null => {
    if (!m.aluno?.id) return "Selecione o aluno.";
    if (!m.turma?.id) return "Selecione a turma.";
    if (!m.dataMatricula || !isValidBRDate(m.dataMatricula)) {
      return "Informe uma Data da matrícula válida (dd/mm/aaaa).";
    }
    if (!m.inicio || !isValidBRDate(m.inicio)) {
      return "Informe uma data de Início válida (dd/mm/aaaa).";
    }
    if (!m.termino || !isValidBRDate(m.termino)) {
      return "Informe uma data de Término válida (dd/mm/aaaa).";
    }
    return null;
  };

  /* ================= Salvar ================= */
  const salvar = async () => {
    if (!sel) return;
    const msg = validar(sel);
    if (msg) {
      setErroForm(msg);
      return;
    }

    const payload = {
      aluno: sel.aluno ? { id: sel.aluno.id } : null,
      turma: sel.turma ? { id: sel.turma.id } : null,
      situacao: sel.situacao ? { id: sel.situacao.id } : null,
      dataMatricula: toISO(sel.dataMatricula),
      inicio: toISO(sel.inicio),
      termino: toISO(sel.termino),
      observacoes: sel.observacoes ?? "",
    };

    const metodo = sel.id ? "PUT" : "POST";
    const url = sel.id
      ? `${API_BASE_URL}/api/matriculas/${sel.id}`
      : `${API_BASE_URL}/api/matriculas`;

    try {
      const resp = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.error("Erro salvar:", resp.status, txt);
        if (resp.status === 409) setErroForm("Aluno já possui matrícula ATIVA nesta turma.");
        else if (resp.status === 422) setErroForm("Turma sem vagas.");
        else setErroForm("Erro ao salvar matrícula.");
        return;
      }

      setMensagem(sel.id ? "✅ Matrícula atualizada!" : "🎉 Matrícula criada!");
      setShowModal(false);
      await loadMatriculas();
      setTimeout(() => setMensagem(null), 4000);
    } catch (e) {
      console.error(e);
      setErroForm("Erro inesperado ao salvar.");
    }
  };

  /* ================= Excluir ================= */
  const excluir = async () => {
    if (!sel?.id) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/matriculas/${sel.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        setErroForm("Erro ao excluir matrícula.");
        return;
      }
      setShowConfirm(false);
      setShowModal(false);
      setMensagem("🗑️ Matrícula excluída.");
      await loadMatriculas();
      setTimeout(() => setMensagem(null), 4000);
    } catch (e) {
      console.error(e);
      setErroForm("Erro inesperado ao excluir.");
    }
  };

  return (
    <main className="p-10 font-sans min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <header className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">📑 Matrículas</h1>
          <button
            onClick={() => abrirModal()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all"
          >
            + Matricular Aluno
          </button>
        </header>

        {mensagem && (
          <div className="text-center bg-green-100 text-green-700 py-2 font-medium">
            {mensagem}
          </div>
        )}

        {/* Filtros */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 border-b">
          <input
            placeholder="Filtrar por aluno"
            className="p-2 rounded border"
            value={filtros.aluno}
            onChange={(e) => setFiltros({ ...filtros, aluno: e.target.value })}
          />
          <input
            placeholder="Filtrar por turma"
            className="p-2 rounded border"
            value={filtros.turma}
            onChange={(e) => setFiltros({ ...filtros, turma: e.target.value })}
          />
          <select
            className="p-2 rounded border"
            value={filtros.situacao}
            onChange={(e) => setFiltros({ ...filtros, situacao: e.target.value })}
          >
            <option value="">Todas as Situações</option>
            {situacoesDropdown.map((s) => (
              <option key={s.id} value={s.descricao.toLowerCase()}>
                {s.descricao}
              </option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="p-3 text-left text-sm font-semibold">Id</th>
                <th className="p-3 text-left text-sm font-semibold">Aluno</th>
                <th className="p-3 text-left text-sm font-semibold">Turma</th>
                <th className="p-3 text-left text-sm font-semibold">Situação</th>
                <th className="p-3 text-left text-sm font-semibold">Data da matrícula</th>
                <th className="p-3 text-left text-sm font-semibold">Início</th>
                <th className="p-3 text-left text-sm font-semibold">Término</th>
                <th className="p-3 text-center text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {matriculasFiltradas.map((m, i) => (
                <tr
                  key={m.id}
                  className={`transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-blue-50"
                  } hover:bg-blue-100`}
                >
                  <td className="p-3">{m.id}</td>
                  <td className="p-3">{m.aluno?.nome}</td>
                  <td className="p-3">{m.turma?.nome}</td>
                  <td className="p-3">{m.situacao?.descricao}</td>
                  <td className="p-3">{m.dataMatricula || "—"}</td>
                  <td className="p-3">{m.inicio || "—"}</td>
                  <td className="p-3">{m.termino || "—"}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => abrirModal(m)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-all"
                    >
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))}
              {matriculasFiltradas.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={8}>
                    Nenhuma matrícula encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal principal */}
      {showModal && sel && (
        <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300 z-50">
          <div className="bg-white w-[1000px] rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">🧾 Dados da Matrícula</h2>

            {erroForm && (
              <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
                {erroForm}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Aluno */}
              <div>
                <label className="block text-sm font-medium mb-1">Aluno</label>
                <select
                  className="p-2 border rounded w-full"
                  value={sel.aluno?.id ?? ""}
                  disabled={!modoEdicao}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const a = alunos.find((x) => x.id === id) || null;
                    setSel({ ...sel, aluno: a });
                  }}
                >
                  <option value="">Selecione</option>
                  {alunosDropdown.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Turma */}
              <div>
                <label className="block text-sm font-medium mb-1">Turma</label>
                <select
                  className="p-2 border rounded w-full"
                  value={sel.turma?.id ?? ""}
                  disabled={!modoEdicao}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const t = turmas.find((x) => x.id === id) || null;
                    setSel({ ...sel, turma: t });
                  }}
                >
                  <option value="">Selecione</option>
                  {turmasDropdown.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Situação */}
              <div>
                <label className="block text-sm font-medium mb-1">Situação</label>
                <select
                  className="p-2 border rounded w-full"
                  value={sel.situacao?.id ?? ""}
                  disabled={!modoEdicao}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const s = situacoes.find((x) => x.id === id) || null;
                    setSel({ ...sel, situacao: s });
                  }}
                >
                  <option value="">Selecione</option>
                  {situacoesDropdown.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.descricao}
                    </option>
                  ))}
                </select>
              </div>

              {/* Datas */}
              <div>
                <label className="block text-sm font-medium mb-1">Data da matrícula</label>
                <input
                  className="p-2 border rounded w-full"
                  value={sel.dataMatricula || ""}
                  disabled={!modoEdicao}
                  onChange={(e) => setSel({ ...sel, dataMatricula: maskDate(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Início</label>
                <input
                  className="p-2 border rounded w-full"
                  value={sel.inicio || ""}
                  disabled={!modoEdicao}
                  onChange={(e) => setSel({ ...sel, inicio: maskDate(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Término</label>
                <input
                  className="p-2 border rounded w-full"
                  value={sel.termino || ""}
                  disabled={!modoEdicao}
                  onChange={(e) => setSel({ ...sel, termino: maskDate(e.target.value) })}
                />
              </div>

              {/* Observações */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea
                  className="p-2 border rounded w-full min-h-24"
                  value={sel.observacoes ?? ""}
                  disabled={!modoEdicao}
                  onChange={(e) => setSel({ ...sel, observacoes: e.target.value })}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-between mt-8">
              <div className="flex gap-3">
                {!modoEdicao ? (
                  <>
                    <button
                      onClick={() => setModoEdicao(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                      Editar
                    </button>
                    {sel.id && (
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                      >
                        Excluir
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={salvar}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Salvar
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {showConfirm && sel && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center w-96">
            <h3 className="text-lg font-semibold mb-4">
              Excluir matrícula de <br />
              <span className="font-bold text-red-600">{sel.aluno?.nome}</span> na turma{" "}
              <span className="font-bold text-red-600">{sel.turma?.nome}</span>?
            </h3>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={excluir}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Sim, excluir
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
