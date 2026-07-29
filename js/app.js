// ============================================================
// AML Buddy desktop three-column interaction.
// Questions, answers, references, revision dates, and aspects are read only
// from js/data.js. Search only filters existing records.
// ============================================================

const CATEGORY_DEFS = [
  {id:"kyc", label:{zh:"KYC", en:"KYC", ja:"KYC"}},
  {id:"cdd-edd", label:{zh:"CDD/EDD", en:"CDD/EDD", ja:"CDD/EDD"}},
  {id:"wlf", label:{zh:"WLF", en:"WLF", ja:"WLF"}},
  {id:"sanctions", label:{zh:"國際制裁", en:"International Sanctions", ja:"国際制裁"}},
  {id:"overseas", label:{zh:"海外管理", en:"Overseas Management", ja:"海外管理"}}
];

const USEFUL_LINKS = [
  {
    label:{zh:"OFAC制裁名單查詢", en:"OFAC Sanctions List Search", ja:"OFAC制裁リスト検索"},
    url:"https://sanctionssearch.ofac.treas.gov/"
  },
  {
    label:{zh:"聯合國安理會制裁清單", en:"UN Security Council Consolidated List", ja:"国連安保理制裁統合リスト"},
    url:"https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list"
  },
  {
    label:{zh:"歐盟制裁地圖", en:"EU Sanctions Map", ja:"EU制裁マップ"},
    url:"https://www.sanctionsmap.eu/"
  }
];

const UI_TEXT = {
  zh: {
    documentTitle:"AML Buddy 互動原型 Demo",
    langLabel:"語言切換",
    searchLabel:"搜尋",
    searchPlaceholder:"實質受益人",
    searchResults:"符合問題",
    noSearchResults:"查無符合的問題，請洽洗防窗口",
    popularKeywords:"常見關鍵字",
    recentSearches:"最近搜尋",
    chooseBiz:"請選擇業務別",
    usefulSites:"常用網站",
    chooseQuestion:"請選擇您的問題",
    emptyAspectCategory:"尚無相關問題，內容陸續建置中",
    expandAll:"全部展開",
    collapseAll:"全部收合",
    emptyCategory:"此分類目前尚無常見問題",
    answerPanelTitle:"答案",
    emptyAnswer:"請根據左方分類選擇您的問題",
    refLabel:"參考",
    revisionDate:"最後修訂日期",
    staleNotice:"最新版本可能無法及時更新，請以iKnow知識平台公告為準",
    contactFooterButton:"洽詢洗防窗口",
    modalTitle:"聯絡洗防窗口",
    modalBody:"找不到您要的答案嗎？<br>請聯繫洗防部 AML 專責窗口：分機 1234<br>或內部信箱 aml-support@bank.internal",
    modalClose:"我知道了"
  },
  en: {
    documentTitle:"AML Buddy Interactive Demo",
    langLabel:"Language",
    searchLabel:"Search",
    searchPlaceholder:"Beneficial owner",
    searchResults:"Matching Questions",
    noSearchResults:"No matching questions. Contact the AML office",
    popularKeywords:"Common Keywords",
    recentSearches:"Recent Searches",
    chooseBiz:"Select Business Line",
    usefulSites:"Useful Sites",
    chooseQuestion:"Select Your Question",
    emptyAspectCategory:"No related questions yet. Content is being added.",
    expandAll:"Expand all",
    collapseAll:"Collapse all",
    emptyCategory:"No frequently asked questions in this category yet.",
    answerPanelTitle:"Answer",
    emptyAnswer:"Please select a question from the categories on the left.",
    refLabel:"Reference",
    revisionDate:"Last Revision Date",
    staleNotice:"The latest version may not be updated immediately. Please refer to iKnow knowledge platform announcements.",
    contactFooterButton:"Still cannot find an answer? Contact the AML office",
    modalTitle:"Contact AML Office",
    modalBody:"Cannot find the answer you need?<br>Please contact the AML Office: extension 1234<br>or internal mailbox aml-support@bank.internal",
    modalClose:"Got it"
  },
  ja: {
    documentTitle:"AML Buddy インタラクティブデモ",
    langLabel:"言語切替",
    searchLabel:"検索",
    searchPlaceholder:"実質的支配者",
    searchResults:"該当する質問",
    noSearchResults:"該当する質問がありません。AML窓口へお問い合わせください",
    popularKeywords:"よく使うキーワード",
    recentSearches:"最近の検索",
    chooseBiz:"業務区分を選択してください",
    usefulSites:"よく使うサイト",
    chooseQuestion:"質問を選択してください",
    emptyAspectCategory:"関連する質問はまだありません。内容は順次追加中です。",
    expandAll:"すべて展開",
    collapseAll:"すべて閉じる",
    emptyCategory:"この分類には現在よくある質問がありません。",
    answerPanelTitle:"回答",
    emptyAnswer:"左側の分類から質問を選択してください。",
    refLabel:"参考",
    revisionDate:"最終改訂日",
    staleNotice:"最新版が即時に反映されない場合があります。iKnow知識プラットフォームの公告を基準にしてください。",
    contactFooterButton:"答えが見つかりませんか？AML窓口へお問い合わせください",
    modalTitle:"AML窓口へ連絡",
    modalBody:"必要な回答が見つかりませんか？<br>AML専責窓口：内線 1234<br>または内部メール aml-support@bank.internal へご連絡ください",
    modalClose:"確認しました"
  }
};

let currentLang = "zh";
let selectedBiz = Object.keys(DB)[0] || "";
let expandedAspects = new Set();
let expandedCategories = new Set();
let selectedQuestion = null;
let searchQuery = "";
let recentSearches = [];
let recentSearchTimer = null;

function t(key){
  return UI_TEXT[currentLang][key];
}

function localize(value){
  if(value && typeof value === "object"){
    return value[currentLang] || value.zh || value.en || value.ja || "";
  }
  return value || "";
}

function allLocalizedText(value){
  if(value && typeof value === "object"){
    return Object.values(value).join(" ");
  }
  return value || "";
}

function normalizeSearch(value){
  return String(value || "").trim().toLocaleLowerCase();
}

function getSearchTerms(query){
  const normalizedQuery = normalizeSearch(query);
  if(!normalizedQuery){
    return [];
  }

  const terms = [String(query)];
  SEARCH_KEYWORDS.forEach(keyword => {
    const keywordText = [
      allLocalizedText(keyword.label),
      allLocalizedText(keyword.query)
    ].join(" ");

    if(normalizeSearch(keywordText).includes(normalizedQuery) || normalizedQuery.includes(normalizeSearch(localize(keyword.label)))){
      terms.push(...Object.values(keyword.query));
    }
  });

  return [...new Set(terms.filter(Boolean))];
}

function formatQuestionCount(count){
  return String(count);
}

function escapeHtml(value){
  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function getBizEntries(){
  return Object.entries(DB).map(([id, biz]) => ({id, ...biz}));
}

function getAspectEntries(){
  return Object.entries(ASPECTS).map(([id, label]) => ({id, label}));
}

function getGroupKey(aspectId, categoryId){
  return `${aspectId}:${categoryId}`;
}

function getTopicEntries(bizId, aspectId){
  return Object.entries(DB[bizId]?.aspects?.[aspectId]?.topics || {}).map(([id, topic]) => ({id, ...topic}));
}

function getAllTopicEntries(bizId){
  return getAspectEntries().flatMap(aspect =>
    getTopicEntries(bizId, aspect.id).map(topic => ({...topic, aspect:aspect.id}))
  );
}

function getTopic(bizId, aspectId, topicId){
  return DB[bizId]?.aspects?.[aspectId]?.topics?.[topicId];
}

function getQuestionCount(bizId){
  return getAllTopicEntries(bizId).reduce((sum, topic) => sum + topic.questions.length, 0);
}

function buildQuestionHaystack(bizId, aspectId, topic, item){
  const category = CATEGORY_DEFS.find(categoryItem => categoryItem.id === topic.category);
  const aspect = ASPECTS[aspectId];

  return [
    allLocalizedText(DB[bizId]?.label),
    allLocalizedText(category?.label),
    allLocalizedText(aspect),
    allLocalizedText(item.q),
    allLocalizedText(item.a),
    allLocalizedText(item.ref),
    item.revisionDate
  ].join(" ");
}

function questionMatches(bizId, aspectId, topic, item, query){
  const terms = getSearchTerms(query);
  if(terms.length === 0){
    return true;
  }
  const haystack = normalizeSearch(buildQuestionHaystack(bizId, aspectId, topic, item));
  return terms.some(term => haystack.includes(normalizeSearch(term)));
}

function findQuestionMatches(query){
  const matches = [];
  getBizEntries().forEach(biz => {
    getAspectEntries().forEach(aspect => {
      getTopicEntries(biz.id, aspect.id).forEach(topic => {
        topic.questions.forEach((item, idx) => {
          if(questionMatches(biz.id, aspect.id, topic, item, query)){
            matches.push({biz:biz.id, aspect:aspect.id, topic:topic.id, category:topic.category, idx});
          }
        });
      });
    });
  });
  return matches;
}

function getMatchDetail(match){
  const biz = DB[match.biz];
  const topic = getTopic(match.biz, match.aspect, match.topic);
  const item = topic?.questions?.[match.idx];
  const aspect = ASPECTS[match.aspect];
  const category = CATEGORY_DEFS.find(categoryItem => categoryItem.id === topic?.category);

  return {
    ...match,
    question:localize(item?.q),
    bizLabel:localize(biz?.label),
    aspectLabel:localize(aspect),
    categoryLabel:localize(category?.label)
  };
}

function recordRecentSearch(rawQuery){
  const query = String(rawQuery || "").trim();
  if(!query){
    return;
  }

  const normalizedQuery = normalizeSearch(query);
  recentSearches = [
    query,
    ...recentSearches.filter(item => normalizeSearch(item) !== normalizedQuery)
  ].slice(0,5);
}

function clearRecentSearchTimer(){
  if(recentSearchTimer){
    clearTimeout(recentSearchTimer);
    recentSearchTimer = null;
  }
}

function queueRecentSearch(rawQuery){
  clearRecentSearchTimer();
  const query = String(rawQuery || "").trim();
  if(!query){
    return;
  }

  recentSearchTimer = setTimeout(() => {
    recordRecentSearch(query);
    renderSearchDropdown();
    openSearchDropdown();
  }, 500);
}

function commitSearch(rawQuery){
  clearRecentSearchTimer();
  applySearch(rawQuery, {record:true});
  openSearchDropdown();
}

function buildCategoryGroups(bizId){
  const normalizedQuery = normalizeSearch(searchQuery);

  return getAspectEntries().map(aspect => ({
    ...aspect,
    categories:CATEGORY_DEFS.map(category => ({
      ...category,
      aspectId:aspect.id,
      categoryId:category.id,
      groupKey:getGroupKey(aspect.id, category.id),
      topics:getTopicEntries(bizId, aspect.id)
        .filter(topic => topic.category === category.id)
        .map(topic => ({
          ...topic,
          aspect:aspect.id,
          questions:normalizedQuery
            ? topic.questions.filter(item => questionMatches(bizId, aspect.id, topic, item, normalizedQuery))
            : topic.questions
        }))
        .filter(topic => !normalizedQuery || topic.questions.length > 0)
    }))
  }));
}

function getAllCategoryGroups(bizId){
  return buildCategoryGroups(bizId).flatMap(aspect => aspect.categories);
}

function getAllCategoryKeys(){
  return getAspectEntries().flatMap(aspect =>
    CATEGORY_DEFS.map(category => getGroupKey(aspect.id, category.id))
  );
}

function getAllAspectKeys(){
  return getAspectEntries().map(aspect => aspect.id);
}

function selectBiz(bizId){
  selectedBiz = bizId;
  expandedAspects = new Set();
  expandedCategories = new Set();
  selectedQuestion = null;
  clearRecentSearchTimer();
  searchQuery = "";
  render();
}

function toggleAspect(aspectId){
  if(expandedAspects.has(aspectId)){
    expandedAspects.delete(aspectId);
  }else{
    expandedAspects.add(aspectId);
  }
  render();
}

function toggleCategory(aspectId, categoryId){
  const groupKey = getGroupKey(aspectId, categoryId);
  if(expandedCategories.has(groupKey)){
    expandedCategories.delete(groupKey);
  }else{
    expandedCategories.add(groupKey);
  }
  render();
}

function toggleAllCategories(){
  const groups = getAllCategoryGroups(selectedBiz);
  const aspectKeys = getAllAspectKeys();
  const allOpen = aspectKeys.every(aspectId => expandedAspects.has(aspectId)) &&
    groups.every(group => expandedCategories.has(group.groupKey));
  expandedAspects = allOpen ? new Set() : new Set(aspectKeys);
  expandedCategories = allOpen ? new Set() : new Set(groups.map(group => group.groupKey));
  render();
}

function selectQuestion(aspectId, topicId, idx){
  selectedQuestion = {biz:selectedBiz, aspect:aspectId, topic:topicId, idx};
  render();
}

function jumpToAnswer(bizId, aspectId, topicId, idx){
  selectedBiz = bizId;
  const topic = getTopic(bizId, aspectId, topicId);
  if(topic){
    expandedAspects.add(aspectId);
    expandedCategories.add(getGroupKey(aspectId, topic.category));
  }
  selectedQuestion = {biz:bizId, aspect:aspectId, topic:topicId, idx};
  render();
}

function applySearch(rawQuery, options = {}){
  searchQuery = String(rawQuery || "").trim();

  if(options.record){
    recordRecentSearch(searchQuery);
  }

  if(!searchQuery){
    selectedQuestion = null;
    render();
    return;
  }

  const matches = findQuestionMatches(searchQuery);
  if(matches.length > 0){
    const selectedMatch = selectedQuestion && matches.find(match =>
      match.biz === selectedQuestion.biz &&
      match.aspect === selectedQuestion.aspect &&
      match.topic === selectedQuestion.topic &&
      match.idx === selectedQuestion.idx
    );
    const anchorMatch = selectedMatch || matches.find(match => match.biz === selectedBiz) || matches[0];
    selectedBiz = anchorMatch.biz;
    expandedAspects = new Set(
      matches
        .filter(match => match.biz === selectedBiz)
        .map(match => match.aspect)
    );
    expandedCategories = new Set(
      matches
        .filter(match => match.biz === selectedBiz)
        .map(match => getGroupKey(match.aspect, match.category))
    );
    if(!selectedMatch){
      selectedQuestion = null;
    }
  }else{
    selectedQuestion = null;
    expandedAspects = new Set(getAllAspectKeys());
    expandedCategories = new Set(getAllCategoryKeys());
  }

  render();
}

function changeLanguage(lang){
  if(lang !== currentLang){
    currentLang = lang;
    render();
  }
}

function closeModal(){
  document.getElementById("modalLayer").innerHTML = "";
}

function openContactModal(){
  document.getElementById("modalLayer").innerHTML = `
    <div class="modal-mask" role="presentation">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="contactTitle">
        <h4 id="contactTitle">${escapeHtml(t("modalTitle"))}</h4>
        <p>${t("modalBody")}</p>
        <button class="modal-close" type="button" onclick="closeModal()">${escapeHtml(t("modalClose"))}</button>
      </div>
    </div>`;
}

function renderBizPanel(){
  return `
    <aside class="app-panel biz-panel">
      <div class="biz-section">
        <div class="panel-head">
          <h2 class="panel-title">${escapeHtml(t("chooseBiz"))}</h2>
        </div>
        <div class="panel-body">
          <div class="biz-list">
            ${getBizEntries().map(biz => `
              <button class="biz-button ${biz.id === selectedBiz ? "is-active" : ""}" type="button" data-biz="${biz.id}">
                <span>
                  <span class="biz-name">${escapeHtml(localize(biz.label))}</span>
                </span>
                <span class="biz-count">${getQuestionCount(biz.id)}</span>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
      <div class="sites-section">
        <h3 class="sites-title">${escapeHtml(t("usefulSites"))}</h3>
        <div class="site-links">
          ${USEFUL_LINKS.map(link => `
            <a class="site-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(localize(link.label))}</a>
          `).join("")}
        </div>
      </div>
    </aside>`;
}

function renderQuestionList(group){
  const questionTotal = group.topics.reduce((sum, topic) => sum + topic.questions.length, 0);

  if(questionTotal === 0){
    return `<div class="empty-category">${escapeHtml(t("emptyAspectCategory"))}</div>`;
  }

  return `
    <div class="question-list">
      ${group.topics.map(topic => `
        ${topic.questions.map(item => {
          const sourceTopic = getTopic(selectedBiz, group.aspectId, topic.id);
          const idx = sourceTopic?.questions.indexOf(item) ?? -1;
          const isSelected = selectedQuestion &&
            selectedQuestion.biz === selectedBiz &&
            selectedQuestion.aspect === group.aspectId &&
            selectedQuestion.topic === topic.id &&
            selectedQuestion.idx === idx;

          return `
            <button class="question-button ${isSelected ? "is-selected" : ""}" type="button" data-aspect="${group.aspectId}" data-topic="${topic.id}" data-idx="${idx}">
              ${escapeHtml(localize(item.q))}
            </button>`;
        }).join("")}
      `).join("")}
    </div>`;
}

function renderCategoryPanel(){
  const aspectGroups = buildCategoryGroups(selectedBiz);
  const allGroups = aspectGroups.flatMap(aspect => aspect.categories);
  const aspectKeys = getAllAspectKeys();
  const allOpen = aspectKeys.every(aspectId => expandedAspects.has(aspectId)) &&
    allGroups.every(group => expandedCategories.has(group.groupKey));

  return `
    <section class="app-panel category-panel">
      <div class="panel-head">
        <div class="panel-head-row">
          <h2 class="panel-title">${escapeHtml(t("chooseQuestion"))}</h2>
          <button class="expand-all-btn" type="button" data-toggle-all="true">${escapeHtml(allOpen ? t("collapseAll") : t("expandAll"))}</button>
        </div>
      </div>
      <div class="panel-body">
        <div class="aspect-stack">
          ${aspectGroups.map(aspect => {
            const isAspectOpen = expandedAspects.has(aspect.id);
            const aspectQuestionTotal = aspect.categories.reduce((sum, group) =>
              sum + group.topics.reduce((topicSum, topic) => topicSum + topic.questions.length, 0), 0
            );

            return `
            <section class="topic-block aspect-block ${isAspectOpen ? "is-open" : ""}">
              <button class="topic-toggle aspect-toggle" type="button" data-aspect-toggle="${aspect.id}" aria-expanded="${isAspectOpen}">
                <span class="toggle-icon">${isAspectOpen ? "−" : "+"}</span>
                <span class="topic-name">${escapeHtml(localize(aspect.label))}</span>
                <span class="topic-count">${escapeHtml(formatQuestionCount(aspectQuestionTotal))}</span>
              </button>
              ${isAspectOpen ? `
                <div class="topic-stack nested-topic-stack">
                  ${aspect.categories.map(group => {
                    const isOpen = expandedCategories.has(group.groupKey);
                    const questionTotal = group.topics.reduce((sum, topic) => sum + topic.questions.length, 0);

                    return `
                      <section class="topic-block ${isOpen ? "is-open" : ""}">
                        <button class="topic-toggle" type="button" data-aspect="${group.aspectId}" data-category="${group.categoryId}" aria-expanded="${isOpen}">
                          <span class="toggle-icon">${isOpen ? "−" : "+"}</span>
                          <span class="topic-name">${escapeHtml(localize(group.label))}</span>
                          <span class="topic-count">${escapeHtml(formatQuestionCount(questionTotal))}</span>
                        </button>
                        ${isOpen ? renderQuestionList(group) : ""}
                      </section>`;
                  }).join("")}
                </div>
              ` : ""}
            </section>
            `;
          }).join("")}
        </div>
      </div>
    </section>`;
}

function renderAnswerPanel(){
  let answerHtml = `
    <div class="answer-empty">
      ${escapeHtml(t("emptyAnswer"))}
    </div>`;

  if(selectedQuestion){
    const item = getTopic(selectedQuestion.biz, selectedQuestion.aspect, selectedQuestion.topic)?.questions?.[selectedQuestion.idx];
    if(item){
      answerHtml = `
        <div class="answer-content">
          <h2 class="answer-question">${escapeHtml(localize(item.q))}</h2>
          <div class="answer-card answer-main">
            <p class="answer-text">${escapeHtml(localize(item.a))}</p>
          </div>
          <div class="answer-card answer-meta">
            <p class="answer-label">${escapeHtml(t("refLabel"))}</p>
            <p class="meta-text">${escapeHtml(localize(item.ref))}</p>
            <p class="answer-label meta-label">${escapeHtml(t("revisionDate"))}</p>
            <p class="meta-text">${escapeHtml(item.revisionDate)}</p>
            <p class="meta-disclaimer">* ${escapeHtml(t("staleNotice"))}</p>
          </div>
        </div>`;
    }
  }

  return `
    <section class="app-panel answer-panel">
      <div class="panel-head">
        <h2 class="panel-title">${escapeHtml(t("answerPanelTitle"))}</h2>
      </div>
      <div class="panel-body">
        <div class="answer-shell">${answerHtml}</div>
      </div>
      <div class="contact-card">
        <button class="contact-card-btn" type="button" onclick="openContactModal()">${escapeHtml(t("contactFooterButton"))}</button>
      </div>
    </section>`;
}

function renderSearchDropdown(){
  const dropdown = document.getElementById("searchDropdown");
  if(!dropdown){
    return;
  }

  if(searchQuery){
    const matches = findQuestionMatches(searchQuery);
    dropdown.innerHTML = matches.length > 0
      ? `
        <div class="search-section">
          <div class="search-section-title">${escapeHtml(t("searchResults"))}</div>
          <div class="search-result-list">
            ${matches.map(match => {
              const detail = getMatchDetail(match);
              return `
                <button class="search-result-item" type="button" data-search-biz="${escapeHtml(match.biz)}" data-search-aspect="${escapeHtml(match.aspect)}" data-search-topic="${escapeHtml(match.topic)}" data-search-idx="${match.idx}">
                  <span class="search-result-question">${escapeHtml(detail.question)}</span>
                  <span class="search-result-meta">${escapeHtml(detail.bizLabel)} / ${escapeHtml(detail.aspectLabel)} / ${escapeHtml(detail.categoryLabel)}</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>`
      : `
        <div class="search-section">
          <button class="search-no-result" type="button" data-search-contact>
            ${escapeHtml(t("noSearchResults"))}
          </button>
        </div>`;
  }else{
    dropdown.innerHTML = `
      <div class="search-section">
        <div class="search-section-title">${escapeHtml(t("popularKeywords"))}</div>
        <div class="keyword-tags">
          ${SEARCH_KEYWORDS.map(keyword => `
            <button class="keyword-tag" type="button" data-keyword-query="${escapeHtml(localize(keyword.query))}">
              ${escapeHtml(localize(keyword.label))}
            </button>
          `).join("")}
        </div>
      </div>
      <div class="search-section">
        <div class="search-section-title">${escapeHtml(t("recentSearches"))}</div>
        <div class="recent-searches">
          ${recentSearches.map(query => `
            <button class="keyword-tag recent-search-tag" type="button" data-recent-query="${escapeHtml(query)}">
              ${escapeHtml(query)}
            </button>
          `).join("")}
        </div>
      </div>`;
  }

  dropdown.querySelectorAll("[data-keyword-query]").forEach(button => {
    button.onclick = () => {
      commitSearch(button.dataset.keywordQuery);
      openSearchDropdown();
    };
  });

  dropdown.querySelectorAll("[data-recent-query]").forEach(button => {
    button.onclick = () => {
      commitSearch(button.dataset.recentQuery);
      openSearchDropdown();
    };
  });

  dropdown.querySelectorAll("[data-search-biz][data-search-aspect][data-search-topic][data-search-idx]").forEach(button => {
    button.onclick = () => {
      recordRecentSearch(searchQuery);
      closeSearchDropdown();
      jumpToAnswer(button.dataset.searchBiz, button.dataset.searchAspect, button.dataset.searchTopic, Number(button.dataset.searchIdx));
    };
  });

  dropdown.querySelectorAll("[data-search-contact]").forEach(button => {
    button.onclick = () => {
      recordRecentSearch(searchQuery);
      closeSearchDropdown();
      openContactModal();
    };
  });
}

function openSearchDropdown(){
  const wrap = document.getElementById("searchWrap");
  if(wrap){
    wrap.classList.add("is-open");
  }
}

function closeSearchDropdown(){
  const wrap = document.getElementById("searchWrap");
  if(wrap){
    wrap.classList.remove("is-open");
  }
}

function updateLayoutMetrics(){
  const topbar = document.querySelector(".topbar");
  if(!topbar){
    return;
  }

  const topbarHeight = Math.ceil(topbar.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--topbar-height", `${topbarHeight}px`);
}

function bindAppEvents(){
  document.querySelectorAll("[data-biz]").forEach(button => {
    button.onclick = () => selectBiz(button.dataset.biz);
  });

  document.querySelectorAll("[data-aspect-toggle]").forEach(button => {
    button.onclick = () => toggleAspect(button.dataset.aspectToggle);
  });

  document.querySelectorAll("[data-aspect][data-category]").forEach(button => {
    button.onclick = () => toggleCategory(button.dataset.aspect, button.dataset.category);
  });

  document.querySelectorAll("[data-toggle-all]").forEach(button => {
    button.onclick = () => toggleAllCategories();
  });

  document.querySelectorAll("[data-aspect][data-topic][data-idx]").forEach(button => {
    button.onclick = () => selectQuestion(button.dataset.aspect, button.dataset.topic, Number(button.dataset.idx));
  });
}

function bindChromeEvents(){
  document.querySelectorAll("[data-lang-option]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.langOption === currentLang);
    button.onclick = () => changeLanguage(button.dataset.langOption);
  });

  const searchInput = document.getElementById("keywordSearch");
  if(searchInput){
    searchInput.placeholder = t("searchPlaceholder");
    searchInput.value = searchQuery;
    searchInput.onfocus = openSearchDropdown;
    searchInput.oninput = event => {
      applySearch(event.target.value);
      queueRecentSearch(event.target.value);
      openSearchDropdown();
    };
    searchInput.onkeydown = event => {
      if(event.key === "Enter"){
        event.preventDefault();
        commitSearch(event.target.value);
      }
    };
  }

  const searchButton = document.querySelector(".search-icon-btn");
  if(searchButton){
    searchButton.setAttribute("aria-label", t("searchLabel"));
    searchButton.onclick = () => commitSearch(searchInput?.value || "");
  }
}

function renderChrome(){
  document.documentElement.lang = currentLang === "zh" ? "zh-Hant" : currentLang;
  document.title = t("documentTitle");
  updateLayoutMetrics();

  const languageSwitch = document.querySelector(".language-switch");
  if(languageSwitch){
    languageSwitch.setAttribute("aria-label", t("langLabel"));
  }

  renderSearchDropdown();
  bindChromeEvents();
}

function render(){
  const app = document.getElementById("app");

  renderChrome();
  app.innerHTML = `
    ${renderBizPanel()}
    ${renderCategoryPanel()}
    ${renderAnswerPanel()}
  `;

  bindAppEvents();
}

document.addEventListener("click", event => {
  const wrap = document.getElementById("searchWrap");
  if(wrap && !wrap.contains(event.target)){
    closeSearchDropdown();
  }
});

window.addEventListener("resize", updateLayoutMetrics);

render();
