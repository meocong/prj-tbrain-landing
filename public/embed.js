<!-- /public/embed.js -->
<script>
(function () {
  // === Config từ <Script data-*> ===
  const currentScript = document.currentScript;
  const SERVICE_NAME = currentScript?.dataset?.chatService || "Chat";
  const ENDPOINT = currentScript?.dataset?.chatEndpoint || "/api/chat";
  const CHAT_WIDTH = currentScript?.dataset?.chatWidth || "450px";
  const CHAT_HEIGHT = currentScript?.dataset?.chatHeight || "600px";

  // === Style cơ bản cho nút mở chat ===
  const style = document.createElement("style");
  style.textContent = `
    @keyframes bounceGlow {
      0%, 100% { transform: translateY(0); box-shadow: 0 0 0 rgba(0,0,0,0); }
      50% { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
    }
    .tbrain-launcher {
      position: fixed; right: 20px; bottom: 20px; z-index: 2147483647;
      width: 56px; height: 56px; border-radius: 50%;
      background: #111827; color: #fff; display: flex; align-items: center; justify-content: center;
      cursor: pointer; border: none; outline: none; animation: bounceGlow 3s ease-in-out infinite;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    }
    .tbrain-badge {
      position: absolute; bottom: -22px; right: 0; left: 0; margin: 0 auto;
      background: #111827; color: #fff; padding: 6px 10px; font-size: 12px;
      border-radius: 999px; white-space: nowrap; transform: translateY(10px);
      opacity: 0; transition: all .25s ease;
      width: max-content; max-width: 160px; text-align: center;
    }
    .tbrain-launcher:hover + .tbrain-badge { transform: translateY(0); opacity: 1; }
    .tbrain-iframe-wrap {
      position: fixed; right: 80px; bottom: 60px; z-index: 2147483647; display: none;
      width: ${CSS.escape(CHAT_WIDTH)}; height: ${CSS.escape(CHAT_HEIGHT)};
      border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.25);
      background: #fff;
    }
    @media (max-width: 520px) {
      .tbrain-iframe-wrap { right: 10px; bottom: 100px; width: calc(100vw - 20px); height: calc(100vh - 140px); }
    }
  `;
  document.head.appendChild(style);

  // === Nút mở chat + badge ===
  const launcher = document.createElement("button");
  launcher.className = "tbrain-launcher";
  launcher.title = SERVICE_NAME;
  launcher.setAttribute("aria-label", SERVICE_NAME + " chat");
  launcher.innerHTML = `
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 8h10M7 12h7M21 12c0 4.418-4.03 8-9 8-.777 0-1.532-.089-2.25-.257L3 21l1.257-6.75C4.089 13.532 4 12.777 4 12c0-4.418 4.03-8 9-8s8 3.582 8 8Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const badge = document.createElement("div");
  badge.className = "tbrain-badge";
  badge.textContent = SERVICE_NAME;

  // === Khung iFrame chứa UI (srcdoc) ===
  const wrap = document.createElement("div");
  wrap.className = "tbrain-iframe-wrap";

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", SERVICE_NAME + " chat window");
  iframe.setAttribute("allow", "clipboard-read; clipboard-write");
  iframe.style.border = "none";
  iframe.style.width = "100%";
  iframe.style.height = "100%";

  // === HTML/CSS/JS của UI chat nhúng trực tiếp bằng srcdoc ===
  // - Gọi ENDPOINT bằng fetch, đọc stream SSE, hiển thị dần
  // - Lưu lịch sử tạm thời trong iFrame (memory), không dùng localStorage
  const uiHTML = `
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --bg:#ffffff; --fg:#0f172a; --sub:#475569; --pri:#111827; --mut:#e5e7eb; }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: var(--bg); color: var(--fg); }
  .chat { display:flex; flex-direction:column; height:100%; }
  .topbar { padding: 10px 12px; display:flex; align-items:center; gap:8px; background:#f8fafc; border-bottom:1px solid #e5e7eb; }
  .topbar .dot { width:8px; height:8px; border-radius:50%; background:#10b981; }
  .title { font-weight:600; font-size:14px; }
  .area { flex:1; overflow:auto; padding: 14px; background: #fff; }
  .msg { max-width: 90%; padding: 10px 12px; border-radius: 14px; margin: 10px 0; line-height: 1.4; font-size: 14px; border: 1px solid var(--mut); }
  .user { background:#111827; color:#fff; margin-left:auto; border-color:#111827; }
  .bot { background:#f8fafc; color:#0f172a; margin-right:auto; }
  .inputbar { padding: 12px; border-top:1px solid #e5e7eb; background:#fff; display:flex; gap:8px; }
  .ipt { flex:1; border:1px solid #e5e7eb; border-radius: 999px; padding: 10px 14px; font-size:14px; outline: none; }
  .btn { background:#111827; color:#fff; border:none; border-radius:999px; padding: 10px 16px; font-weight:600; cursor:pointer; }
  .btn[disabled] { opacity:.6; cursor: not-allowed; }
  .hint { font-size: 12px; color: var(--sub); padding: 0 14px 10px; }
  .source { font-size: 12px; color: #334155; margin-top:6px; opacity:.9; }
</style>
</head>
<body>
  <div class="chat">
    <div class="topbar">
      <div class="dot" aria-hidden="true"></div>
      <div class="title">${SERVICE_NAME}</div>
    </div>
    <div id="area" class="area" role="log" aria-live="polite" aria-relevant="additions"></div>
    <div class="hint">Bạn có thể hỏi bằng tiếng Việt hoặc tiếng Anh.</div>
    <form id="form" class="inputbar">
      <input id="ipt" class="ipt" name="message" placeholder="Nhập nội dung..." autocomplete="off" />
      <button id="btn" class="btn" type="submit">Gửi</button>
    </form>
  </div>
<script>
(function () {
  const ENDPOINT = ${JSON.stringify(ENDPOINT)};
  const area = document.getElementById('area');
  const form = document.getElementById('form');
  const ipt = document.getElementById('ipt');
  const btn = document.getElementById('btn');

  /** Cuộn xuống cuối khung tin nhắn */
  function scrollToBottom() { requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; }); }

  /** Tạo bubble tin nhắn */
  function bubble(role, text) {
    const div = document.createElement('div');
    div.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
    div.textContent = text || '';
    area.appendChild(div);
    scrollToBottom();
    return div;
  }

  /** Gửi prompt và xử lý stream SSE từ server */
  async function sendMessage(message) {
    // Hiển thị user bubble
    bubble('user', message);

    // Tạo bubble bot rỗng để append dần
    const bot = bubble('assistant', '');

    // Gọi API (body là mảng messages đơn giản)
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: message }] }),
    });

    if (!res.ok || !res.body) {
      bot.textContent = 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.';
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    // Đọc chunk theo SSE: 'data: ...\\n\\n'
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\\n\\n');
      buffer = parts.pop() || '';
      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') { break; }
        try {
          const json = JSON.parse(payload);
          if (json.type === 'text' && typeof json.content === 'string') {
            bot.textContent += json.content;
            scrollToBottom();
          }
          // Nếu backend đính kèm sources -> hiển thị chung phía cuối
          if (json.type === 'final' && Array.isArray(json.sources) && json.sources.length) {
            const src = document.createElement('div');
            src.className = 'source';
            src.innerHTML = '<strong>Nguồn tham khảo:</strong><br>' + json.sources.map(s => '- ' + s).join('<br>');
            area.appendChild(src);
            scrollToBottom();
          }
        } catch (_) {}
      }
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = ipt.value.trim();
    if (!msg) return;
    ipt.value = ''; btn.disabled = true;
    try { await sendMessage(msg); } finally { btn.disabled = false; }
  });

  // Lời chào ban đầu
  bubble('assistant', 'Xin chào! Mình là ' + ${JSON.stringify(SERVICE_NAME)} + '. Mình có thể giúp gì cho bạn?');
})();
</script>
</body>
</html>
  `;

  iframe.srcdoc = uiHTML;
  wrap.appendChild(iframe);

  // === Toggle mở/đóng ===
  let open = false;
  function toggle() {
    open = !open;
    wrap.style.display = open ? "block" : "none";
  }
  launcher.addEventListener("click", toggle);

  // === Gắn vào trang ===
  document.body.appendChild(launcher);
  document.body.appendChild(badge);
  document.body.appendChild(wrap);
})();
</script>
