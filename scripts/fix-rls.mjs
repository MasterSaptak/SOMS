import fs from 'fs'
import path from 'path'
import pg from 'pg'

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) {
    env[key.trim()] = vals.join('=').trim()
  }
})

// if no DATABASE_URL, construct from Supabase URL assuming we have the db password
// Actually we can just check if DATABASE_URL exists:
console.log('Has DATABASE_URL:', !!env.DATABASE_URL)
if (env.DATABASE_URL) {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
  pool.query(`
    DROP POLICY IF EXISTS "members_can_read_org_members" ON organization_members;
    CREATE POLICY "members_can_read_org_members" ON organization_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        organization_id IN (
            SELECT organization_id FROM organizations WHERE owner_id = auth.uid()
        )
    );
  `).then(() => {
    console.log('Fixed RLS successfully')
    pool.end()
  }).catch(e => {
    console.error('Error fixing RLS:', e)
    pool.end()
  })
}
