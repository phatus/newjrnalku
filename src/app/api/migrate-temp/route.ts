import { NextResponse } from 'next/server';
import { Client } from 'pg';

// TEMP migration route - DELETE after use
export async function GET() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        return NextResponse.json({ success: false, error: 'DATABASE_URL not set' }, { status: 500 });
    }

    const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Step 1: Add column
        await client.query(`
            ALTER TABLE public.activity_schedules
            ADD COLUMN IF NOT EXISTS days_of_week integer[] DEFAULT '{}';
        `);

        // Step 2: Backfill old data
        await client.query(`
            UPDATE public.activity_schedules
            SET days_of_week = ARRAY[day_of_week]
            WHERE (days_of_week IS NULL OR cardinality(days_of_week) = 0)
            AND day_of_week IS NOT NULL;
        `);

        // Step 3: Verify
        const result = await client.query(`
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN cardinality(days_of_week) > 0 THEN 1 END) as migrated
            FROM public.activity_schedules;
        `);

        return NextResponse.json({
            success: true,
            message: 'Migration completed! Column days_of_week added and backfilled.',
            stats: result.rows[0]
        });

    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    } finally {
        await client.end().catch(() => { });
    }
}

