const { Client } = require('pg');
const fs = require('fs');

const connectionString = "postgres://c96618d0e5af83c9dfe231cc513cf9b454de480679f97db1c64db3dfaa5247f3:sk_uJAJ9jlNaqLJix8DZpZDg@db.prisma.io:5432/postgres?sslmode=require";

async function runMigration() {
    const client = new Client({ connectionString });

    try {
        console.log('📡 Connecting to database...');
        await client.connect();
        console.log('✅ Connected!');

        console.log('📄 Reading SQL file...');
        const sql = fs.readFileSync('init.sql', 'utf-8');

        console.log('🚀 Running migration...');
        await client.query(sql);

        console.log('✨ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

runMigration();
