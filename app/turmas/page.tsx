"use client";
import { useEffect, useState } from "react";

const isLocal =
    typeof window !== "undefined" && window.location.hostname === "localhost";
const API_BASE_URL = isLocal ? "http://localhost:8080" : "";
type Turma = {
    id?: number;
    nome: string;
    nomeResumido?: string;
    curso?: string;
    periodo?: string;
    situacao?: string;
    turno?: string;
    maximoAlunos?: number;
    inicio?: string;
    termino?: string;
    horarioInicio?: string;
    horarioFim?: string;
    ano?: string;
    professora?: string;
    auxiliar?: string;
};

export default function TurmasPage() {
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
    const [mensagem, setMensagem] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const [filtros, setFiltros] = useState({
        nome: "",
        curso: "",
        turno: "",
        situacao: "",
    });

    // Helpers de data
    const toBR = (iso?: string): string => {
        if (!iso) return "";
        if (iso.includes("/")) return iso; // já está em BR
        const [ano, mes, dia] = iso.split("-");
        if (!ano || !mes || !dia) return iso;
        return `${dia}/${mes}/${ano}`;
    };

    const toISO = (br?: string): string | undefined => {
        if (!br) return undefined;
        if (br.includes("-")) return br; // já está ISO
        const [dia, mes, ano] = br.split("/");
        if (!dia || !mes || !ano) return br;
        return `${ano}-${mes}-${dia}`;
    };

    // Máscara dd/MM/aaaa
    const handleDateMask = (v: string) => {
        let value = v.replace(/\D/g, "");
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length >= 5)
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        else if (value.length >= 3)
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        return value;
    };

    // Máscara hh:mm
    const handleHourMask = (v: string) => {
        let value = v.replace(/\D/g, ""); // remove tudo que não é número
        if (value.length > 4) value = value.slice(0, 4);

        if (value.length >= 3) {
            value = `${value.slice(0, 2)}:${value.slice(2)}`;
        }
        return value;
    };

    const formatTurmasBR = (lista: Turma[]): Turma[] =>
        lista.map((t) => ({
            ...t,
            inicio: toBR(t.inicio),
            termino: toBR(t.termino),
        }));

    // Busca inicial
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/turmas`)
            .then((res) => res.json())
            .then((data: Turma[]) => setTurmas(formatTurmasBR(data)))
            .catch(console.error);
    }, []);

    const abrirModal = (turma?: Turma) => {
        if (turma) {
            setTurmaSelecionada(turma);
            setModoEdicao(false);
        } else {
            setTurmaSelecionada({
                nome: "",
                nomeResumido: "",
                curso: "",
                periodo: "",
                situacao: "",
                turno: "",
                maximoAlunos: undefined,
                inicio: "",
                termino: "",
            });
            setModoEdicao(true);
        }
        setShowModal(true);
    };

    const recarregarLista = async () => {
        const novas = await fetch(`${API_BASE_URL}/api/turmas`).then((r) => r.json());
        setTurmas(formatTurmasBR(novas));
    };

    const [erroForm, setErroForm] = useState<string | null>(null);

    const salvarTurma = async () => {
        if (!turmaSelecionada) return;

        if (!turmaSelecionada.nome || turmaSelecionada.nome.trim() === "") {
            setErroForm("O nome da turma é obrigatório.");
            return;
        }

        setErroForm(null);


        const normStr = (v?: string | null) =>
            v === undefined || v === null ? null : v.trim() === "" ? null : v;

        type TurmaPayload = {
            id?: number;
            nome: string | null;
            nomeResumido?: string | null;
            curso?: string | null;
            periodo?: string | null;
            situacao?: string | null;
            turno?: string | null;
            maximoAlunos?: number | null;
            inicio?: string | null;
            termino?: string | null;
            horarioInicio?: string | null;
            horarioFim?: string | null;
            ano?: string | null;
            professora?: string | null;
            auxiliar?: string | null;
        };

        const payload: TurmaPayload = {
            id: turmaSelecionada.id,
            nome: normStr(turmaSelecionada.nome),
            nomeResumido: normStr(turmaSelecionada.nomeResumido),
            curso: normStr(turmaSelecionada.curso),
            periodo: normStr(turmaSelecionada.periodo),
            situacao: normStr(turmaSelecionada.situacao),
            turno: normStr(turmaSelecionada.turno),
            maximoAlunos:
                turmaSelecionada.maximoAlunos === undefined ||
                    turmaSelecionada.maximoAlunos === null ||
                    Number.isNaN(turmaSelecionada.maximoAlunos)
                    ? null
                    : Number(turmaSelecionada.maximoAlunos),
            inicio: normStr(turmaSelecionada.inicio),
            termino: normStr(turmaSelecionada.termino),

            horarioInicio: normStr(turmaSelecionada.horarioInicio),
            horarioFim: normStr(turmaSelecionada.horarioFim),
            ano: normStr(turmaSelecionada.ano),
            professora: normStr(turmaSelecionada.professora),
            auxiliar: normStr(turmaSelecionada.auxiliar),
        };

        const metodo = turmaSelecionada.id ? "PUT" : "POST";
        const url = turmaSelecionada.id
            ? `${API_BASE_URL}/api/turmas/${turmaSelecionada.id}`
            : `${API_BASE_URL}/api/turmas`;

        try {
            const resp = await fetch(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                const text = await resp.text();
                console.error("Erro salvar turma:", resp.status, text);
                throw new Error("Erro ao salvar turma");
            }

            setMensagem(
                turmaSelecionada.id
                    ? "✅ Turma atualizada com sucesso!"
                    : "🎉 Turma criada com sucesso!"
            );
            setShowModal(false);

            await recarregarLista();
            setTimeout(() => setMensagem(null), 4000);
        } catch (e) {
            console.error(e);
        }
    };

    const excluirTurma = async () => {
        if (!turmaSelecionada?.id) return;
        try {
            const resp = await fetch(
                `${API_BASE_URL}/api/turmas/${turmaSelecionada.id}`,
                { method: "DELETE" }
            );
            if (!resp.ok) throw new Error("Erro ao excluir turma");

            setMensagem("🗑️ Turma excluída com sucesso!");
            setShowConfirm(false);
            setShowModal(false);

            await recarregarLista();
            setTimeout(() => setMensagem(null), 4000);
        } catch (e) {
            console.error(e);
        }
    };

    const turmasFiltradas = turmas.filter((t) => {
        return (
            (t.nome || "").toLowerCase().includes(filtros.nome.toLowerCase()) &&
            (t.curso || "").toLowerCase().includes(filtros.curso.toLowerCase()) &&
            (filtros.turno === "" || (t.turno || "") === filtros.turno) &&
            (filtros.situacao === "" || (t.situacao || "") === filtros.situacao)
        );
    });

    return (
        <main className="p-10 font-sans min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                <header className="bg-blue-600 text-white p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-wide">🏫 Turmas</h1>
                    <button
                        onClick={() => abrirModal()}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all"
                    >
                        + Nova Turma
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
                        placeholder="Filtrar por curso"
                        className="p-2 rounded border"
                        value={filtros.curso}
                        onChange={(e) => setFiltros({ ...filtros, curso: e.target.value })}
                    />
                    <select
                        className="p-2 rounded border bg-white"
                        value={filtros.turno}
                        onChange={(e) => setFiltros({ ...filtros, turno: e.target.value })}
                    >
                        <option value="">Filtrar por turno</option>
                        <option value="Matutino">Matutino</option>
                        <option value="Vespertino">Vespertino</option>
                        <option value="Integral">Integral</option>
                    </select>
                    <select
                        className="p-2 rounded border bg-white"
                        value={filtros.situacao}
                        onChange={(e) => setFiltros({ ...filtros, situacao: e.target.value })}
                    >
                        <option value="">Filtrar por situação</option>
                        <option value="Vigente">Vigente</option>
                        <option value="Encerrada">Encerrada</option>
                        <option value="Planejada">Planejada</option>
                        <option value="Cancelada">Cancelada</option>
                    </select>
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="bg-blue-100 text-blue-800">
                                <th className="p-3 text-left text-sm font-semibold">Nome</th>
                                <th className="p-3 text-left text-sm font-semibold">Nome Resumido</th>
                                <th className="p-3 text-left text-sm font-semibold">Curso</th>
                                <th className="p-3 text-left text-sm font-semibold">Período</th>
                                <th className="p-3 text-left text-sm font-semibold">Situação</th>
                                <th className="p-3 text-left text-sm font-semibold">Turno</th>
                                <th className="p-3 text-left text-sm font-semibold">Máx. de Alunos</th>
                                <th className="p-3 text-left text-sm font-semibold">Início</th>
                                <th className="p-3 text-left text-sm font-semibold">Término</th>
                                <th className="p-3 text-center text-sm font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turmasFiltradas.map((t, i) => (
                                <tr
                                    key={t.id}
                                    className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-blue-50"
                                        } hover:bg-blue-100`}
                                >
                                    <td className="p-3">{t.nome}</td>
                                    <td className="p-3">{t.nomeResumido || "—"}</td>
                                    <td className="p-3">{t.curso || "—"}</td>
                                    <td className="p-3">{t.periodo || "—"}</td>
                                    <td className="p-3">{t.situacao || "—"}</td>
                                    <td className="p-3">{t.turno || "—"}</td>
                                    <td className="p-3">{t.maximoAlunos ?? "—"}</td>
                                    <td className="p-3">{t.inicio || "—"}</td>
                                    <td className="p-3">{t.termino || "—"}</td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => abrirModal(t)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-all"
                                        >
                                            Visualizar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {turmasFiltradas.length === 0 && (
                                <tr>
                                    <td className="p-4 text-center text-gray-500" colSpan={10}>
                                        Nenhuma turma encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal principal */}
            {showModal && turmaSelecionada && (
                <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
                    <div className="bg-white w-[1000px] rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-blue-700">🧾 Dados da Turma</h2>

                        {erroForm && (
                            <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
                                {erroForm}
                            </div>
                        )}


                        <div className="grid grid-cols-2 gap-6">
                            {(
                                [
                                    { label: "Nome", key: "nome" as const, type: "text" as const },
                                    { label: "Nome Resumido", key: "nomeResumido" as const, type: "text" as const },
                                    { label: "Curso", key: "curso" as const, type: "text" as const },
                                    { label: "Período", key: "periodo" as const, type: "text" as const },
                                    { label: "Situação", key: "situacao" as const, type: "select-situacao" as const },
                                    { label: "Turno", key: "turno" as const, type: "select-turno" as const },
                                    { label: "Máximo de alunos", key: "maximoAlunos" as const, type: "number" as const },
                                    { label: "Início", key: "inicio" as const, type: "datebr" as const },
                                    { label: "Término", key: "termino" as const, type: "datebr" as const },
                                    { label: "Horário Início", key: "horarioInicio" as const, type: "text" as const },
                                    { label: "Horário Fim", key: "horarioFim" as const, type: "text" as const },
                                    { label: "Ano", key: "ano" as const, type: "text" as const },
                                    { label: "Professora", key: "professora" as const, type: "text" as const },
                                    { label: "Auxiliar", key: "auxiliar" as const, type: "text" as const },

                                ]
                            ).map(({ label, key, type }) => {
                                const current = turmaSelecionada[key];
                                let value: string | number = "";

                                if (type === "number") {
                                    value = typeof current === "number" ? current : "";
                                } else {
                                    value = String(current ?? "");
                                }

                                return (
                                    <div key={key}>
                                        <label className="block text-sm font-medium mb-1">{label}</label>

                                        {type === "select-turno" ? (
                                            <select
                                                className="p-2 border rounded w-full bg-white"
                                                value={value}
                                                disabled={!modoEdicao}
                                                onChange={(e) => {
                                                    const updated = { ...turmaSelecionada, [key]: e.target.value } as Turma;
                                                    setTurmaSelecionada(updated);
                                                }}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="Matutino">Matutino</option>
                                                <option value="Vespertino">Vespertino</option>
                                                <option value="Integral">Integral</option>
                                            </select>
                                        ) : type === "select-situacao" ? (
                                            <select
                                                className="p-2 border rounded w-full bg-white"
                                                value={value}
                                                disabled={!modoEdicao}
                                                onChange={(e) => {
                                                    const updated = { ...turmaSelecionada, [key]: e.target.value } as Turma;
                                                    setTurmaSelecionada(updated);
                                                }}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="Vigente">Vigente</option>
                                                <option value="Encerrada">Encerrada</option>
                                                <option value="Planejada">Planejada</option>
                                                <option value="Cancelada">Cancelada</option>
                                            </select>
                                        ) : (
                                            <input
                                                type={type === "number" ? "number" : "text"}
                                                className="p-2 border rounded w-full"
                                                value={value}
                                                disabled={!modoEdicao}
                                                onChange={(e) => {
                                                    let newValue: unknown = e.target.value;

                                                    if (type === "number") {
                                                        newValue =
                                                            e.target.value === "" ? undefined : Number(e.target.value);
                                                    } else if (type === "datebr") {
                                                        newValue = handleDateMask(e.target.value);
                                                    } else if (key === "horarioInicio" || key === "horarioFim") {
                                                        newValue = handleHourMask(e.target.value);
                                                    }

                                                    const updated = { ...turmaSelecionada, [key]: newValue } as Turma;
                                                    setTurmaSelecionada(updated);
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
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

                                        <button
                                            onClick={() => setShowConfirm(true)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                                        >
                                            Excluir
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={salvarTurma}
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

            {/* Modal de confirmação */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg text-center w-96">
                        <h3 className="text-lg font-semibold mb-4">
                            Deseja realmente excluir a turma <br />
                            <span className="font-bold text-red-600">{turmaSelecionada?.nome}</span>?
                        </h3>
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={excluirTurma}
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
