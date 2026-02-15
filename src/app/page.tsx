"use client";

import { useMemo, useState } from "react";

type Status = "todo" | "doing" | "done";

type KanbanTask = {
  id: string;
  title: string;
  status: Status;
  estimateHours?: number;
  dependsOn?: string[];
  acceptance?: string[];
};

type KanbanDoc = {
  title: string;
  createdAt: string;
  input: {
    goal: string;
    constraints: string;
    duration: string;
    team: string;
  };
  columns: { key: Status; title: string }[];
  tasks: KanbanTask[];
};

function uid(prefix: string, i: number) {
  return `${prefix}-${String(i + 1).padStart(2, "0")}`;
}

function generateKanban(input: {
  goal: string;
  constraints: string;
  duration: string;
  team: string;
}): KanbanDoc {
  const now = new Date().toISOString();
  const title = input.goal.trim() ? `PRD → Kanban: ${input.goal.trim()}` : "PRD → Kanban";

  // Simple, deterministic skeleton (no LLM). Good enough for a demo.
  const raw: Omit<KanbanTask, "id">[] = [
    {
      title: "PRD/要件を1枚にまとめる（目的・対象・非目的）",
      status: "todo",
      estimateHours: 1,
      acceptance: ["目的/対象/非目的が文章で明確"],
    },
    {
      title: "ユーザーフロー/画面一覧を決める",
      status: "todo",
      estimateHours: 1,
      acceptance: ["最小画面で動線が成立"],
    },
    {
      title: "技術スタック/デプロイ先を決定",
      status: "todo",
      estimateHours: 0.5,
      acceptance: ["READMEに起動手順が書ける"],
    },
    {
      title: "リポジトリ作成＋初期セットアップ（lint/format含む）",
      status: "todo",
      estimateHours: 0.5,
      acceptance: ["CIが通る"],
    },
    {
      title: "コア機能のAPI/データモデルを定義",
      status: "todo",
      estimateHours: 1,
      acceptance: ["主要エンティティとCRUDが定義済み"],
    },
    {
      title: "コアUI実装（最小で動く）",
      status: "todo",
      estimateHours: 2,
      acceptance: ["ハッピーパスが一通り動く"],
    },
    {
      title: "エラーハンドリング/ローディング/空状態を追加",
      status: "todo",
      estimateHours: 1,
      acceptance: ["空/失敗時に崩れない"],
    },
    {
      title: "簡易テスト or 手動テスト項目をREADMEに記載",
      status: "todo",
      estimateHours: 0.5,
      acceptance: ["確認観点が5〜10個ある"],
    },
    {
      title: "デプロイ（Vercel等）＋環境変数設定",
      status: "todo",
      estimateHours: 0.5,
      acceptance: ["URLで誰でも触れる"],
    },
    {
      title: "デモ用サンプルデータ/デモ手順を用意",
      status: "todo",
      estimateHours: 0.5,
      acceptance: ["30秒で価値が伝わる"],
    },
    {
      title: "README整備（概要/使い方/デモ/構成）",
      status: "todo",
      estimateHours: 0.5,
      acceptance: ["初見で動かせる"],
    },
  ];

  // Add tiny custom tasks based on input.
  const extras: Omit<KanbanTask, "id">[] = [];
  if (input.constraints.trim()) {
    extras.push({
      title: `制約の反映チェック（${input.constraints.trim().slice(0, 60)}${
        input.constraints.trim().length > 60 ? "…" : ""
      }）`,
      status: "todo",
      estimateHours: 0.5,
      acceptance: ["制約が破られていない"],
    });
  }
  if (input.duration.trim()) {
    extras.push({
      title: `スケジュール調整（期間: ${input.duration.trim()}）`,
      status: "todo",
      estimateHours: 0.25,
      acceptance: ["期限に収まる粒度に分割"],
    });
  }
  if (input.team.trim()) {
    extras.push({
      title: `役割分担（チーム: ${input.team.trim()}）`,
      status: "todo",
      estimateHours: 0.25,
      acceptance: ["担当/レビュー/運用が明確"],
    });
  }

  const tasks: KanbanTask[] = [...raw, ...extras].map((t, i) => ({
    id: uid("T", i),
    ...t,
  }));

  // simple deps example
  const id = (n: number) => tasks[n]?.id;
  if (id(0) && id(1)) tasks[1].dependsOn = [id(0)!];
  if (id(3) && id(5)) tasks[5].dependsOn = [id(3)!];
  if (id(5) && id(8)) tasks[8].dependsOn = [id(5)!];

  return {
    title,
    createdAt: now,
    input,
    columns: [
      { key: "todo", title: "Todo" },
      { key: "doing", title: "Doing" },
      { key: "done", title: "Done" },
    ],
    tasks,
  };
}

function toMarkdown(doc: KanbanDoc) {
  const byStatus: Record<Status, KanbanTask[]> = { todo: [], doing: [], done: [] };
  for (const t of doc.tasks) byStatus[t.status].push(t);

  const fmtTask = (t: KanbanTask) => {
    const bits: string[] = [];
    if (typeof t.estimateHours === "number") bits.push(`⏱ ${t.estimateHours}h`);
    if (t.dependsOn?.length) bits.push(`🔗 depends: ${t.dependsOn.join(", ")}`);
    const meta = bits.length ? ` (${bits.join(" | ")})` : "";

    const acc = t.acceptance?.length
      ? `\n  - Acceptance:\n${t.acceptance.map((a) => `    - ${a}`).join("\n")}`
      : "";
    return `- [ ] **${t.id}** ${t.title}${meta}${acc}`;
  };

  return [
    `# ${doc.title}`,
    "",
    `Generated: ${doc.createdAt}`,
    "",
    "## Input",
    `- Goal: ${doc.input.goal || "(empty)"}`,
    `- Constraints: ${doc.input.constraints || "(empty)"}`,
    `- Duration: ${doc.input.duration || "(empty)"}`,
    `- Team: ${doc.input.team || "(empty)"}`,
    "",
    "## Kanban",
    "",
    "### Todo",
    ...byStatus.todo.map(fmtTask),
    "",
    "### Doing",
    ...byStatus.doing.map(fmtTask),
    "",
    "### Done",
    ...byStatus.done.map(fmtTask),
    "",
  ].join("\n");
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function Home() {
  const [goal, setGoal] = useState("");
  const [constraints, setConstraints] = useState("");
  const [duration, setDuration] = useState("");
  const [team, setTeam] = useState("");
  const [copied, setCopied] = useState<null | "md" | "json">(null);

  const doc = useMemo(() => generateKanban({ goal, constraints, duration, team }), [
    goal,
    constraints,
    duration,
    team,
  ]);
  const md = useMemo(() => toMarkdown(doc), [doc]);
  const json = useMemo(() => JSON.stringify(doc, null, 2), [doc]);

  const todoCount = doc.tasks.filter((t) => t.status === "todo").length;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">PRD → Kanban Generator</h1>
          <p className="mt-2 text-sm text-zinc-600">
            今夜用の“骨格”版。PRDっぽい入力から、Todo/Doing/Done のタスク雛形を生成します（LLMなし）。
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">Input</h2>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-medium text-zinc-700">Goal</span>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="例: Second Brainのタスクをカンバンで見える化したい"
                  className="h-10 rounded-md border px-3 text-sm"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-zinc-700">Constraints</span>
                <input
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="例: 1日でデモ、DB変更なし、モバイル対応"
                  className="h-10 rounded-md border px-3 text-sm"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-zinc-700">Duration</span>
                  <input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="例: 今日〜明日朝"
                    className="h-10 rounded-md border px-3 text-sm"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-zinc-700">Team</span>
                  <input
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    placeholder="例: 青=実装, 白=レビュー"
                    className="h-10 rounded-md border px-3 text-sm"
                  />
                </label>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                <span className="rounded-full bg-zinc-100 px-2 py-1">Todo tasks: {todoCount}</span>
                <span className="rounded-full bg-zinc-100 px-2 py-1">No LLM required</span>
                <span className="rounded-full bg-zinc-100 px-2 py-1">Copy as Markdown/JSON</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Output</h2>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const ok = await copy(md);
                    setCopied(ok ? "md" : null);
                    setTimeout(() => setCopied(null), 1500);
                  }}
                  className="rounded-md border bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                >
                  Copy Markdown
                </button>
                <button
                  onClick={async () => {
                    const ok = await copy(json);
                    setCopied(ok ? "json" : null);
                    setTimeout(() => setCopied(null), 1500);
                  }}
                  className="rounded-md border bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                >
                  Copy JSON
                </button>
              </div>
            </div>
            {copied && (
              <p className="mt-2 text-xs text-emerald-700">Copied {copied.toUpperCase()}!</p>
            )}

            <div className="mt-4 grid gap-3">
              <div className="rounded-lg border bg-zinc-50 p-3">
                <p className="text-xs font-medium text-zinc-700">Markdown</p>
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-xs leading-5 text-zinc-800">
                  {md}
                </pre>
              </div>

              <div className="rounded-lg border bg-zinc-50 p-3">
                <p className="text-xs font-medium text-zinc-700">JSON</p>
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-xs leading-5 text-zinc-800">
                  {json}
                </pre>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-10 text-xs text-zinc-500">
          v0 skeleton. Next: LLM integration (optional), drag & drop, GitHub Projects export.
        </footer>
      </div>
    </div>
  );
}
