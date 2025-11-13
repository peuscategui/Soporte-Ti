'use client';

import { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  Users,
  Clock,
  Activity,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquarePlus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

interface TaskUpdate {
  id: number;
  agentName: string;
  comment: string | null;
  usersServed: number;
  progress: number;
  createdAt: string;
}

interface TaskItem {
  id: string;
  boardId: string | null;
  ticketUid: string | null;
  ticketCode: string | null;
  ticketTitle: string | null;
  ticketOwner: string | null;
  ticketStatus: string | null;
  ticketCategory: string | null;
  title: string;
  description: string | null;
  category: string | null;
  priority: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  status: 'Pendiente' | 'En Progreso' | 'Completada';
  startDate: string | null;
  dueDate: string | null;
  usersServed: number;
  progress: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  updates: TaskUpdate[];
}

interface TaskFormState {
  title: string;
  description: string;
  category: string;
  ticketUid: string;
  ticketCode: string;
  priority: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  status: 'Pendiente' | 'En Progreso' | 'Completada';
  startDate: string;
  dueDate: string;
  usersServed: number;
  progress: number;
}

interface UpdateFormState {
  agentName: string;
  comment: string;
  usersServed: number;
  progress: number;
}

interface TicketOption {
  ticketUid: string;
  title: string;
  category: string | null;
  owner: string | null;
  status: string | null;
  createdAt: string | null;
}

const priorityStyles: Record<string, string> = {
  Baja: 'bg-emerald-100 text-emerald-700',
  Media: 'bg-sky-100 text-sky-700',
  Alta: 'bg-orange-100 text-orange-700',
  Urgente: 'bg-red-100 text-red-700',
};

const statusStyles: Record<string, string> = {
  Pendiente: 'bg-zinc-100 text-zinc-700',
  'En Progreso': 'bg-indigo-100 text-indigo-700',
  Completada: 'bg-emerald-100 text-emerald-700',
};

const defaultTaskForm: TaskFormState = {
  title: '',
  description: '',
  category: '',
  ticketUid: '',
  ticketCode: '',
  priority: 'Media',
  status: 'Pendiente',
  startDate: '',
  dueDate: '',
  usersServed: 0,
  progress: 0,
};

const defaultUpdateForm: UpdateFormState = {
  agentName: '',
  comment: '',
  usersServed: 0,
  progress: 0,
};

function formatDate(value?: string | null, withTime = false) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  if (withTime) {
    return date.toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function toDateInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function buildAuthHeaders(user: any): Record<string, string> {
  const headers: Record<string, string> = {};
  if (user?.fullName) headers['x-user-name'] = user.fullName;
  if (user?.email) headers['x-user-email'] = user.email;
  if (user?.systemRole) headers['x-user-role'] = user.systemRole;
  return headers;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
        <span>Avance</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            value === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAddUpdate,
  canManage,
  canAddUpdate,
}: {
  task: TaskItem;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onAddUpdate: (task: TaskItem) => void;
  canManage: boolean;
  canAddUpdate: boolean;
}) {
  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <ClipboardList className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-slate-900">{task.title}</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityStyles[task.priority]}`}>
              {task.priority}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[task.status]}`}>
              {task.status}
            </span>
          </div>
          {task.description && <p className="text-sm text-slate-600 max-w-3xl">{task.description}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            {task.ticketTitle && (
              <span className="flex items-center gap-1.5">
                <span className="font-medium text-slate-700">Ticket:</span>
                <span className="text-indigo-600 font-medium">
                  {task.ticketCode ? `${task.ticketCode} · ${task.ticketTitle}` : task.ticketTitle}
                </span>
              </span>
            )}
            {task.category && (
              <span className="flex items-center gap-1.5">
                <span className="font-medium text-slate-700">Categoría:</span>{' '}
                <span>{task.category}</span>
              </span>
            )}
            {task.ticketOwner && (
              <span className="flex items-center gap-1.5">
                <span className="font-medium text-slate-700">Solicitante:</span>{' '}
                <span>{task.ticketOwner}</span>
              </span>
            )}
            {task.startDate && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <span>Fecha inicio: {formatDate(task.startDate)}</span>
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Fecha límite: {formatDate(task.dueDate)}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" />
              <span>Usuarios atendidos: {task.usersServed}</span>
            </span>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2 self-start">
            <button
              onClick={() => onEdit(task)}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
              title="Editar tarea"
            >
              <Pencil className="h-4 w-4 text-slate-600" />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="p-2 rounded-full border border-red-200 hover:bg-red-50 transition-colors"
              title="Eliminar tarea"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}
      </div>

      <ProgressBar value={task.progress} />

      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Historial de Actualizaciones ({task.updates.length})
            </button>
          </div>
          {canAddUpdate && (
            <button
              onClick={() => onAddUpdate(task)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Agregar actualización
            </button>
          )}
        </div>

        {expanded && (
          <div className="mt-4 space-y-3">
            {task.updates.length === 0 && (
              <p className="text-sm text-slate-500">No hay actualizaciones registradas para esta tarea.</p>
            )}
            {task.updates.map(update => (
              <div
                key={update.id}
                className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">
                    <span className="font-semibold text-slate-800">{update.agentName}</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      {formatDate(update.createdAt, true)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-slate-400" />
                      {update.usersServed} usuarios
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-4 w-4 text-slate-400" />
                      Avance: {update.progress}%
                    </span>
                  </div>
                  {update.comment && <p className="text-sm text-slate-600">{update.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: TaskFormState;
  setForm: Dispatch<SetStateAction<TaskFormState>>;
  isEditing: boolean;
  submitting: boolean;
  ticketOptions: TicketOption[];
  ticketSearch: string;
  setTicketSearch: Dispatch<SetStateAction<string>>;
  onSearchTickets: () => void;
  ticketsLoading: boolean;
  categories: string[];
}

function TaskFormModal({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  isEditing,
  submitting,
  ticketOptions,
  ticketSearch,
  setTicketSearch,
  onSearchTickets,
  ticketsLoading,
  categories,
}: TaskFormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea'}
            </h2>
            <p className="text-sm text-slate-500">
              Completa la información para gestionar el seguimiento de la tarea.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Ticket relacionado</label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ticketSearch}
                  onChange={e => setTicketSearch(e.target.value)}
                  placeholder="Buscar por solicitud, categoría o solicitante"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  type="button"
                  onClick={() => onSearchTickets()}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700"
                >
                  Buscar
                </button>
              </div>
              <select
                value={form.ticketUid}
                onChange={e =>
                  setForm(prev => {
                    const option = ticketOptions.find(opt => opt.ticketUid === e.target.value);
                    return {
                      ...prev,
                      ticketUid: option ? option.ticketUid : '',
                      ticketCode: option ? option.title : '',
                    };
                  })
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Sin vincular</option>
                {ticketOptions.map(option => (
                  <option key={option.ticketUid} value={option.ticketUid}>
                    {option.title}
                    {option.owner ? ` · ${option.owner}` : ''}
                    {option.category ? ` · ${option.category}` : ''}
                  </option>
                ))}
              </select>
              {ticketsLoading && (
                <span className="text-xs text-slate-500">Buscando tickets...</span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Nombre de la tarea"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Categoría</label>
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Prioridad</label>
            <select
              value={form.priority}
              onChange={e => setForm(prev => ({ ...prev, priority: e.target.value as TaskFormState['priority'] }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Estado</label>
            <select
              value={form.status}
              onChange={e => setForm(prev => ({ ...prev, status: e.target.value as TaskFormState['status'] }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completada">Completada</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Fecha de inicio</label>
            <input
              type="date"
              value={form.startDate}
              onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Fecha límite</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Usuarios atendidos</label>
            <input
              type="number"
              min={0}
              value={form.usersServed}
              onChange={e => setForm(prev => ({ ...prev, usersServed: Number(e.target.value) }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Avance (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.progress}
              onChange={e => setForm(prev => ({ ...prev, progress: Number(e.target.value) }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="space-y-1 mt-4">
          <label className="text-xs font-medium text-slate-600">Descripción</label>
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[120px]"
            placeholder="Describe el objetivo, alcance y notas de la tarea"
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg flex items-center gap-2 transition-colors ${
              submitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? 'Actualizar Tarea' : 'Crear Tarea'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UpdateFormModal({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  submitting,
  taskTitle,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: UpdateFormState;
  setForm: Dispatch<SetStateAction<UpdateFormState>>;
  submitting: boolean;
  taskTitle: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Agregar actualización</h2>
            <p className="text-sm text-slate-500">Registra el avance más reciente para "{taskTitle}".</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover{text-slate-600 transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Responsable</label>
            <input
              type="text"
              value={form.agentName}
              onChange={e => setForm(prev => ({ ...prev, agentName: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Nombre del agente"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Usuarios atendidos</label>
            <input
              type="number"
              min={0}
              value={form.usersServed}
              onChange={e => setForm(prev => ({ ...prev, usersServed: Number(e.target.value) }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Avance (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.progress}
              onChange={e => setForm(prev => ({ ...prev, progress: Number(e.target.value) }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="space-y-1 mt-4">
          <label className="text-xs font-medium text-slate-600">Comentario</label>
          <textarea
            value={form.comment}
            onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[100px]"
            placeholder="Describe el avance realizado"
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg flex items-center gap-2 transition-colors ${
              submitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}Guardar actualización
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const permissions = usePermissions();
  const { isAdmin, isSupervisor, isAgent } = permissions;
  const canManageTasks = useMemo(() => isAdmin || isSupervisor, [isAdmin, isSupervisor]);
  const canAddTaskUpdates = useMemo(() => canManageTasks || isAgent, [canManageTasks, isAgent]);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormState>(() => ({ ...defaultTaskForm }));
  const [updateForm, setUpdateForm] = useState<UpdateFormState>(() => ({ ...defaultUpdateForm }));
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskForUpdate, setTaskForUpdate] = useState<TaskItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticketOptions, setTicketOptions] = useState<TicketOption[]>([]);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketCategories, setTicketCategories] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError('No autenticado');
      setLoading(false);
      return;
    }
    fetchTasks();
    if (ticketOptions.length === 0) {
      searchTickets();
    }
    if (ticketCategories.length === 0) {
      fetchCategories();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.email]);

  async function fetchTasks() {
    try {
      setLoading(true);
      const authHeaders = buildAuthHeaders(user);
      const response = await fetch('/api/tasks', {
        headers: Object.keys(authHeaders).length > 0 ? authHeaders : undefined,
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar las tareas');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Error al cargar tareas');
      }

      const normalized: TaskItem[] = (result.data || []).map((task: any) => ({
        id: task.id,
        boardId: task.board_id ?? null,
        ticketUid: task.ticket_uid ?? null,
        ticketCode: task.ticket_code ?? null,
        ticketTitle: task.ticket_title ?? null,
        ticketOwner: task.ticket_owner ?? null,
        ticketStatus: task.ticket_status ?? null,
        ticketCategory: task.ticket_category ?? null,
        title: task.title,
        description: task.description ?? null,
        category: task.category ?? null,
        priority: task.priority,
        status: task.status,
        startDate: task.start_date ?? null,
        dueDate: task.due_date ?? null,
        usersServed: task.users_served ?? 0,
        progress: task.progress ?? 0,
        createdBy: task.created_by ?? null,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        updates: (task.updates || []).map((update: any) => ({
          id: update.id,
          agentName: update.agent_name,
          comment: update.comment,
          usersServed: update.users_served,
          progress: update.progress,
          createdAt: update.created_at,
        })),
      }));

      setTasks(normalized);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }

  async function searchTickets(customQuery?: string) {
    if (!user) return;
    try {
      setTicketsLoading(true);
      const queryParam = customQuery !== undefined ? customQuery : ticketSearch;
      const params = new URLSearchParams();
      if (queryParam) {
        params.set('q', queryParam);
      }
      params.set('limit', '50');

      const authHeaders = buildAuthHeaders(user);
      const response = await fetch(`/api/tasks/tickets?${params.toString()}`, {
        headers: Object.keys(authHeaders).length > 0 ? authHeaders : undefined,
      });

      if (!response.ok) {
        throw new Error('No se pudieron obtener los tickets');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Error listando tickets');
      }

      setTicketOptions(result.data || []);
    } catch (err) {
      console.error('Error buscando tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  }

  async function fetchCategories() {
    if (!user) return;
    try {
      const authHeaders = buildAuthHeaders(user);
      const response = await fetch('/api/tickets/categorias', {
        headers: Object.keys(authHeaders).length > 0 ? authHeaders : undefined,
      });

      if (!response.ok) {
        throw new Error('No se pudieron obtener las categorías');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Error listando categorías');
      }

      setTicketCategories(result.data || []);
    } catch (err) {
      console.error('Error buscando categorías:', err);
    }
  }

  useEffect(() => {
    if (editingTask?.ticketUid) {
      setTaskForm(prev => ({
        ...prev,
        ticketUid: editingTask.ticketUid || '',
        ticketCode: editingTask.ticketCode || editingTask.ticketTitle || '',
      }));

      const exists = ticketOptions.some(opt => opt.ticketUid === editingTask.ticketUid);
      if (!exists && editingTask.ticketUid && editingTask.ticketTitle) {
        setTicketOptions(prev => [
          {
            ticketUid: editingTask.ticketUid!,
            title: editingTask.ticketTitle || '',
            category: editingTask.ticketCategory || null,
            owner: editingTask.ticketOwner,
            status: editingTask.ticketStatus,
            createdAt: null,
          },
          ...prev,
        ]);
      }
    }
    if (editingTask?.category) {
      setTicketCategories(prev =>
        prev.includes(editingTask.category!) ? prev : [...prev, editingTask.category!]
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTask?.ticketUid]);

  function openCreateTaskModal() {
    setEditingTask(null);
    setTaskForm({ ...defaultTaskForm });
    setTaskModalOpen(true);
  }

  function openEditTaskModal(task: TaskItem) {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      category: task.category || '',
      ticketUid: task.ticketUid || '',
      ticketCode: task.ticketCode || task.ticketTitle || '',
      priority: task.priority,
      status: task.status,
      startDate: toDateInput(task.startDate),
      dueDate: toDateInput(task.dueDate),
      usersServed: task.usersServed,
      progress: task.progress,
    });
    setTaskModalOpen(true);
  }

  function openUpdateModal(task: TaskItem) {
    setTaskForUpdate(task);
    setUpdateForm({
      agentName: user?.fullName || '',
      comment: '',
      usersServed: task.usersServed,
      progress: task.progress,
    });
    setUpdateModalOpen(true);
  }

  async function handleSubmitTask() {
    if (!taskForm.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    setSubmitting(true);

    const payload = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      category: taskForm.category.trim(),
      ticketUid: taskForm.ticketUid ? taskForm.ticketUid : null,
      ticketCode: taskForm.ticketCode.trim(),
      priority: taskForm.priority,
      status: taskForm.status,
      startDate: taskForm.startDate ? new Date(taskForm.startDate).toISOString() : null,
      dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
      usersServed: taskForm.usersServed,
      progress: taskForm.progress,
    };

    try {
      if (editingTask) {
        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders(user),
          } as HeadersInit,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || 'No se pudo actualizar la tarea');
        }
      } else {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders(user),
          } as HeadersInit,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || 'No se pudo crear la tarea');
        }
      }

      setTaskModalOpen(false);
      await fetchTasks();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al guardar la tarea');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTask(task: TaskItem) {
    if (!confirm(`¿Seguro que deseas eliminar la tarea "${task.title}"?`)) {
      return;
    }

    try {
      setSubmitting(true);
      const authHeaders = buildAuthHeaders(user);
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: Object.keys(authHeaders).length > 0 ? authHeaders : undefined,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'No se pudo eliminar la tarea');
      }

      await fetchTasks();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al eliminar la tarea');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitUpdate() {
    if (!taskForUpdate) return;

    if (!updateForm.agentName.trim()) {
      alert('El responsable es obligatorio');
      return;
    }

    setSubmitting(true);

    const payload = {
      agentName: updateForm.agentName.trim(),
      comment: updateForm.comment.trim(),
      usersServed: updateForm.usersServed,
      progress: updateForm.progress,
    };

    try {
      const response = await fetch(`/api/tasks/${taskForUpdate.id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(user),
        } as HeadersInit,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'No se pudo registrar la actualización');
      }

      setUpdateModalOpen(false);
      await fetchTasks();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al guardar la actualización');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-500" />
          <p className="mt-3 text-slate-500">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-md">
          <p className="text-red-600 font-semibold mb-2">No fue posible cargar las tareas</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Tareas</h1>
          <p className="text-sm text-slate-500">
            Sistema de seguimiento de tareas relacionadas a tickets.
          </p>
        </div>
        {canManageTasks && (
          <button
            onClick={openCreateTaskModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </button>
        )}
      </div>

      <div className="space-y-6">
        {tasks.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-800">Aún no hay tareas registradas</h2>
            <p className="text-sm text-slate-500 mt-2">
              Crea tu primera tarea para comenzar a llevar un seguimiento detallado del trabajo del equipo.
            </p>
            {canManageTasks && (
              <button
                onClick={openCreateTaskModal}
                className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="h-4 w-4" />
                Crear tarea
              </button>
            )}
          </div>
        )}

        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            expanded={!!expandedTaskIds[task.id]}
            onToggle={() =>
              setExpandedTaskIds(prev => ({ ...prev, [task.id]: !prev[task.id] }))
            }
            onEdit={openEditTaskModal}
            onDelete={handleDeleteTask}
            onAddUpdate={openUpdateModal}
            canManage={canManageTasks}
            canAddUpdate={canAddTaskUpdates}
          />
        ))}
      </div>

      <TaskFormModal
        open={taskModalOpen}
        onClose={() => {
          if (!submitting) {
            setTaskModalOpen(false);
          }
        }}
        onSubmit={handleSubmitTask}
        form={taskForm}
        setForm={setTaskForm}
        isEditing={!!editingTask}
        submitting={submitting}
        ticketOptions={ticketOptions}
        ticketSearch={ticketSearch}
        setTicketSearch={setTicketSearch}
        onSearchTickets={() => searchTickets()}
        ticketsLoading={ticketsLoading}
        categories={ticketCategories}
      />

      <UpdateFormModal
        open={updateModalOpen}
        onClose={() => {
          if (!submitting) {
            setUpdateModalOpen(false);
          }
        }}
        onSubmit={handleSubmitUpdate}
        form={updateForm}
        setForm={setUpdateForm}
        submitting={submitting}
        taskTitle={taskForUpdate?.title || ''}
      />
    </div>
  );
}
