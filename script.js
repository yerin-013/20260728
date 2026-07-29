const todayText = document.getElementById("todayText");
const dayHint = document.getElementById("dayHint");
const previewTitle = document.getElementById("previewTitle");
const previewText = document.getElementById("previewText");
const previewChipA = document.getElementById("previewChipA");
const previewChipB = document.getElementById("previewChipB");
const previewChipC = document.getElementById("previewChipC");

const chatLog = document.getElementById("chatLog");
const birthForm = document.getElementById("birthForm");
const nameInput = document.getElementById("nameInput");
const birthInput = document.getElementById("birthInput");
const apiKeyInput = document.getElementById("apiKeyInput");
const apiSecretInput = document.getElementById("apiSecretInput");
const resetBtn = document.getElementById("resetBtn");
const quickRow = document.getElementById("quickRow");
const saveStatus = document.getElementById("saveStatus");

const ageValue = document.getElementById("ageValue");
const zodiacValue = document.getElementById("zodiacValue");
const lifePathValue = document.getElementById("lifePathValue");
const keywordValue = document.getElementById("keywordValue");

const zodiacSigns = [
  { name: "양자리", start: [3, 21], end: [4, 19] },
  { name: "황소자리", start: [4, 20], end: [5, 20] },
  { name: "쌍둥이자리", start: [5, 21], end: [6, 21] },
  { name: "게자리", start: [6, 22], end: [7, 22] },
  { name: "사자자리", start: [7, 23], end: [8, 22] },
  { name: "처녀자리", start: [8, 23], end: [9, 23] },
  { name: "천칭자리", start: [9, 24], end: [10, 22] },
  { name: "전갈자리", start: [10, 23], end: [11, 22] },
  { name: "사수자리", start: [11, 23], end: [12, 24] },
  { name: "염소자리", start: [12, 25], end: [1, 19] },
  { name: "물병자리", start: [1, 20], end: [2, 18] },
  { name: "물고기자리", start: [2, 19], end: [3, 20] },
];

const profileWords = {
  "1": "리더형",
  "2": "조율형",
  "3": "표현형",
  "4": "실행형",
  "5": "변화형",
  "6": "돌봄형",
  "7": "분석형",
  "8": "성과형",
  "9": "완성형",
  "11": "직관형",
  "22": "구현형",
};

const keywordBySign = {
  양자리: "시작",
  황소자리: "안정",
  쌍둥이자리: "소통",
  게자리: "배려",
  사자자리: "존재감",
  처녀자리: "정밀",
  천칭자리: "균형",
  전갈자리: "집중",
  사수자리: "확장",
  염소자리: "성과",
  물병자리: "발상",
  물고기자리: "감성",
};

const birthTips = {
  spring: "새로운 시작을 밀어붙이기 좋은 날",
  summer: "관계와 감정의 온도가 중요한 날",
  autumn: "정리와 판단이 잘 맞는 날",
  winter: "속도를 조절하며 안정적으로 가는 날",
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function seedFromString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

function wrapLines(ctx, text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
  const paragraphs = String(text).split("\n");
  let lineCount = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";

    if (words.length === 0) {
      y += lineHeight;
      lineCount += 1;
      continue;
    }

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const { width } = ctx.measureText(testLine);

      if (width > maxWidth && line) {
        ctx.fillText(line, x, y);
        y += lineHeight;
        lineCount += 1;
        line = word;

        if (lineCount >= maxLines) {
          return;
        }
      } else {
        line = testLine;
      }
    }

    if (line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lineCount += 1;
    }

    if (lineCount >= maxLines) {
      return;
    }
  }
}

function setSaveStatus(message, tone = "neutral") {
  saveStatus.textContent = message;
  saveStatus.dataset.tone = tone;
}

function setSessionKeys(apiKey = "", apiSecret = "") {
  const payload = JSON.stringify({ apiKey, apiSecret });
  sessionStorage.setItem("higgsfield_credentials", payload);
}

function getSessionKeys() {
  try {
    const raw = sessionStorage.getItem("higgsfield_credentials");
    if (!raw) return { apiKey: "", apiSecret: "" };
    const parsed = JSON.parse(raw);
    return {
      apiKey: String(parsed.apiKey || ""),
      apiSecret: String(parsed.apiSecret || ""),
    };
  } catch {
    return { apiKey: "", apiSecret: "" };
  }
}

function formatToday() {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  todayText.textContent = formatter.format(new Date());
  dayHint.textContent = "생년월일을 넣으면 봇이 바로 요약해 드려요.";
}

function getZodiac(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const sign of zodiacSigns) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;

    if (startMonth <= endMonth) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay) || (month > startMonth && month < endMonth)) {
        return sign.name;
      }
    } else if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay) ||
      month > startMonth ||
      month < endMonth
    ) {
      return sign.name;
    }
  }

  return "양자리";
}

function getAge(birthDate, today = new Date()) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

function getLifePath(date) {
  const digits = date
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "")
    .split("")
    .map(Number);

  let total = digits.reduce((sum, value) => sum + value, 0);

  while (total > 9 && total !== 11 && total !== 22) {
    total = String(total)
      .split("")
      .map(Number)
      .reduce((sum, value) => sum + value, 0);
  }

  return total;
}

function getSeason(month) {
  if (month === 3 || month === 4 || month === 5) return "spring";
  if (month === 6 || month === 7 || month === 8) return "summer";
  if (month === 9 || month === 10 || month === 11) return "autumn";
  return "winter";
}

function getWeekday(date) {
  return new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(date);
}

function classifyMood(score) {
  if (score >= 86) return "매우 좋음";
  if (score >= 76) return "좋음";
  if (score >= 66) return "무난";
  if (score >= 56) return "주의";
  return "점검";
}

function getPosterAccent(zodiac) {
  const palette = {
    양자리: { main: "#ff8a7a", soft: "#ffe6e1", accent: "#8f372c" },
    황소자리: { main: "#94c973", soft: "#e8f6dd", accent: "#4f7e35" },
    쌍둥이자리: { main: "#82b4ff", soft: "#e6f0ff", accent: "#355fa6" },
    게자리: { main: "#d6a0d8", soft: "#f6e8f7", accent: "#8a5b8d" },
    사자자리: { main: "#ffb84d", soft: "#fff0d7", accent: "#a86b00" },
    처녀자리: { main: "#74c8b5", soft: "#def6f0", accent: "#2c6c5b" },
    천칭자리: { main: "#f28fb4", soft: "#fde5ef", accent: "#a24168" },
    전갈자리: { main: "#9a7cff", soft: "#ece6ff", accent: "#4d33ab" },
    사수자리: { main: "#7fd0ff", soft: "#e5f7ff", accent: "#2a7293" },
    염소자리: { main: "#9da3ad", soft: "#eceef1", accent: "#535b66" },
    물병자리: { main: "#6ee7d8", soft: "#e2fbf7", accent: "#2f897d" },
    물고기자리: { main: "#a49aff", soft: "#efecff", accent: "#5a50c6" },
  };

  return palette[zodiac] || { main: "#8e7dff", soft: "#eee9ff", accent: "#4338ca" };
}

function createFortuneCard(profile) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1536;
  const ctx = canvas.getContext("2d");
  const { main, soft, accent } = getPosterAccent(profile.zodiac);
  const seed = seedFromString(`${profile.rawDate}-${profile.name}`);
  const rng = mulberry32(seed);
  const fortuneColor = profile.color || "보라";
  const colorTone = {
    보라: { bg: "#f5efff", accent: "#5d43cb", soft: "#ece5ff" },
    크림: { bg: "#fff7e8", accent: "#8a5d00", soft: "#fff0cf" },
    네이비: { bg: "#eef3ff", accent: "#2f4d92", soft: "#dde7ff" },
    민트: { bg: "#ecfbf6", accent: "#22786d", soft: "#d8f4ea" },
    버건디: { bg: "#f8e9ee", accent: "#8f3755", soft: "#f0d6e0" },
    살구: { bg: "#fff1e7", accent: "#ad5a2d", soft: "#ffe0cc" },
  }[fortuneColor] || { bg: "#f5efff", accent: "#5d43cb", soft: "#ece5ff" };

  const bg = ctx.createLinearGradient(0, 0, 1024, 1536);
  bg.addColorStop(0, "#ffffff");
  bg.addColorStop(0.5, colorTone.bg);
  bg.addColorStop(1, "#fffdfb");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(220, 180, 30, 220, 180, 380);
  glow.addColorStop(0, `${main}33`);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(74, 21, 75, 0.08)";
  for (let i = 0; i < 22; i += 1) {
    const x = 80 + rng() * 864;
    const y = 120 + rng() * 1160;
    const r = 4 + rng() * 8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = `${main}55`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(56, 56, 912, 1424, 48);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.beginPath();
  ctx.roundRect(88, 88, 848, 1350, 42);
  ctx.fill();

  // top pill
  ctx.fillStyle = colorTone.soft;
  ctx.strokeStyle = colorTone.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(338, 150, 348, 80, 40);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = colorTone.accent;
  ctx.font = "700 34px Inter, Noto Sans KR, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("오늘의 운세", 512, 188);

  // zodiac centerpiece
  ctx.fillStyle = `${main}16`;
  ctx.beginPath();
  ctx.arc(512, 560, 212, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.arc(512, 560, 136, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(512, 560, 100, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colorTone.accent;
  ctx.font = "700 74px Inter, Noto Sans KR, sans-serif";
  ctx.fillText("별자리", 512, 548);
  ctx.font = "600 28px Inter, Noto Sans KR, sans-serif";
  ctx.fillText(profile.zodiac, 512, 624);

  // stars and small ornament
  const stars = [
    [302, 470, 22],
    [732, 462, 18],
    [260, 708, 16],
    [766, 730, 16],
  ];
  ctx.fillStyle = main;
  stars.forEach(([x, y, size]) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.strokeStyle = `${main}72`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(302, 470);
  ctx.lineTo(512, 360);
  ctx.lineTo(732, 462);
  ctx.stroke();

  // summary panel
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  ctx.roundRect(128, 860, 768, 418, 34);
  ctx.fill();

  ctx.fillStyle = colorTone.accent;
  ctx.font = "800 56px Inter, Noto Sans KR, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(profile.name, 512, 940);

  ctx.fillStyle = "#1d1d1d";
  ctx.font = "700 32px Inter, Noto Sans KR, sans-serif";
  ctx.fillText(`${profile.zodiac} · ${profile.mood}`, 512, 1000);

  ctx.font = "500 30px Noto Sans KR, sans-serif";
  ctx.textAlign = "left";
  wrapLines(
    ctx,
    profile.summary,
    178,
    1074,
    668,
    50,
    4,
  );

  // footer chips
  ctx.textAlign = "center";
  const chips = [
    profile.focus,
    `${profile.age}세`,
    `행운색 ${profile.color}`,
    `주의 ${profile.caution}`,
  ];

  let chipX = 178;
  const chipY = 1358;
  chips.forEach((chip, index) => {
    const width = ctx.measureText(chip).width + 56;
    ctx.fillStyle = index === 0 ? main : colorTone.soft;
    ctx.beginPath();
    ctx.roundRect(chipX, chipY, width, 58, 29);
    ctx.fill();
    ctx.strokeStyle = `${main}44`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = index === 0 ? "#ffffff" : colorTone.accent;
    ctx.font = "700 26px Inter, Noto Sans KR, sans-serif";
    ctx.fillText(chip, chipX + width / 2, chipY + 30);
    chipX += width + 16;
  });

  return canvas.toDataURL("image/png");
}

function buildProfile(rawDate, rawName) {
  const birthDate = new Date(`${rawDate}T12:00:00`);
  const today = new Date();
  const zodiac = getZodiac(birthDate);
  const age = getAge(birthDate, today);
  const lifePath = getLifePath(birthDate);
  const weekday = getWeekday(birthDate);
  const seasonKey = getSeason(birthDate.getMonth() + 1);
  const seasonLabel = {
    spring: "봄",
    summer: "여름",
    autumn: "가을",
    winter: "겨울",
  }[seasonKey];

  const seed = seedFromString(`${rawDate}-${rawName || "guest"}-${today.toDateString()}`);
  const rng = mulberry32(seed);
  const mood = classifyMood(Math.floor(68 + rng() * 28));
  const focus = pick(["소통", "정리", "회복", "준비", "기획", "실행"], rng);
  const caution = pick(["서두름", "과한 확신", "일정 충돌", "감정 소모", "지출 확대"], rng);
  const number = lifePath;
  const color = pick(["보라", "크림", "네이비", "민트", "버건디", "살구"], rng);
  const tip = birthTips[seasonKey];
  const profileType = profileWords[String(lifePath)] || "균형형";
  const name = rawName.trim() || "당신";
  const birthdayLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(birthDate);

  return {
    name,
    rawDate,
    birthdayLabel,
    zodiac,
    age,
    lifePath,
    weekday,
    seasonLabel,
    profileType,
    mood,
    focus,
    caution,
    color,
    tip,
    luckyNumber: number,
    summary: `${name}님은 ${birthdayLabel} 출생, ${weekday}에 태어난 ${zodiac} 타입입니다. 만 ${age}세이고, 생일 숫자 ${lifePath}은(는) ${profileType} 성향으로 읽힙니다.`,
    detail: `오늘의 참고 흐름은 ${mood}입니다. 키워드는 ${focus}, 주의 포인트는 ${caution}, 잘 맞는 색은 ${color}입니다. ${seasonLabel} 기운과 ${tip} 흐름이 함께 들어와 있어요.`,
    todayTip: `오늘은 ${focus}에 집중하면 좋고, ${caution}만 조심하면 흐름이 더 깔끔합니다.`,
  };
}

function renderMessage(role, title, body, meta = "") {
  const article = document.createElement("article");
  article.className = `bubble bubble-${role}`;
  article.innerHTML = `
    <div class="bubble-head">
      <strong>${escapeHTML(title)}</strong>
      ${meta ? `<span>${escapeHTML(meta)}</span>` : ""}
    </div>
    <div class="bubble-body">${body}</div>
  `;
  chatLog.appendChild(article);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function renderBotResponse(profile, mode = "summary") {
  const title = mode === "today" ? "오늘 팁" : "정보 결과";
  const meta = `${profile.birthdayLabel} · ${profile.zodiac}`;
  const fortuneCard = createFortuneCard(profile);

  let body = "";

  if (mode === "today") {
    body = `
      <img class="fortune-art" src="${fortuneCard}" alt="${escapeHTML(profile.zodiac)} 운세 카드" />
      <p>${escapeHTML(profile.name)}님, 오늘은 <strong>${escapeHTML(profile.focus)}</strong> 쪽에 힘을 쓰면 좋습니다.</p>
      <p>${escapeHTML(profile.todayTip)}</p>
      <ul>
        <li>운세 분위기: ${escapeHTML(profile.mood)}</li>
        <li>행운 색: ${escapeHTML(profile.color)}</li>
        <li>주의 포인트: ${escapeHTML(profile.caution)}</li>
      </ul>
    `;
  } else if (mode === "detail") {
    body = `
      <img class="fortune-art" src="${fortuneCard}" alt="${escapeHTML(profile.zodiac)} 운세 카드" />
      <p>${escapeHTML(profile.summary)}</p>
      <ul>
        <li>생일 숫자: ${escapeHTML(String(profile.lifePath))} (${escapeHTML(profile.profileType)})</li>
        <li>태어난 요일: ${escapeHTML(profile.weekday)}</li>
        <li>시즌 기운: ${escapeHTML(profile.seasonLabel)}</li>
        <li>오늘 키워드: ${escapeHTML(profile.focus)}</li>
        <li>주의 포인트: ${escapeHTML(profile.caution)}</li>
      </ul>
      <p>${escapeHTML(profile.detail)}</p>
    `;
  } else {
    body = `
      <img class="fortune-art" src="${fortuneCard}" alt="${escapeHTML(profile.zodiac)} 운세 카드" />
      <p>${escapeHTML(profile.summary)}</p>
      <ul>
        <li>만 나이: ${escapeHTML(String(profile.age))}세</li>
        <li>별자리: ${escapeHTML(profile.zodiac)}</li>
        <li>생일 숫자: ${escapeHTML(String(profile.lifePath))}</li>
        <li>핵심 키워드: ${escapeHTML(profile.focus)}</li>
      </ul>
    `;
  }

  renderMessage("bot", title, body, meta);
}

function updateSidebar(profile) {
  ageValue.textContent = `${profile.age}세`;
  zodiacValue.textContent = profile.zodiac;
  lifePathValue.textContent = String(profile.lifePath);
  keywordValue.textContent = profile.focus;

  previewTitle.textContent = `${profile.name}님 프로필`;
  previewText.textContent = `${profile.zodiac} · ${profile.profileType} · ${profile.mood}`;
  previewChipA.textContent = profile.focus;
  previewChipB.textContent = profile.seasonLabel;
  previewChipC.textContent = profile.caution;
}

function resetConversation() {
  chatLog.innerHTML = "";
  nameInput.value = "";
  birthInput.value = "";
  apiKeyInput.value = "";
  apiSecretInput.value = "";
  sessionStorage.removeItem("higgsfield_credentials");
  const introBody = `
    <p>안녕하세요. 생년월일을 입력해 주시면 기본 정보를 정리해서 알려드릴게요.</p>
    <p>이 봇은 만 나이, 별자리, 생일 숫자, 오늘의 체크포인트를 한 번에 읽기 쉽게 보여줍니다.</p>
  `;
  renderMessage("bot", "봇", introBody, "생년월일 입력 대기");
  ageValue.textContent = "-";
  zodiacValue.textContent = "-";
  lifePathValue.textContent = "-";
  keywordValue.textContent = "-";
  previewTitle.textContent = "입력 대기 중";
  previewText.textContent = "생년월일을 넣으면 봇이 바로 반응해서 기본 정보를 정리해 드립니다.";
  previewChipA.textContent = "별자리";
  previewChipB.textContent = "나이";
  previewChipC.textContent = "숫자";
  setSaveStatus("이름과 생년월일은 제출 시 저장됩니다.", "neutral");
}

async function saveProfileToDatabase(profile) {
  const response = await fetch("/api/save-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: profile.name,
      birthDate: profile.rawDate,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "저장에 실패했습니다.");
  }

  return data;
}

async function handleProfileSubmit(event, mode = "summary") {
  event.preventDefault();

  const rawDate = birthInput.value;
  const rawName = nameInput.value || "";
  const apiKey = apiKeyInput.value.trim();
  const apiSecret = apiSecretInput.value.trim();

  if (!rawDate) {
    renderMessage("bot", "봇", "<p>생년월일을 먼저 입력해 주세요.</p>", "입력 필요");
    return;
  }

  if (apiKey && apiSecret) {
    setSessionKeys(apiKey, apiSecret);
    setSaveStatus("Higgsfield 키를 받아 카드 생성 중입니다.", "loading");
  } else {
    sessionStorage.removeItem("higgsfield_credentials");
    setSaveStatus("Higgsfield 키 없이 로컬 카드로 생성합니다.", "neutral");
  }

  const birthDate = new Date(`${rawDate}T12:00:00`);
  if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) {
    renderMessage("bot", "봇", "<p>미래 날짜는 사용할 수 없어요. 다시 확인해 주세요.</p>", "입력 오류");
    return;
  }

  const displayName = rawName.trim() || "당신";
  const formattedDate = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(birthDate);

  renderMessage("user", displayName, `<p>${escapeHTML(formattedDate)} 생년월일로 확인해 주세요.</p>`);

  const profile = buildProfile(rawDate, rawName);
  updateSidebar(profile);

  setSaveStatus("Supabase에 저장 중...", "loading");
  try {
    await saveProfileToDatabase(profile);
    setSaveStatus("Supabase에 저장 완료되었습니다.", "success");
    renderMessage("bot", "봇", "<p>입력한 이름과 생년월일을 저장했어요.</p>", "저장 완료");
  } catch (error) {
    setSaveStatus("저장 실패: 잠시 후 다시 시도해 주세요.", "error");
    renderMessage("bot", "봇", `<p>저장은 실패했지만 정보 안내는 계속할 수 있어요.</p><p>${escapeHTML(error.message)}</p>`, "저장 오류");
  }

  renderBotResponse(profile, mode);
}

function wireQuickReplies() {
  quickRow.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mode]");
    if (!button) return;

    const mode = button.dataset.mode;
    if (!birthInput.value) {
      renderMessage("bot", "봇", "<p>먼저 생년월일을 입력해 주시면 더 정확하게 안내할 수 있어요.</p>", "입력 필요");
      return;
    }

    const profile = buildProfile(birthInput.value, nameInput.value || "");
    updateSidebar(profile);
    renderMessage("user", profile.name, `<p>${button.textContent} 부탁해요.</p>`);
    renderBotResponse(profile, mode);
  });
}

formatToday();
resetConversation();
wireQuickReplies();

birthForm.addEventListener("submit", (event) => handleProfileSubmit(event, "summary"));
resetBtn.addEventListener("click", () => {
  trackEvent("click_reset", {
    event_category: "engagement",
    event_label: "new_conversation",
  });
  resetConversation();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    resetConversation();
  }
});
