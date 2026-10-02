import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Check, ClipboardList } from "lucide-react";

const PRIORITIES = {
  low: { label: "ต่ำ", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-400" },
  medium: { label: "กลาง", badge: "bg-amber-50 text-amber-700 ring-amber-200", bar: "bg-amber-400" },
  high: { label: "สูง", badge: "bg-rose-50 text-rose-700 ring-rose-200", bar: "bg-rose-500" },
};
const ORDER = ["low", "medium", "high"];
const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "active", label: "ยังไม่เสร็จ" },
  { key: "completed", label: "เสร็จแล้ว" },
];

function TodoItem({ todo, onToggle, onDelete, onEdit, onCyclePriority }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef(null);
  const p = PRIORITIES[todo.priority];

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    const t = draft.trim();
    if (t) onEdit(todo.id, t);
    else setDraft(todo.text);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(todo.text);
    setEditing(false);
  };

  return (
    <li
      className={`overflow-hidden px-1 transition-all duration-300 ease-in-out ${
        todo.removing ? "max-h-0 py-0 opacity-0 translate-x-6" : "max-h-32 py-1 opacity-100"
      }`}
    >
      <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
        <span className={`h-8 w-1 shrink-0 rounded-full ${p.bar}`} />
        <button
          onClick={() => onToggle(todo.id)}
          aria-label="ทำเครื่องหมายว่าเสร็จ"
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
            todo.done ? "border-slate-800 bg-slate-800 text-white" : "border-slate-300 hover:border-slate-500"
          }`}
        >
          {todo.done && <Check size={14} strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-500"
            />
          ) : (
            <p
              onDoubleClick={() => setEditing(true)}
              title="ดับเบิลคลิกเพื่อแก้ไข"
              className={`cursor-text select-none break-words text-sm ${
                todo.done ? "text-slate-400 line-through" : "text-slate-800"
              }`}
            >
              {todo.text}
            </p>
          )}
        </div>

        <button
          onClick={() => onCyclePriority(todo.id)}
          title="คลิกเพื่อเปลี่ยนความสำคัญ"
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${p.badge}`}
        >
          {p.label}
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          aria-label="ลบงาน"
          className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}

export default function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "ส่งรายงานประจำสัปดาห์", done: false, priority: "high" },
    { id: 2, text: "ซื้อของเข้าบ้าน", done: false, priority: "medium" },
    { id: 3, text: "อ่านหนังสือ 30 นาที", done: true, priority: "low" },
  ]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const nextId = useRef(4);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((prev) => [{ id: nextId.current++, text: t, done: false, priority }, ...prev]);
    setText("");
  };
  const toggle = (id) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const edit = (id, newText) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  const cycle = (id) =>
    setTodos((p) =>
      p.map((t) => (t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t))
    );
  const remove = (id) => {
    setTodos((p) => p.map((t) => (t.id === id ? { ...t, removing: true } : t)));
    setTimeout(() => setTodos((p) => p.filter((t) => t.id !== id)), 300);
  };
  const clearCompleted = () => {
    const ids = todos.filter((t) => t.done).map((t) => t.id);
    ids.forEach(remove);
  };

  const remaining = todos.filter((t) => !t.done).length;
  const completedCount = todos.length - remaining;
  const visible = todos.filter((t) =>
    filter === "active" ? !t.done : filter === "completed" ? t.done : true
  );
  const emptyText = {
    all: "ยังไม่มีงาน เพิ่มงานแรกของคุณได้เลย",
    active: "ไม่มีงานที่ค้างอยู่",
    completed: "ยังไม่มีงานที่เสร็จ",
  }[filter];

  return (
    <div
      className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12"
      style={{ fontFamily: '"Noto Sans Thai", "Sarabun", "Leelawadee UI", system-ui, sans-serif' }}
    >
      <div className="mx-auto w-full max-w-xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">รายการงานของฉัน</h1>

        {/* Add form */}
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="เพิ่มงานใหม่..."
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-slate-500"
            />
            <button
              onClick={add}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">เพิ่ม</span>
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-500">ความสำคัญ:</span>
            {ORDER.map((k) => (
              <button
                key={k}
                onClick={() => setPriority(k)}
                className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-all ${
                  PRIORITIES[k].badge
                } ${priority === k ? "ring-2 scale-105" : "opacity-60 hover:opacity-100"}`}
              >
                {PRIORITIES[k].label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-3 flex gap-1 rounded-xl bg-slate-200/60 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 rounded-lg px-2 py-2 text-sm font-medium transition-all ${
                filter === f.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-white py-12 text-slate-400 shadow-sm ring-1 ring-slate-100">
            <ClipboardList size={36} strokeWidth={1.5} />
            <p className="mt-3 text-sm">{emptyText}</p>
          </div>
        ) : (
          <ul>
            {visible.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
                onToggle={toggle}
                onDelete={remove}
                onEdit={edit}
                onCyclePriority={cycle}
              />
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between px-1 text-sm text-slate-500">
          <span>เหลืออีก {remaining} งาน</span>
          <button
            onClick={clearCompleted}
            disabled={completedCount === 0}
            className="rounded-md px-2 py-1 text-slate-600 transition-colors hover:bg-slate-200/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            ล้างงานที่เสร็จแล้ว ({completedCount})
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">ดับเบิลคลิกที่ข้อความเพื่อแก้ไข · คลิกป้ายเพื่อเปลี่ยนความสำคัญ</p>
      </div>
    </div>
  );
}
