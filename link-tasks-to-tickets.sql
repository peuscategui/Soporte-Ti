CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.tksoporte
ADD COLUMN IF NOT EXISTS ticket_uid UUID DEFAULT gen_random_uuid();

UPDATE public.tksoporte
SET ticket_uid = gen_random_uuid()
WHERE ticket_uid IS NULL;

ALTER TABLE public.tksoporte
ALTER COLUMN ticket_uid SET NOT NULL;

ALTER TABLE public.tksoporte
ADD CONSTRAINT tksoporte_ticket_uid_unique UNIQUE (ticket_uid);

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS ticket_uid UUID;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_ticket_uid_fkey
FOREIGN KEY (ticket_uid)
REFERENCES public.tksoporte(ticket_uid)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_ticket_uid ON public.tasks(ticket_uid);

