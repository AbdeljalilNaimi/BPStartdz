
-- EMPLOYEES: restrict to admins only (protects email exposure + mutations)
DROP POLICY IF EXISTS "Authenticated users can select employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can update employees" ON public.employees;

CREATE POLICY "Admins can select employees"
ON public.employees FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert employees"
ON public.employees FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update employees"
ON public.employees FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ASSET CATEGORIES: restrict mutations to admins
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.asset_categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.asset_categories;

CREATE POLICY "Admins can insert categories"
ON public.asset_categories FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories"
ON public.asset_categories FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ASSET ASSIGNMENTS: restrict mutations to admins
DROP POLICY IF EXISTS "Authenticated users can insert assignments" ON public.asset_assignments;
DROP POLICY IF EXISTS "Authenticated users can update assignments" ON public.asset_assignments;

CREATE POLICY "Admins can insert assignments"
ON public.asset_assignments FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update assignments"
ON public.asset_assignments FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
