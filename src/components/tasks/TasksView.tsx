import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  UserCheck
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { StaffTask } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

export const TasksView: React.FC = () => {
  const { staffTasks, refreshAll, showToast } = useHotel();
  const { user } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      showToast('Task title is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createStaffTask({
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        assignedTo: user?.id,
        priority: taskPriority,
        dueDate,
        creatorName: user?.name || 'Supervisor'
      });
      showToast('Staff duty task created', 'success');
      setIsAddModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to create task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (task: StaffTask) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : task.status === 'Pending' ? 'In Progress' : 'Completed';
    try {
      await api.updateStaffTask(task.id, { status: nextStatus });
      showToast(`Task status updated to ${nextStatus}`, 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-brand">
            Staff Duty Tasks & Operational Checklist
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate housekeeping routines, cashier reconciliations, and facility duties.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Staff Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffTasks.map(task => (
          <div
            key={task.id}
            className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between transition ${
              task.status === 'Completed' ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={task.priority} type="priority" size="sm" />
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {task.status}
                </span>
              </div>

              <h3 className={`font-bold text-sm text-slate-900 ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-3">
                {task.description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div>Assigned: <strong className="text-slate-800">{task.assignedToName}</strong> ({task.department})</div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Due by: <strong>{new Date(task.dueDate).toLocaleDateString()}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleToggleTaskStatus(task)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                  task.status === 'Completed'
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {task.status === 'Completed' ? 'Reopen Task' : task.status === 'Pending' ? 'Start Task' : 'Mark Completed'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Operational Staff Task"
        subtitle="Assign tasks to hotel team members with priority and due dates."
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="e.g. Inspect Thika road generator fuel reserve"
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Instructions</label>
            <textarea
              rows={3}
              value={taskDesc}
              onChange={e => setTaskDesc(e.target.value)}
              placeholder="Actionable steps and specific checks needed"
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Completion Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow"
            >
              {isSubmitting ? 'Saving...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
