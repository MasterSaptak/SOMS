-- ==========================================================================
-- INVENTORY MANAGEMENT
-- Adds Assets, Consumables, Checkups
-- ==========================================================================

-- 1. ASSETS TABLE
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    serial_number TEXT,
    status TEXT NOT NULL DEFAULT 'Available',
    price DECIMAL(10,2) DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    location TEXT,
    supplier TEXT,
    purchase_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_organization_id ON assets(organization_id);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_access_assets" ON assets;
CREATE POLICY "org_access_assets" ON assets FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));


-- ==========================================================================
-- 2. CONSUMABLES TABLE
-- ==========================================================================
CREATE TABLE IF NOT EXISTS consumables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 10,
    unit TEXT DEFAULT 'pcs',
    unit_price DECIMAL(10,2) DEFAULT 0,
    location TEXT,
    supplier TEXT,
    status TEXT DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consumables_organization_id ON consumables(organization_id);

ALTER TABLE consumables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_access_consumables" ON consumables;
CREATE POLICY "org_access_consumables" ON consumables FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));


-- ==========================================================================
-- 3. INVENTORY CHECKUPS (Audit Log)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS inventory_checkups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('asset', 'consumable')),
    item_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('stock_adjustment', 'maintenance', 'assignment', 'audit', 'repair')),
    quantity_change INTEGER DEFAULT 0,
    performed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_checkups_org ON inventory_checkups(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_checkups_item ON inventory_checkups(item_type, item_id);

ALTER TABLE inventory_checkups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_access_inventory_checkups" ON inventory_checkups;
CREATE POLICY "org_access_inventory_checkups" ON inventory_checkups FOR ALL USING (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid()));
