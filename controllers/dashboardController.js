const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig);

exports.getLeadsSummary = async (req, res, next) => {
    try {
        // Aggregate all active leads from all tables
        // Use a CTE to union three tables, then compute:
        // 1) counts by status
        // 2) last 4 weeks counts (week buckets)
        const statusSQL = `
      WITH all_leads AS (
        SELECT status, created_at FROM contact_submissions WHERE is_active = true AND status IS NOT NULL
        UNION ALL
        SELECT status, created_at FROM distribution_submissions WHERE is_active = true AND status IS NOT NULL
        UNION ALL
        SELECT status, created_at FROM product_contact_submissions WHERE is_active = true AND status IS NOT NULL
      )
      SELECT status, COUNT(*)::int AS count
      FROM all_leads
      GROUP BY status;
    `;

        // last 4 full week buckets ending current week start (Mon-based) using date_trunc('week')
        const weeklySQL = `
      WITH all_leads AS (
        SELECT created_at FROM contact_submissions WHERE is_active = true AND created_at IS NOT NULL
        UNION ALL
        SELECT created_at FROM distribution_submissions WHERE is_active = true AND created_at IS NOT NULL
        UNION ALL
        SELECT created_at FROM product_contact_submissions WHERE is_active = true AND created_at IS NOT NULL
      ),
      weeks AS (
        SELECT generate_series(
          date_trunc('week', now()) - interval '3 week',
          date_trunc('week', now()),
          interval '1 week'
        ) AS week_start
      ),
      weekly_counts AS (
        SELECT date_trunc('week', created_at) AS week_start, COUNT(*)::int AS count
        FROM all_leads
        WHERE created_at >= (date_trunc('week', now()) - interval '3 week')
        GROUP BY 1
      )
      SELECT to_char(w.week_start, 'YYYY-MM-DD') AS week_start,
             COALESCE(wc.count, 0)::int AS count
      FROM weeks w
      LEFT JOIN weekly_counts wc USING (week_start)
      ORDER BY w.week_start ASC;
    `;

        const [statusResult, weeklyResult] = await Promise.all([
            knex.raw(statusSQL),
            knex.raw(weeklySQL),
        ]);

        // Normalize status counts; ensure all 4 keys present
        const allowed = ['new', 'contacted', 'qualified', 'hot'];
        const statusRows = statusResult.rows || statusResult[0] || [];
        const statusMap = allowed.reduce((acc, k) => ((acc[k] = 0), acc), {});
        statusRows.forEach(r => {
            if (r.status && allowed.includes(r.status)) {
                statusMap[r.status] = Number(r.count) || 0;
            }
        });

        const total = Object.values(statusMap).reduce((a, b) => a + b, 0);

        // For pie chart (Recharts wants name/value)
        const pie = allowed.map(name => ({ name, value: statusMap[name] }));

        // Weekly data for last 4 weeks
        const weekly = (weeklyResult.rows || weeklyResult[0] || []).map((r) => {
            return {
                weekStart: r.week_start,  // 'YYYY-MM-DD'
                count: Number(r.count) || 0,
                label: r.week_start,      // you can prettify on frontend
            };
        });

        res.json({
            totals: {
                total,
                ...statusMap,
            },
            pie,
            weekly,
        });
    } catch (err) {
        next(err);
    }
};

// Optional helper endpoint if you want a recent list (for tables, not required for charts)
exports.getRecentLeads = async (req, res, next) => {
    try {
        const listSQL = `
      SELECT id, status, created_at, 'contact' AS source, full_name AS full_name, email, company
      FROM contact_submissions WHERE is_active = true AND status IS NOT NULL AND created_at IS NOT NULL
      UNION ALL
      SELECT id, status, created_at, 'distribution' AS source, full_name AS full_name, email, company
      FROM distribution_submissions WHERE is_active = true AND status IS NOT NULL AND created_at IS NOT NULL
      UNION ALL
      SELECT id, status, created_at, 'product' AS source, full_name AS full_name, email, company
      FROM product_contact_submissions WHERE is_active = true AND status IS NOT NULL AND created_at IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 20;
    `;
        const result = await knex.raw(listSQL);
        res.json({ data: result.rows || result[0] || [] });
    } catch (err) {
        next(err);
    }
};
