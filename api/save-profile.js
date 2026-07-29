module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({
      error: "Supabase 환경변수가 설정되지 않았습니다.",
    });
    return;
  }

  let payload;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: "잘못된 요청 본문입니다." });
    return;
  }

  const name = String(payload?.name || "").trim();
  const birthDate = String(payload?.birthDate || "").trim();

  if (!name || !birthDate) {
    res.status(400).json({ error: "name과 birthDate가 필요합니다." });
    return;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/birth_profiles`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name,
      birth_date: birthDate,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    res.status(response.status).json({
      error: data?.message || "Supabase 저장에 실패했습니다.",
    });
    return;
  }

  res.status(200).json({
    ok: true,
    row: Array.isArray(data) ? data[0] : data,
  });
}
