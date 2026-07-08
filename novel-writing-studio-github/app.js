const STORAGE_KEY = "novel-writing-studio:v1";

const defaultState = {
  projectTitle: "我的长篇小说",
  activeChapterId: "chapter-1",
  chapters: [
    {
      id: "chapter-1",
      title: "第一章",
      status: "draft",
      target: 1200,
      summary: "本章摘要会帮助 AI 快速理解前文。",
      content: "雨停在凌晨三点。\n\n"
    }
  ],
  snapshots: [],
  characters: [
    {
      id: "character-1",
      title: "主角",
      body: "目标：\n性格：\n秘密：\n关系："
    }
  ],
  outline: [
    {
      id: "outline-1",
      title: "主线",
      body: "开端：\n转折：\n高潮：\n结局："
    }
  ],
  world: [
    {
      id: "world-1",
      title: "核心设定",
      body: "时代背景：\n地点：\n规则："
    }
  ],
  memory: [
    {
      id: "memory-1",
      title: "不可忘记",
      body: "已经确认的剧情、人物关系、伏笔和禁改设定都放在这里。"
    }
  ],
  settings: {
    preset: "custom",
    baseUrl: "",
    endpointPath: "/chat/completions",
    apiKey: "",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    extraHeaders: "",
    model: "",
    temperature: 0.8,
    maxTokens: 2000,
    apiSendConsent: false
  }
};

const taskLabels = {
  continue: "续写当前章节",
  polish: "润色选中内容",
  expand: "扩写当前片段",
  check: "检查设定矛盾",
  outline: "生成后续大纲",
  memory_extract: "提取长期记忆"
};

const apiPresets = {
  custom: {
    baseUrl: "",
    endpointPath: "/chat/completions",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    extraHeaders: "",
    model: "",
    requiresKey: true,
    hints: ["gpt-4.1", "deepseek-chat", "qwen-plus", "glm-4"],
    note: "适合接入任意 OpenAI 兼容接口。后期可以自由修改接口地址、模型名和 API Key。"
  },
  ollama: {
    baseUrl: "http://localhost:11434/v1",
    endpointPath: "/chat/completions",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    extraHeaders: "",
    model: "qwen2.5:7b",
    requiresKey: false,
    hints: ["qwen2.5:7b", "llama3.1:8b", "gemma3:4b", "deepseek-r1:7b"],
    note: "本地免费方案，不需要 API Key。需要先在本机安装并启动 Ollama，且已拉取对应模型。"
  },
  lmstudio: {
    baseUrl: "http://localhost:1234/v1",
    endpointPath: "/chat/completions",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    extraHeaders: "",
    model: "local-model",
    requiresKey: false,
    hints: ["local-model"],
    note: "本地免费方案，不需要 API Key。需要先在 LM Studio 中启动 OpenAI Compatible Server。"
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    endpointPath: "/chat/completions",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    extraHeaders: "",
    model: "openrouter/auto",
    requiresKey: true,
    hints: ["openrouter/auto", "请在 OpenRouter 选择带 :free 后缀的可用模型"],
    note: "在线聚合服务，需要用户自己的 API Key。可在 OpenRouter 后台选择当前可用的免费模型。"
  },
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    endpointPath: "/chat/completions",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    extraHeaders: "",
    model: "llama-3.1-8b-instant",
    requiresKey: true,
    hints: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"],
    note: "在线服务，需要用户自己的 API Key。免费额度和可用模型以 Groq 账号后台为准。"
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    endpointPath: "/chat/completions",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    extraHeaders: "",
    model: "deepseek-v4-flash",
    requiresKey: true,
    hints: ["deepseek-v4-flash", "deepseek-v4-pro", "deepseek-chat", "deepseek-reasoner"],
    note: "在线服务，需要用户自己的 API Key。模型名和价格以 DeepSeek 官方控制台为准。"
  }
};

const els = {};
let state = loadState();
let saveTimer;

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  bindEvents();
  renderAll();
});

function bindElements() {
  [
    "saveStatus",
    "projectTitle",
    "chapterList",
    "globalSearch",
    "searchResults",
    "addChapterBtn",
    "renameProjectBtn",
    "chapterTitle",
    "chapterSummary",
    "chapterStatus",
    "chapterTarget",
    "focusModeBtn",
    "editor",
    "wordCount",
    "progressCount",
    "memoryCount",
    "searchCount",
    "exportTxtBtn",
    "exportMdBtn",
    "aiTask",
    "aiWords",
    "aiStyle",
    "aiExtra",
    "runAiBtn",
    "insertAiBtn",
    "saveAiMemoryBtn",
    "clearAiBtn",
    "copyContextBtn",
    "aiOutput",
    "addCharacterBtn",
    "addOutlineBtn",
    "addWorldBtn",
    "addMemoryBtn",
    "extractMemoryBtn",
    "characterList",
    "outlineList",
    "worldList",
    "memoryList",
    "saveSnapshotBtn",
    "snapshotList",
    "apiPreset",
    "applyPresetBtn",
    "apiPresetNote",
    "modelHints",
    "apiBaseUrl",
    "apiEndpointPath",
    "apiKey",
    "apiAuthHeader",
    "apiAuthPrefix",
    "apiExtraHeaders",
    "apiModel",
    "apiTemperature",
    "apiMaxTokens",
    "apiSendConsent",
    "saveSettingsBtn",
    "testApiBtn",
    "exportBackupBtn",
    "importBackupInput",
    "clearApiKeyBtn",
    "settingsNote"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  els.projectTitle.addEventListener("input", () => {
    state.projectTitle = els.projectTitle.value;
    scheduleSave();
  });

  els.renameProjectBtn.addEventListener("click", () => els.projectTitle.focus());
  els.addChapterBtn.addEventListener("click", addChapter);
  els.globalSearch.addEventListener("input", renderSearch);
  els.chapterTitle.addEventListener("input", updateActiveChapterTitle);
  els.chapterSummary.addEventListener("input", updateActiveChapterSummary);
  els.chapterStatus.addEventListener("change", updateActiveChapterMeta);
  els.chapterTarget.addEventListener("input", updateActiveChapterMeta);
  els.focusModeBtn.addEventListener("click", toggleFocusMode);
  els.editor.addEventListener("input", updateActiveChapterContent);
  els.exportTxtBtn.addEventListener("click", () => exportNovel("txt"));
  els.exportMdBtn.addEventListener("click", () => exportNovel("md"));

  els.addCharacterBtn.addEventListener("click", () => addRecord("characters", "新人物", "目标：\n性格：\n关系："));
  els.addOutlineBtn.addEventListener("click", () => addRecord("outline", "新大纲", "剧情目标：\n冲突：\n结果："));
  els.addWorldBtn.addEventListener("click", () => addRecord("world", "新设定", "设定内容：\n限制：\n影响："));
  els.addMemoryBtn.addEventListener("click", () => addRecord("memory", "新记忆", "事实：\n出现章节：\n后续影响："));
  els.extractMemoryBtn.addEventListener("click", extractMemoryPrompt);
  els.saveSnapshotBtn.addEventListener("click", saveChapterSnapshot);

  els.copyContextBtn.addEventListener("click", copyContext);
  els.runAiBtn.addEventListener("click", runAi);
  els.insertAiBtn.addEventListener("click", insertAiOutput);
  els.saveAiMemoryBtn.addEventListener("click", saveAiOutputAsMemory);
  els.clearAiBtn.addEventListener("click", () => {
    els.aiOutput.value = "";
  });
  els.apiPreset.addEventListener("change", () => {
    state.settings.preset = els.apiPreset.value;
    renderPresetHelp();
  });
  els.applyPresetBtn.addEventListener("click", applyApiPreset);
  els.saveSettingsBtn.addEventListener("click", saveSettingsFromForm);
  els.testApiBtn.addEventListener("click", testApi);
  els.exportBackupBtn.addEventListener("click", exportBackup);
  els.importBackupInput.addEventListener("change", importBackup);
  els.clearApiKeyBtn.addEventListener("click", clearApiKey);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(defaultState);
    return mergeState(defaultState, JSON.parse(raw));
  } catch {
    return clone(defaultState);
  }
}

function mergeState(base, saved) {
  const next = {
    ...clone(base),
    ...saved,
    settings: {
      ...base.settings,
      ...(saved.settings || {})
    }
  };
  next.chapters = (next.chapters || []).map((chapter) => ({
    ...chapter,
    status: chapter.status || "draft",
    target: Number(chapter.target || 0),
    summary: chapter.summary || "",
    content: chapter.content || ""
  }));
  next.snapshots = next.snapshots || [];
  return next;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  els.saveStatus.textContent = "已保存";
}

function scheduleSave() {
  els.saveStatus.textContent = "保存中";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 250);
  updateStats();
}

function renderAll() {
  els.projectTitle.value = state.projectTitle;
  renderChapters();
  renderActiveChapter();
  renderRecordList("characters", els.characterList);
  renderRecordList("outline", els.outlineList);
  renderRecordList("world", els.worldList);
  renderRecordList("memory", els.memoryList);
  renderSettings();
  renderSearch();
  updateStats();
}

function renderChapters() {
  els.chapterList.innerHTML = "";
  const query = normalizedQuery();
  const chapters = query
    ? state.chapters.filter((chapter) => matchText(query, chapter.title, chapter.summary, chapter.content))
    : state.chapters;

  chapters.forEach((chapter) => {
    const row = document.createElement("div");
    row.className = `chapter-item ${chapter.id === state.activeChapterId ? "active" : ""}`;

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.innerHTML = `<span class="chapter-name"></span><span class="chapter-meta"></span>`;
    openButton.querySelector(".chapter-name").textContent = chapter.title || "未命名章节";
    openButton.querySelector(".chapter-meta").textContent = chapterMetaText(chapter);
    openButton.addEventListener("click", () => {
      state.activeChapterId = chapter.id;
      renderChapters();
      renderActiveChapter();
      scheduleSave();
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.title = "删除章节";
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => deleteChapter(chapter.id));

    row.append(openButton, deleteButton);
    els.chapterList.appendChild(row);
  });

  if (!chapters.length) {
    const empty = document.createElement("div");
    empty.className = "chapter-empty";
    empty.textContent = "没有匹配的章节";
    els.chapterList.appendChild(empty);
  }
}

function chapterMetaText(chapter) {
  const words = countCjkWords(chapter.content);
  const status = statusLabel(chapter.status);
  const progress = chapter.target ? ` · ${Math.min(100, Math.round((words / chapter.target) * 100))}%` : "";
  const summary = chapter.summary ? " · 有摘要" : "";
  return `${status} · ${words} 字${progress}${summary}`;
}

function statusLabel(status) {
  return {
    draft: "草稿",
    revising: "修订",
    done: "完成"
  }[status] || "草稿";
}

function renderActiveChapter() {
  const chapter = getActiveChapter();
  els.chapterTitle.value = chapter?.title || "";
  els.chapterSummary.value = chapter?.summary || "";
  els.chapterStatus.value = chapter?.status || "draft";
  els.chapterTarget.value = chapter?.target || "";
  els.editor.value = chapter?.content || "";
  renderSnapshots();
  updateStats();
}

function renderRecordList(collection, container) {
  container.innerHTML = "";
  state[collection].forEach((record) => {
    const node = document.getElementById("itemTemplate").content.firstElementChild.cloneNode(true);
    const title = node.querySelector(".card-title");
    const body = node.querySelector(".card-body");
    const deleteButton = node.querySelector(".delete-btn");

    title.value = record.title;
    body.value = record.body;

    title.addEventListener("input", () => {
      record.title = title.value;
      scheduleSave();
    });

    body.addEventListener("input", () => {
      record.body = body.value;
      scheduleSave();
    });

    deleteButton.addEventListener("click", () => {
      state[collection] = state[collection].filter((item) => item.id !== record.id);
      renderRecordList(collection, container);
      scheduleSave();
    });

    container.appendChild(node);
  });
}

function renderSettings() {
  els.apiPreset.value = state.settings.preset || "custom";
  els.apiBaseUrl.value = state.settings.baseUrl;
  els.apiEndpointPath.value = state.settings.endpointPath ?? "/chat/completions";
  els.apiKey.value = state.settings.apiKey;
  els.apiAuthHeader.value = state.settings.authHeader || "Authorization";
  els.apiAuthPrefix.value = state.settings.authPrefix ?? "Bearer";
  els.apiExtraHeaders.value = state.settings.extraHeaders || "";
  els.apiModel.value = state.settings.model;
  els.apiTemperature.value = state.settings.temperature;
  els.apiMaxTokens.value = state.settings.maxTokens;
  els.apiSendConsent.checked = Boolean(state.settings.apiSendConsent);
  renderPresetHelp();
}

function renderPresetHelp() {
  const preset = apiPresets[els.apiPreset.value] || apiPresets.custom;
  els.apiPresetNote.textContent = preset.note;
  els.apiKey.placeholder = preset.requiresKey ? "sk-..." : "本地模型通常不需要填写";
  els.modelHints.innerHTML = "";
  preset.hints.forEach((hint) => {
    const option = document.createElement("option");
    option.value = hint;
    els.modelHints.appendChild(option);
  });
}

function applyApiPreset() {
  const presetKey = els.apiPreset.value;
  const preset = apiPresets[presetKey] || apiPresets.custom;
  state.settings.preset = presetKey;
  els.apiBaseUrl.value = preset.baseUrl;
  els.apiEndpointPath.value = preset.endpointPath;
  els.apiAuthHeader.value = preset.authHeader;
  els.apiAuthPrefix.value = preset.authPrefix;
  els.apiExtraHeaders.value = preset.extraHeaders;
  els.apiModel.value = preset.model;
  if (!preset.requiresKey) els.apiKey.value = "";
  renderPresetHelp();
  saveSettingsFromForm();
  els.settingsNote.textContent = preset.requiresKey
    ? "预设已应用。请填写你自己的 API Key。"
    : "本地预设已应用。请确认本机模型服务已经启动。";
}

function switchTab(tab) {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  document.querySelectorAll(".tab-page").forEach((page) => {
    page.classList.toggle("active", page.id === `${tab}Tab`);
  });
}

function getActiveChapter() {
  return state.chapters.find((chapter) => chapter.id === state.activeChapterId) || state.chapters[0];
}

function addChapter() {
  const chapter = {
    id: newId("chapter"),
    title: `第 ${state.chapters.length + 1} 章`,
    status: "draft",
    target: 1200,
    summary: "",
    content: ""
  };
  state.chapters.push(chapter);
  state.activeChapterId = chapter.id;
  renderChapters();
  renderActiveChapter();
  scheduleSave();
  els.chapterTitle.focus();
}

function deleteChapter(id) {
  if (state.chapters.length === 1) return;
  state.chapters = state.chapters.filter((chapter) => chapter.id !== id);
  if (state.activeChapterId === id) {
    state.activeChapterId = state.chapters[0].id;
  }
  renderChapters();
  renderActiveChapter();
  scheduleSave();
}

function updateActiveChapterTitle() {
  const chapter = getActiveChapter();
  if (!chapter) return;
  chapter.title = els.chapterTitle.value;
  renderSearch();
  scheduleSave();
}

function updateActiveChapterSummary() {
  const chapter = getActiveChapter();
  if (!chapter) return;
  chapter.summary = els.chapterSummary.value;
  renderSearch();
  scheduleSave();
}

function updateActiveChapterMeta() {
  const chapter = getActiveChapter();
  if (!chapter) return;
  chapter.status = els.chapterStatus.value;
  chapter.target = Number(els.chapterTarget.value || 0);
  renderChapters();
  scheduleSave();
}

function updateActiveChapterContent() {
  const chapter = getActiveChapter();
  if (!chapter) return;
  chapter.content = els.editor.value;
  renderSearch();
  scheduleSave();
}

function toggleFocusMode() {
  document.body.classList.toggle("focus-mode");
  const enabled = document.body.classList.contains("focus-mode");
  els.focusModeBtn.textContent = enabled ? "退出专注" : "专注";
  els.editor.focus();
}

function addRecord(collection, title, body) {
  state[collection].push({
    id: newId(collection),
    title,
    body
  });
  renderRecordList(collection, els[`${singularKey(collection)}List`]);
  scheduleSave();
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function singularKey(collection) {
  return {
    characters: "character",
    outline: "outline",
    world: "world",
    memory: "memory"
  }[collection];
}

function saveSettingsFromForm() {
  state.settings = {
    preset: els.apiPreset.value,
    baseUrl: els.apiBaseUrl.value.trim().replace(/\/$/, ""),
    endpointPath: normalizeEndpointPath(els.apiEndpointPath.value),
    apiKey: els.apiKey.value.trim(),
    authHeader: els.apiAuthHeader.value.trim() || "Authorization",
    authPrefix: els.apiAuthPrefix.value.trim(),
    extraHeaders: els.apiExtraHeaders.value.trim(),
    model: els.apiModel.value.trim(),
    temperature: Number(els.apiTemperature.value || 0.8),
    maxTokens: Number(els.apiMaxTokens.value || 2000),
    apiSendConsent: els.apiSendConsent.checked
  };
  els.settingsNote.textContent = "设置已保存到本地浏览器。";
  scheduleSave();
}

function updateStats() {
  const chapter = getActiveChapter();
  const totalMemory = state.characters.length + state.outline.length + state.world.length + state.memory.length;
  const words = countCjkWords(chapter?.content || "");
  const target = Number(chapter?.target || 0);
  els.wordCount.textContent = `${words} 字`;
  els.progressCount.textContent = target ? `目标 ${target} · ${Math.min(100, Math.round((words / target) * 100))}%` : "";
  els.memoryCount.textContent = `${totalMemory} 条记忆`;
}

function renderSearch() {
  const query = normalizedQuery();
  renderChapters();
  if (!query) {
    els.searchCount.textContent = "";
    els.searchResults.innerHTML = "";
    return;
  }

  const results = [
    ...state.chapters
      .filter((chapter) => matchText(query, chapter.title, chapter.summary, chapter.content))
      .map((chapter) => ({ type: "章节", tab: null, title: chapter.title, detail: chapter.summary || `${countCjkWords(chapter.content)} 字`, id: chapter.id })),
    ...searchRecords(query, "人物", "characters"),
    ...searchRecords(query, "大纲", "outline"),
    ...searchRecords(query, "世界观", "world"),
    ...searchRecords(query, "长期记忆", "memory")
  ];

  els.searchCount.textContent = `${results.length} 个匹配`;
  els.searchResults.innerHTML = "";

  results.slice(0, 12).forEach((result) => {
    const button = document.createElement("button");
    button.className = "search-result";
    button.type = "button";
    button.innerHTML = `<strong></strong><small></small>`;
    button.querySelector("strong").textContent = `${result.type} · ${result.title}`;
    button.querySelector("small").textContent = result.detail.slice(0, 42) || "匹配到内容";
    button.addEventListener("click", () => {
      if (result.type === "章节") {
        state.activeChapterId = result.id;
        renderChapters();
        renderActiveChapter();
      } else {
        switchTab(result.tab);
      }
    });
    els.searchResults.appendChild(button);
  });
}

function searchRecords(query, type, collection) {
  const tabMap = {
    characters: "characters",
    outline: "outline",
    world: "world",
    memory: "memory"
  };
  return state[collection]
    .filter((item) => matchText(query, item.title, item.body))
    .map((item) => ({
      type,
      tab: tabMap[collection],
      title: item.title,
      detail: item.body
    }));
}

function normalizedQuery() {
  return (els.globalSearch?.value || "").trim().toLowerCase();
}

function matchText(query, ...parts) {
  return parts.join("\n").toLowerCase().includes(query);
}

function countCjkWords(text) {
  const cjk = text.match(/[\u4e00-\u9fff]/g)?.length || 0;
  const words = text.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9]+/g)?.length || 0;
  return cjk + words;
}

function buildContext() {
  const chapter = getActiveChapter();
  const selected = els.editor.value.slice(els.editor.selectionStart, els.editor.selectionEnd);
  const task = els.aiTask.value;

  if (task === "memory_extract") return buildMemoryExtractionContext(chapter);

  return [
    "你是一个小说创作助手。请优先遵守已经确认的设定，不要擅自改写人物关系、世界规则和既定伏笔。",
    "",
    `任务：${taskLabels[task]}`,
    `目标字数：${els.aiWords.value || 800}`,
    `风格要求：${els.aiStyle.value || "保持当前文风"}`,
    `额外要求：${els.aiExtra.value || "无"}`,
    "",
    sectionText("长期记忆", state.memory),
    sectionText("人物卡", state.characters),
    sectionText("世界观", state.world),
    sectionText("大纲", state.outline),
    chapterSummaryText(),
    "",
    `当前章节：${chapter?.title || ""}`,
    chapter?.content || "",
    selected ? `\n选中内容：\n${selected}` : "",
    "",
    outputRule(task)
  ].join("\n");
}

function chapterSummaryText() {
  const lines = state.chapters
    .filter((chapter) => chapter.summary?.trim())
    .map((chapter) => `- ${chapter.title}：${chapter.summary.trim()}`);
  return lines.length ? `章节摘要：\n${lines.join("\n")}` : "章节摘要：暂无";
}

function sectionText(title, records) {
  if (!records.length) return `${title}：无`;
  const lines = records.map((item, index) => {
    return `${index + 1}. ${item.title}\n${item.body}`;
  });
  return `${title}：\n${lines.join("\n\n")}`;
}

function outputRule(task) {
  if (task === "check") return "请输出发现的问题、涉及设定、建议修复方式。";
  if (task === "outline") return "请输出接下来章节的大纲，每章包含目标、冲突、结尾钩子。";
  if (task === "memory_extract") return "请严格按记忆卡格式输出。";
  return "只输出可直接放入小说正文的内容，不要解释创作过程。";
}

async function copyContext() {
  const context = buildContext();
  try {
    await navigator.clipboard.writeText(context);
    els.aiOutput.value = "上下文已复制，可以粘贴到任意 AI 工具里使用。";
  } catch {
    els.aiOutput.value = context;
    els.aiOutput.select();
  }
}

function extractMemoryPrompt() {
  const chapter = getActiveChapter();
  if (!chapter) return;

  els.aiTask.value = "memory_extract";
  els.aiOutput.value = buildMemoryExtractionContext(chapter);
  switchTab("assistant");
}

function buildMemoryExtractionContext(chapter) {
  const prompt = [
    "请从下面章节中提取适合放进长期记忆库的内容。",
    "",
    "请严格按以下卡片格式输出，每条记忆一张卡：",
    "",
    "【记忆】标题",
    "分类：已确认事实 / 人物变化 / 人物关系 / 世界观规则 / 伏笔 / 后续限制",
    "内容：这条记忆的具体内容",
    "来源：章节名或场景",
    "重要度：高 / 中 / 低",
    "【结束】",
    "",
    "要求：只提取对后文有影响的内容，不要复述普通情节。",
    "如果没有值得长期记录的内容，请输出：无长期记忆。",
    "",
    `章节：${chapter.title}`,
    `本章摘要：${chapter.summary || "暂无"}`,
    "",
    chapter.content
  ].join("\n");

  return prompt;
}

function saveAiOutputAsMemory() {
  const text = els.aiOutput.value.trim();
  if (!text) return;

  const cards = parseMemoryCards(text);
  if (!cards.length) {
    els.aiOutput.value = `${text}\n\n---\n没有识别到可保存的记忆卡。建议让 AI 使用“【记忆】...【结束】”格式输出。`;
    return;
  }

  const existing = new Set(state.memory.map((item) => normalizeMemoryKey(item.title, item.body)));
  const freshCards = cards.filter((card) => !existing.has(normalizeMemoryKey(card.title, card.body)));

  freshCards.forEach((card) => {
    state.memory.push({
      id: newId("memory"),
      title: card.title,
      body: card.body
    });
  });

  renderRecordList("memory", els.memoryList);
  renderSearch();
  updateStats();
  scheduleSave();
  switchTab("memory");

  const skipped = cards.length - freshCards.length;
  els.aiOutput.value = `已保存 ${freshCards.length} 条长期记忆${skipped ? `，跳过 ${skipped} 条重复记忆` : ""}。`;
}

function parseMemoryCards(text) {
  const structured = [...text.matchAll(/【记忆】\s*([^\n\r]*)\s*([\s\S]*?)【结束】/g)]
    .map((match) => buildMemoryCard(match[1], match[2]))
    .filter(Boolean);

  if (structured.length) return structured;
  return parseLooseMemoryCards(text);
}

function buildMemoryCard(rawTitle, rawBody) {
  const title = rawTitle.trim() || findField(rawBody, "标题") || "未命名记忆";
  const category = findField(rawBody, "分类");
  const content = findField(rawBody, "内容");
  const source = findField(rawBody, "来源");
  const importance = findField(rawBody, "重要度");

  const bodyParts = [];
  if (category) bodyParts.push(`分类：${category}`);
  if (content) bodyParts.push(`内容：${content}`);
  if (source) bodyParts.push(`来源：${source}`);
  if (importance) bodyParts.push(`重要度：${importance}`);

  const body = bodyParts.length ? bodyParts.join("\n") : rawBody.trim();
  if (!body) return null;
  return { title, body };
}

function findField(text, field) {
  const pattern = new RegExp(`^${field}[：:]\\s*(.+)$`, "m");
  return text.match(pattern)?.[1]?.trim() || "";
}

function parseLooseMemoryCards(text) {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block && !/无长期记忆/.test(block))
    .map((block, index) => {
      const lines = block.split(/\n/).map((line) => line.trim()).filter(Boolean);
      const first = lines[0]?.replace(/^[-*序号\d.、\s]+/, "") || `记忆 ${index + 1}`;
      const title = first.length > 28 ? `记忆 ${index + 1}` : first;
      return {
        title,
        body: block
      };
    })
    .slice(0, 12);
}

function normalizeMemoryKey(title, body) {
  return `${title}\n${body}`.replace(/\s+/g, "").toLowerCase();
}

function saveChapterSnapshot() {
  const chapter = getActiveChapter();
  if (!chapter) return;
  state.snapshots.unshift({
    id: newId("snapshot"),
    chapterId: chapter.id,
    chapterTitle: chapter.title || "未命名章节",
    title: `${chapter.title || "未命名章节"} · ${formatDateTime(new Date())}`,
    createdAt: new Date().toISOString(),
    status: chapter.status || "draft",
    target: Number(chapter.target || 0),
    summary: chapter.summary || "",
    content: chapter.content || "",
    wordCount: countCjkWords(chapter.content || "")
  });
  state.snapshots = state.snapshots.slice(0, 80);
  renderSnapshots();
  scheduleSave();
}

function renderSnapshots() {
  if (!els.snapshotList) return;
  const chapter = getActiveChapter();
  const snapshots = state.snapshots.filter((item) => item.chapterId === chapter?.id);
  els.snapshotList.innerHTML = "";

  if (!snapshots.length) {
    const empty = document.createElement("div");
    empty.className = "snapshot-empty";
    empty.textContent = "当前章节还没有快照。";
    els.snapshotList.appendChild(empty);
    return;
  }

  snapshots.forEach((snapshot) => {
    const card = document.createElement("article");
    card.className = "snapshot-card";

    const info = document.createElement("div");
    info.className = "snapshot-info";
    info.innerHTML = "<strong></strong><small></small>";
    info.querySelector("strong").textContent = snapshot.title;
    info.querySelector("small").textContent = `${statusLabel(snapshot.status)} · ${snapshot.wordCount} 字`;

    const actions = document.createElement("div");
    actions.className = "snapshot-actions";

    const restore = document.createElement("button");
    restore.className = "secondary-btn";
    restore.type = "button";
    restore.textContent = "恢复";
    restore.addEventListener("click", () => restoreSnapshot(snapshot.id));

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.type = "button";
    remove.title = "删除快照";
    remove.textContent = "×";
    remove.addEventListener("click", () => deleteSnapshot(snapshot.id));

    actions.append(restore, remove);
    card.append(info, actions);
    els.snapshotList.appendChild(card);
  });
}

function restoreSnapshot(id) {
  const snapshot = state.snapshots.find((item) => item.id === id);
  const chapter = getActiveChapter();
  if (!snapshot || !chapter) return;
  saveChapterSnapshot();
  chapter.title = snapshot.chapterTitle;
  chapter.status = snapshot.status || "draft";
  chapter.target = Number(snapshot.target || 0);
  chapter.summary = snapshot.summary || "";
  chapter.content = snapshot.content || "";
  renderChapters();
  renderActiveChapter();
  scheduleSave();
}

function deleteSnapshot(id) {
  state.snapshots = state.snapshots.filter((item) => item.id !== id);
  renderSnapshots();
  scheduleSave();
}

function formatDateTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function exportBackup() {
  const backup = clone(state);
  backup.settings = {
    ...backup.settings,
    apiKey: ""
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `${state.projectTitle || "novel"}-backup-${date}.json`;
  link.click();
  URL.revokeObjectURL(url);
  els.settingsNote.textContent = "本地备份已导出，备份文件不包含 API Key。";
}

function importBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(String(reader.result || "{}"));
      const currentApiKey = state.settings.apiKey;
      state = mergeState(defaultState, imported);
      state.settings.apiKey = currentApiKey;
      if (!state.chapters.length) state.chapters = clone(defaultState.chapters);
      state.activeChapterId = state.chapters.some((chapter) => chapter.id === state.activeChapterId)
        ? state.activeChapterId
        : state.chapters[0].id;
      renderAll();
      saveState();
      els.settingsNote.textContent = "备份已导入。为了安全，当前 API Key 没有被覆盖。";
    } catch (error) {
      els.settingsNote.textContent = `导入失败：${error.message}`;
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function clearApiKey() {
  state.settings.apiKey = "";
  els.apiKey.value = "";
  scheduleSave();
  els.settingsNote.textContent = "API Key 已从本地设置中清除。";
}

function normalizeEndpointPath(path) {
  const trimmed = path.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function buildApiUrl() {
  const baseUrl = state.settings.baseUrl.replace(/\/$/, "");
  const endpointPath = state.settings.endpointPath || "";
  return endpointPath ? `${baseUrl}${endpointPath}` : baseUrl;
}

function currentPresetRequiresKey() {
  const preset = apiPresets[state.settings.preset || els.apiPreset.value] || apiPresets.custom;
  return preset.requiresKey;
}

function buildApiHeaders() {
  const headers = {
    "Content-Type": "application/json"
  };
  const apiKey = state.settings.apiKey;
  if (apiKey) {
    const headerName = state.settings.authHeader || "Authorization";
    const prefix = state.settings.authPrefix || "";
    headers[headerName] = prefix ? `${prefix} ${apiKey}` : apiKey;
  }
  Object.assign(headers, parseExtraHeaders());
  return headers;
}

function parseExtraHeaders() {
  const raw = state.settings.extraHeaders?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      throw new Error("额外 Headers 必须是 JSON 对象。");
    }
    return parsed;
  } catch (error) {
    throw new Error(`额外 Headers JSON 无效：${error.message}`);
  }
}

async function runAi() {
  saveSettingsFromForm();
  const { baseUrl, apiKey, model, temperature, maxTokens, apiSendConsent } = state.settings;
  if (!baseUrl || !model || (currentPresetRequiresKey() && !apiKey)) {
    els.aiOutput.value = currentPresetRequiresKey()
      ? "请先在设置里填写接口地址、API Key 和模型名称。"
      : "请先在设置里填写接口地址和模型名称。";
    switchTab("settings");
    return;
  }

  if (!apiSendConsent) {
    els.aiOutput.value = "请先在设置里勾选发送确认。工具不会把正文发给我们，但点击生成会把上下文发给你自己配置的 API 服务商。";
    switchTab("settings");
    return;
  }

  els.aiOutput.value = "生成中...";
  els.runAiBtn.disabled = true;

  try {
    const response = await fetch(buildApiUrl(), {
      method: "POST",
      headers: buildApiHeaders(),
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "你是严谨的中文小说创作助手，擅长维护长篇设定一致性。"
          },
          {
            role: "user",
            content: buildContext()
          }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    const data = await response.json();
    els.aiOutput.value = data.choices?.[0]?.message?.content?.trim() || "没有收到模型输出。";
  } catch (error) {
    els.aiOutput.value = `调用失败：${error.message}`;
  } finally {
    els.runAiBtn.disabled = false;
  }
}

async function testApi() {
  saveSettingsFromForm();
  const { baseUrl, apiKey, model } = state.settings;
  if (!baseUrl || !model || (currentPresetRequiresKey() && !apiKey)) {
    els.settingsNote.textContent = currentPresetRequiresKey()
      ? "请先填完整接口地址、API Key 和模型名称。"
      : "请先填完整接口地址和模型名称。";
    return;
  }

  els.settingsNote.textContent = "测试中...";
  try {
    const response = await fetch(buildApiUrl(), {
      method: "POST",
      headers: buildApiHeaders(),
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "请回复：连接成功" }],
        max_tokens: 20
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    els.settingsNote.textContent = data.choices?.[0]?.message?.content || "连接成功。";
  } catch (error) {
    els.settingsNote.textContent = `测试失败：${error.message}`;
  }
}

function insertAiOutput() {
  const text = els.aiOutput.value.trim();
  if (!text) return;

  const start = els.editor.selectionStart;
  const end = els.editor.selectionEnd;
  const before = els.editor.value.slice(0, start);
  const after = els.editor.value.slice(end);
  const insert = `${start > 0 && !before.endsWith("\n") ? "\n\n" : ""}${text}`;

  els.editor.value = `${before}${insert}${after}`;
  els.editor.focus();
  els.editor.selectionStart = els.editor.selectionEnd = before.length + insert.length;
  updateActiveChapterContent();
}

function exportNovel(type) {
  const content = state.chapters
    .map((chapter) => {
      if (type === "md") return `# ${chapter.title}\n\n${chapter.content}`;
      return `${chapter.title}\n\n${chapter.content}`;
    })
    .join("\n\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.projectTitle || "novel"}.${type}`;
  link.click();
  URL.revokeObjectURL(url);
}
