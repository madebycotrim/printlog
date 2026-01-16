import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Square, Check, Loader2 } from 'lucide-react';
import api from '../../../utils/api';
import DashboardCard from './DashboardCard';

export default function TodoWidget() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        loadTodos();
    }, []);

    const loadTodos = async () => {
        try {
            const { data } = await api.get('/todos');
            if (Array.isArray(data)) setTasks(data);
        } catch (error) {
            console.error("Failed to load todos", error);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const tempId = `temp-${Date.now()}`;
        const taskText = newTask;

        // Optimistic UI
        const tempTask = { id: tempId, text: taskText, done: 0, created_at: new Date().toISOString() };
        setTasks([tempTask, ...tasks]);
        setNewTask('');

        try {
            const { data } = await api.post('/todos', { text: taskText });
            setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: data.id, done: data.done || 0 } : t));
        } catch (error) {
            console.error("Failed to add task", error);
            setTasks(prev => prev.filter(t => t.id !== tempId));
        }
    };

    const toggleTask = async (id, currentDone) => {
        const newDone = !currentDone;
        setTasks(prev => prev.map(t => t.id === id ? { ...t, done: newDone } : t));

        try {
            await api.put('/todos', { id, done: newDone });
        } catch (error) {
            console.error("Failed to toggle task", error);
            setTasks(prev => prev.map(t => t.id === id ? { ...t, done: currentDone } : t));
        }
    };

    const removeTask = async (id) => {
        const previousTasks = [...tasks];
        setTasks(prev => prev.filter(t => t.id !== id));

        try {
            await api.delete(`/todos?id=${id}`);
        } catch (error) {
            console.error("Failed to remove task", error);
            setTasks(previousTasks);
        }
    };

    return (
        <DashboardCard
            title="Notas"
            subtitle={`${tasks.filter(t => !t.done).length} pendentes`}
            icon={CheckSquare}
            accentColor="pink"
            headerAction={loading && <Loader2 size={12} className="text-zinc-600 animate-spin" />}
        >
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 -mr-2 mb-2">
                {!loading && tasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 mt-2">
                        <CheckSquare size={24} className="mb-2 text-zinc-500" />
                        <p className="text-[10px] uppercase font-bold text-zinc-500">Sem tarefas</p>
                    </div>
                )}

                {tasks.map(task => (
                    <div
                        key={task.id}
                        className={`group/task flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 
                        ${task.done
                                ? 'bg-zinc-900/30 border-transparent opacity-50 hover:opacity-80'
                                : 'bg-zinc-950/40 border-zinc-800/50 hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/5'}`}
                    >
                        <button
                            onClick={() => toggleTask(task.id, task.done)}
                            className={`shrink-0 transition-all duration-300 rounded-lg p-0.5 ${task.done ? 'text-pink-500' : 'text-zinc-600 hover:text-pink-400 hover:bg-pink-500/10'}`}
                        >
                            {task.done ? <Check size={14} strokeWidth={3} /> : <Square size={14} strokeWidth={2} />}
                        </button>
                        <span className={`flex-1 text-xs font-medium truncate transition-colors ${task.done ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
                            {task.text}
                        </span>
                        <button
                            onClick={() => removeTask(task.id)}
                            className="opacity-0 group-hover/task:opacity-100 text-zinc-600 hover:text-rose-500 transition-all p-1 hover:bg-rose-500/10 rounded-md scale-90 hover:scale-100"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={addTask} className="mt-auto relative z-20 group/input">
                <div className="absolute inset-0 bg-pink-500/5 rounded-xl blur-lg transition-opacity opacity-0 group-hover/input:opacity-100 pointer-events-none" />
                <input
                    type="text"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    placeholder="Adicionar nota..."
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2.5 pl-3 pr-9 text-xs text-zinc-200 outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all placeholder:text-zinc-600 font-medium shadow-inner"
                />
                <button
                    type="submit"
                    disabled={!newTask.trim()}
                    className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-pink-500 hover:bg-pink-400 text-white disabled:opacity-0 disabled:scale-75 transition-all duration-300 shadow-lg shadow-pink-500/20"
                >
                    <Plus size={14} strokeWidth={3} />
                </button>
            </form>
        </DashboardCard>
    );
}
