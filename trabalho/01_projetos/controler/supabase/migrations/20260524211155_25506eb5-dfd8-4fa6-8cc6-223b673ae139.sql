ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'conta_corrente',
  ADD COLUMN IF NOT EXISTS competence_date date,
  ADD COLUMN IF NOT EXISTS payment_date date,
  ADD COLUMN IF NOT EXISTS installment boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS installment_number integer,
  ADD COLUMN IF NOT EXISTS installments_total integer,
  ADD COLUMN IF NOT EXISTS installment_amount numeric,
  ADD COLUMN IF NOT EXISTS total_amount numeric,
  ADD COLUMN IF NOT EXISTS purchase_group_id uuid,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'realizado';

CREATE INDEX IF NOT EXISTS idx_tx_user_group ON public.transactions(user_id, purchase_group_id);
CREATE INDEX IF NOT EXISTS idx_tx_user_payment ON public.transactions(user_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_tx_user_status ON public.transactions(user_id, status);