-- Habilitar extensión para generar UUID si no existe
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de tableros de tareas
CREATE TABLE IF NOT EXISTS public.task_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.task_boards (name, description)
SELECT 'General', 'Tablero principal de tareas'
WHERE NOT EXISTS (
  SELECT 1 FROM public.task_boards WHERE name = 'General'
);

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES public.task_boards(id) ON DELETE SET NULL,
  ticket_code TEXT,
  ticket_uid UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT NOT NULL DEFAULT 'Media',
  status TEXT NOT NULL DEFAULT 'Pendiente',
  start_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  users_served INTEGER NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tasks_priority_check CHECK (priority IN ('Baja', 'Media', 'Alta', 'Urgente')),
  CONSTRAINT tasks_status_check CHECK (status IN ('Pendiente', 'En Progreso', 'Completada')),
  CONSTRAINT tasks_progress_check CHECK (progress BETWEEN 0 AND 100),
  CONSTRAINT tasks_users_served_check CHECK (users_served >= 0)
);

CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Tabla de actualizaciones de tareas
CREATE TABLE IF NOT EXISTS public.task_updates (
  id BIGSERIAL PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  comment TEXT,
  users_served INTEGER NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_updates_users_served_check CHECK (users_served >= 0),
  CONSTRAINT task_updates_progress_check CHECK (progress BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_task_updates_task_id ON public.task_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_task_updates_created_at ON public.task_updates(created_at DESC);

