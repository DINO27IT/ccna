/**
 * CCNA 2 v7 Final Exam - Interactive iOS-Optimized Quiz App
 */

(function () {
  'use strict';

  // Storage key
  const STORAGE_KEY = 'ccna2_v7_quiz_state_v1';

  // DOM Elements
  const cardContainer = document.getElementById('cardContainer');
  const progressBar = document.getElementById('progressBar');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const navCounter = document.getElementById('navCounter');
  const navScore = document.getElementById('navScore');
  const gridToggleBtn = document.getElementById('gridToggleBtn');
  const gridModal = document.getElementById('gridModal');
  const closeSheetBtn = document.getElementById('closeSheetBtn');
  const searchInput = document.getElementById('searchInput');
  const questionsGrid = document.getElementById('questionsGrid');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const toastContainer = document.getElementById('toastContainer');
  const toastMessage = document.getElementById('toastMessage');
  const scoreBadge = document.getElementById('scoreBadge');

  // Tab elements
  const tabAll = document.getElementById('tabAll');
  const tabNeumim = document.getElementById('tabNeumim');
  const tabUnanswered = document.getElementById('tabUnanswered');
  const badgeAll = document.getElementById('badgeAll');
  const badgeNeumim = document.getElementById('badgeNeumim');
  const badgeUnanswered = document.getElementById('badgeUnanswered');

  // Header action buttons
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIconSun = document.getElementById('themeIconSun');
  const themeIconMoon = document.getElementById('themeIconMoon');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Application State
  const allQuestions = Array.isArray(window.CCNA_QUESTIONS) ? window.CCNA_QUESTIONS : [];
  let currentFilteredList = [];
  let currentActiveIndex = 0;
  let activeTab = 'all'; // 'all' | 'neumim' | 'unanswered'
  let isShuffled = false;
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  // Persistent User State
  let userState = {
    answers: {},     // { [qId]: { selectedIndices: [], isCorrect: bool } }
    neumimSet: {},   // { [qId]: true }
    theme: 'system'  // 'light' | 'dark' | 'system'
  };

  // Option letters mapping
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Initialize App
  function init() {
    syncViewportHeight();
    loadState();
    initTheme();
    updateFilteredList();
    renderCurrentQuestion();
    updateBadges();
    setupEventListeners();
  }

  // Viewport Height Synchronization for iOS Safari
  function syncViewportHeight() {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${vh}px`);
  }

  // Load from localStorage
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) userState.answers = parsed.answers;
        if (parsed.neumimSet) userState.neumimSet = parsed.neumimSet;
        if (parsed.theme) userState.theme = parsed.theme;
      }
    } catch (e) {
      console.warn('Could not load quiz state:', e);
    }
  }

  // Save to localStorage
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userState));
    } catch (e) {
      console.warn('Could not save quiz state:', e);
    }
    updateBadges();
  }

  // Theme Management
  function initTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    let themeToApply = userState.theme;

    if (themeToApply === 'system' || !themeToApply) {
      themeToApply = prefersDark ? 'dark' : 'light';
    }

    applyTheme(themeToApply);
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeIconSun.style.display = 'none';
      themeIconMoon.style.display = 'block';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeIconSun.style.display = 'block';
      themeIconMoon.style.display = 'none';
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    userState.theme = nextTheme;
    applyTheme(nextTheme);
    saveState();
    showToast(nextTheme === 'dark' ? '🌙 Tmavý režim' : '☀️ Světlý režim');
  }

  // Filtered List Generation
  function updateFilteredList() {
    if (activeTab === 'neumim') {
      currentFilteredList = allQuestions.filter(q => !!userState.neumimSet[q.id]);
    } else if (activeTab === 'unanswered') {
      currentFilteredList = allQuestions.filter(q => !userState.answers[q.id]);
    } else {
      currentFilteredList = [...allQuestions];
    }

    if (isShuffled) {
      currentFilteredList = shuffleArray([...currentFilteredList]);
    }

    if (currentActiveIndex >= currentFilteredList.length) {
      currentActiveIndex = Math.max(0, currentFilteredList.length - 1);
    }
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Switch Active Tab
  function setTab(tabName) {
    activeTab = tabName;
    tabAll.classList.toggle('active', tabName === 'all');
    tabNeumim.classList.toggle('active', tabName === 'neumim');
    tabUnanswered.classList.toggle('active', tabName === 'unanswered');

    tabAll.setAttribute('aria-selected', tabName === 'all');
    tabNeumim.setAttribute('aria-selected', tabName === 'neumim');
    tabUnanswered.setAttribute('aria-selected', tabName === 'unanswered');

    currentActiveIndex = 0;
    updateFilteredList();
    renderCurrentQuestion();
  }

  // Update Counters & Badges
  function updateBadges() {
    badgeAll.textContent = allQuestions.length;

    const neumimCount = Object.keys(userState.neumimSet).length;
    badgeNeumim.textContent = neumimCount;

    const answeredCount = Object.keys(userState.answers).length;
    const unansweredCount = Math.max(0, allQuestions.length - answeredCount);
    badgeUnanswered.textContent = unansweredCount;

    if (scoreBadge) {
      scoreBadge.textContent = `${answeredCount} / ${allQuestions.length}`;
    }

    // Top progress bar based on total completed
    const pct = allQuestions.length > 0 ? (answeredCount / allQuestions.length) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  // Toast Notification
  let toastTimer = null;
  function showToast(text, duration = 2000) {
    clearTimeout(toastTimer);
    toastMessage.textContent = text;
    toastContainer.classList.add('show');
    toastTimer = setTimeout(() => {
      toastContainer.classList.remove('show');
    }, duration);
  }

  // Render Current Question Card (Single Screen Fit)
  function renderCurrentQuestion() {
    if (currentFilteredList.length === 0) {
      renderEmptyState();
      updateNavigationControls();
      return;
    }

    const question = currentFilteredList[currentActiveIndex];
    if (!question) return;

    const qId = question.id;
    const isNeumim = !!userState.neumimSet[qId];
    const savedAnswer = userState.answers[qId];
    const isAnswered = !!savedAnswer;
    const isMulti = !!question.isMultiple;
    const requiredCount = question.correctIndices.length;

    // Header Tags
    let tagsHtml = `
      <span class="tag tag-num">${currentActiveIndex + 1} / ${currentFilteredList.length}</span>
      <span class="tag tag-orig">CCNA #${question.originalNum}</span>
    `;

    if (isMulti) {
      tagsHtml += `<span class="tag tag-multi">Vyberte ${requiredCount}</span>`;
    }

    if (isNeumim) {
      tagsHtml += `<span class="tag tag-neumim">⚠️ NEUMÍM</span>`;
    }

    // Toggle NEUMÍM button
    const neumimBtnHtml = `
      <button class="neumim-toggle-btn ${isNeumim ? 'is-neumim' : ''}" data-action="toggle-neumim">
        <span>${isNeumim ? '✓ Mám zvládnuto' : '⚠️ NEUMÍM'}</span>
      </button>
    `;

    // Compact Exhibit Image
    let exhibitsHtml = '';
    if (question.images && question.images.length > 0) {
      question.images.forEach(imgSrc => {
        exhibitsHtml += `
          <div class="exhibit-box" data-action="zoom-img" data-src="${imgSrc}">
            <img src="${imgSrc}" alt="Exhibit diagram" class="exhibit-img" loading="eager" />
            <div class="exhibit-zoom-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              Zvětšit
            </div>
          </div>
        `;
      });
    }

    // Options List
    let optionsHtml = '';
    const selectedIndices = isAnswered ? savedAnswer.selectedIndices : [];

    question.options.forEach((optText, optIdx) => {
      const letter = LETTERS[optIdx] || (optIdx + 1);
      const isSelected = selectedIndices.includes(optIdx);
      const isCorrectOption = question.correctIndices.includes(optIdx);

      let optionClasses = ['option-item'];
      if (isAnswered) {
        optionClasses.push('disabled');
        if (isCorrectOption) {
          optionClasses.push('correct');
        } else if (isSelected && !isCorrectOption) {
          optionClasses.push('wrong');
        }
      } else if (isSelected) {
        optionClasses.push('selected');
      }

      const checkboxHtml = isMulti ? `
        <div class="option-checkbox">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      ` : '';

      const statusIconHtml = `
        <div class="option-status-icon">
          ${isCorrectOption ? `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ` : `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          `}
        </div>
      `;

      optionsHtml += `
        <div class="${optionClasses.join(' ')}" data-index="${optIdx}" data-action="select-option">
          ${checkboxHtml}
          <div class="option-badge">${letter}</div>
          <div class="option-text">${formatCodeInText(optText)}</div>
          ${isAnswered ? statusIconHtml : ''}
        </div>
      `;
    });

    // Multi-select Submit Button
    let multiSubmitHtml = '';
    if (isMulti && !isAnswered) {
      const canSubmit = selectedIndices.length > 0;
      multiSubmitHtml = `
        <div class="multi-submit-bar">
          <button id="multiSubmitBtn" class="primary-btn" ${canSubmit ? '' : 'disabled'} data-action="submit-multi">
            <span>Ověřit (${selectedIndices.length} z ${requiredCount} vybráno)</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      `;
    }

    // Compact Result & Collapsible Explanation
    let feedbackHtml = '';
    if (isAnswered) {
      const wasCorrect = savedAnswer.isCorrect;
      feedbackHtml = `
        <div class="result-banner ${wasCorrect ? 'correct' : 'wrong'}">
          <div class="result-banner-left">
            <span style="font-size:1.15rem; line-height:1;">${wasCorrect ? '✓' : '✗'}</span>
            <span>${wasCorrect ? 'Správně!' : 'Špatně! (Otázka je v NEUMÍM)'}</span>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            ${isNeumim ? `<button class="mini-btn" data-action="remove-neumim">Odebrat z NEUMÍM</button>` : ''}
            <button class="mini-btn" data-action="retry">↺ Znovu</button>
          </div>
        </div>
      `;

      if (question.explanation && question.explanation.trim().length > 0) {
        feedbackHtml += `
          <details class="explanation-details">
            <summary>
              <span>📖 Zobrazit vysvětlení a teorii</span>
              <span class="details-arrow">▼</span>
            </summary>
            <div class="exp-content">${formatCodeInText(question.explanation)}</div>
          </details>
        `;
      }
    }

    // Assemble Card
    cardContainer.innerHTML = `
      <div class="question-card" data-qid="${qId}">
        <div class="q-meta">
          <div class="q-tags">${tagsHtml}</div>
          <div class="q-quick-actions">${neumimBtnHtml}</div>
        </div>

        <div class="q-text">${formatCodeInText(question.question)}</div>

        ${exhibitsHtml}

        <div class="options-list">
          ${optionsHtml}
        </div>

        ${multiSubmitHtml}

        ${feedbackHtml}
      </div>
    `;

    updateNavigationControls();
  }

  // Format inline Cisco commands and keywords
  function formatCodeInText(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  // Empty State
  function renderEmptyState() {
    let title = 'Žádné otázky';
    let desc = 'V tomto zobrazení se momentálně nenachází žádná otázka.';
    let icon = '📋';

    if (activeTab === 'neumim') {
      icon = '🎉';
      title = 'Sekce NEUMÍM je prázdná!';
      desc = 'Skvělá práce! Nemáte žádné otázky k procvičování.';
    } else if (activeTab === 'unanswered') {
      icon = '🏆';
      title = 'Všechny otázky zodpovězeny!';
      desc = 'Dokončili jste všechny otázky z testu CCNA 2 v7.';
    }

    cardContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <div class="empty-title">${title}</div>
        <div class="empty-desc">${desc}</div>
        <button class="primary-btn" style="max-width:220px; margin-top:8px;" data-action="switch-to-all">
          <span>Přejít na všechny otázky</span>
        </button>
      </div>
    `;
  }

  // Update Bottom Navigation & Status (Mathematically Centered)
  function updateNavigationControls() {
    const totalInList = currentFilteredList.length;

    if (totalInList === 0) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      navCounter.textContent = '0 / 0';
      navScore.textContent = 'Vyberte sekci';
      return;
    }

    prevBtn.disabled = currentActiveIndex <= 0;
    nextBtn.disabled = currentActiveIndex >= totalInList - 1;

    // Centered, compact, 0 wrap
    navCounter.textContent = `${currentActiveIndex + 1} / ${totalInList}`;
    navScore.textContent = 'Přehled otázek';
  }

  // Navigation handlers
  function goToNext() {
    if (currentActiveIndex < currentFilteredList.length - 1) {
      currentActiveIndex++;
      renderCurrentQuestion();
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) mainContainer.scrollTop = 0;
    }
  }

  function goToPrev() {
    if (currentActiveIndex > 0) {
      currentActiveIndex--;
      renderCurrentQuestion();
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) mainContainer.scrollTop = 0;
    }
  }

  function jumpToIndex(idx) {
    if (idx >= 0 && idx < currentFilteredList.length) {
      currentActiveIndex = idx;
      renderCurrentQuestion();
      closeGridSheet();
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) mainContainer.scrollTop = 0;
    }
  }

  // Evaluation Handler (Single Choice)
  function handleSingleChoiceSelect(optIdx) {
    const question = currentFilteredList[currentActiveIndex];
    if (!question) return;

    const qId = question.id;
    if (userState.answers[qId]) return; // already answered

    const isCorrect = question.correctIndices.includes(optIdx);

    // Save answer state
    userState.answers[qId] = {
      selectedIndices: [optIdx],
      isCorrect: isCorrect,
      timestamp: Date.now()
    };

    if (!isCorrect) {
      userState.neumimSet[qId] = true;
      triggerHaptic(false);
      showToast('❌ Špatně! Uloženo do NEUMÍM.');
    } else {
      triggerHaptic(true);
      showToast('✓ Správně!');
    }

    saveState();
    renderCurrentQuestion();
  }

  // Multi-choice toggle option
  let multiSelectedTemp = [];
  function handleMultiChoiceToggle(optIdx) {
    const question = currentFilteredList[currentActiveIndex];
    if (!question) return;

    const qId = question.id;
    if (userState.answers[qId]) return;

    const pos = multiSelectedTemp.indexOf(optIdx);
    if (pos > -1) {
      multiSelectedTemp.splice(pos, 1);
    } else {
      multiSelectedTemp.push(optIdx);
    }

    const optionEls = cardContainer.querySelectorAll('.option-item');
    optionEls.forEach((el, idx) => {
      el.classList.toggle('selected', multiSelectedTemp.includes(idx));
    });

    const submitBtn = document.getElementById('multiSubmitBtn');
    if (submitBtn) {
      const required = question.correctIndices.length;
      submitBtn.disabled = multiSelectedTemp.length === 0;
      submitBtn.querySelector('span').textContent = `Ověřit (${multiSelectedTemp.length} z ${required} vybráno)`;
    }
  }

  // Submit multi-choice
  function submitMultiChoiceAnswer() {
    const question = currentFilteredList[currentActiveIndex];
    if (!question) return;

    const qId = question.id;
    if (userState.answers[qId]) return;

    const correct = question.correctIndices.slice().sort();
    const chosen = multiSelectedTemp.slice().sort();

    const isCorrect = correct.length === chosen.length && correct.every((val, idx) => val === chosen[idx]);

    userState.answers[qId] = {
      selectedIndices: [...multiSelectedTemp],
      isCorrect: isCorrect,
      timestamp: Date.now()
    };

    if (!isCorrect) {
      userState.neumimSet[qId] = true;
      triggerHaptic(false);
      showToast('❌ Špatně! Uloženo do NEUMÍM.');
    } else {
      triggerHaptic(true);
      showToast('✓ Správně!');
    }

    multiSelectedTemp = [];
    saveState();
    renderCurrentQuestion();
  }

  // Retry question
  function retryQuestion() {
    const question = currentFilteredList[currentActiveIndex];
    if (!question) return;

    delete userState.answers[question.id];
    multiSelectedTemp = [];
    saveState();
    renderCurrentQuestion();
  }

  // Manual Toggle NEUMÍM
  function toggleNeumimStatus(qId) {
    if (userState.neumimSet[qId]) {
      delete userState.neumimSet[qId];
      showToast('Odebráno z NEUMÍM');
    } else {
      userState.neumimSet[qId] = true;
      showToast('⚠️ Přidáno do NEUMÍM');
    }
    saveState();
    if (activeTab === 'neumim') {
      updateFilteredList();
    }
    renderCurrentQuestion();
  }

  // Remove from NEUMÍM
  function removeFromNeumim(qId) {
    delete userState.neumimSet[qId];
    saveState();
    showToast('🎉 Odebráno z NEUMÍM');
    if (activeTab === 'neumim') {
      updateFilteredList();
    }
    renderCurrentQuestion();
  }

  // Lightbox Zoom
  function openLightbox(src) {
    lightboxImg.src = src;
    lightboxModal.classList.add('open');
    lightboxModal.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightboxModal.classList.remove('open');
    lightboxModal.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  }

  // Question Grid Sheet Modal
  function openGridSheet() {
    renderQuestionsGrid(searchInput.value);
    gridModal.classList.add('open');
    gridModal.setAttribute('aria-hidden', 'false');
  }

  function closeGridSheet() {
    gridModal.classList.remove('open');
    gridModal.setAttribute('aria-hidden', 'true');
  }

  function renderQuestionsGrid(filterText = '') {
    const term = (filterText || '').trim().toLowerCase();
    questionsGrid.innerHTML = '';

    currentFilteredList.forEach((q, idx) => {
      if (term) {
        const matchText = q.question.toLowerCase().includes(term);
        const matchNum = String(q.originalNum).includes(term) || String(idx + 1).includes(term);
        const matchExp = (q.explanation || '').toLowerCase().includes(term);
        if (!matchText && !matchNum && !matchExp) return;
      }

      const pill = document.createElement('button');
      pill.className = 'q-grid-pill';
      pill.textContent = idx + 1;
      pill.title = `CCNA #${q.originalNum}`;

      if (idx === currentActiveIndex) {
        pill.classList.add('current');
      }

      const ans = userState.answers[q.id];
      if (userState.neumimSet[q.id]) {
        pill.classList.add('status-neumim');
      } else if (ans && ans.isCorrect) {
        pill.classList.add('status-correct');
      }

      pill.addEventListener('click', () => jumpToIndex(idx));
      questionsGrid.appendChild(pill);
    });

    if (questionsGrid.children.length === 0) {
      questionsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 20px;">
          Nenalezena žádná otázka odpovídající "${filterText}".
        </div>
      `;
    }
  }

  // Haptic feedback
  function triggerHaptic(success) {
    if (window.navigator && window.navigator.vibrate) {
      if (success) {
        window.navigator.vibrate(35);
      } else {
        window.navigator.vibrate([50, 40, 50]);
      }
    }
  }

  // Shuffle toggle
  function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active', isShuffled);
    updateFilteredList();
    currentActiveIndex = 0;
    renderCurrentQuestion();
    showToast(isShuffled ? '🔀 Náhodné pořadí' : '▶️ Běžné pořadí');
  }

  // Reset progress
  function resetAllProgress() {
    const confirmReset = window.confirm(
      'Opravdu chcete resetovat veškerý svůj pokrok v testu?\n\n' +
      'Tato akce vymaže vaše odpovědi i sekci NEUMÍM.'
    );

    if (confirmReset) {
      userState.answers = {};
      userState.neumimSet = {};
      multiSelectedTemp = [];
      saveState();
      updateFilteredList();
      currentActiveIndex = 0;
      renderCurrentQuestion();
      showToast('Pokrok byl resetován');
    }
  }

  // Event Listeners
  function setupEventListeners() {
    prevBtn.addEventListener('click', goToPrev);
    nextBtn.addEventListener('click', goToNext);
    gridToggleBtn.addEventListener('click', openGridSheet);
    closeSheetBtn.addEventListener('click', closeGridSheet);

    gridModal.addEventListener('click', (e) => {
      if (e.target === gridModal) closeGridSheet();
    });

    searchInput.addEventListener('input', (e) => {
      renderQuestionsGrid(e.target.value);
    });

    lightboxCloseBtn.addEventListener('click', closeLightbox);
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    tabAll.addEventListener('click', () => setTab('all'));
    tabNeumim.addEventListener('click', () => setTab('neumim'));
    tabUnanswered.addEventListener('click', () => setTab('unanswered'));

    themeToggleBtn.addEventListener('click', toggleTheme);
    shuffleBtn.addEventListener('click', toggleShuffle);
    resetBtn.addEventListener('click', resetAllProgress);

    // Card click delegation
    cardContainer.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.getAttribute('data-action');
      const question = currentFilteredList[currentActiveIndex];
      if (!question && action !== 'switch-to-all') return;

      if (action === 'select-option') {
        const optIdx = parseInt(target.getAttribute('data-index'), 10);
        if (question.isMultiple) {
          handleMultiChoiceToggle(optIdx);
        } else {
          handleSingleChoiceSelect(optIdx);
        }
      } else if (action === 'submit-multi') {
        submitMultiChoiceAnswer();
      } else if (action === 'retry') {
        retryQuestion();
      } else if (action === 'toggle-neumim') {
        toggleNeumimStatus(question.id);
      } else if (action === 'remove-neumim') {
        removeFromNeumim(question.id);
      } else if (action === 'zoom-img') {
        const src = target.getAttribute('data-src');
        if (src) openLightbox(src);
      } else if (action === 'switch-to-all') {
        setTab('all');
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape') {
        closeLightbox();
        closeGridSheet();
      }
    });

    // Viewport resize and orientation change for iOS Safari toolbar adjustments
    window.addEventListener('resize', syncViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(syncViewportHeight, 150);
    });

    // Touch Swipe gestures for iPhone (differentiates horizontal swipe from vertical scroll)
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 60;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (gridModal.classList.contains('open') || lightboxModal.classList.contains('open')) {
      return;
    }

    // Only swipe if horizontal movement clearly dominates vertical scrolling
    if (Math.abs(diffX) > Math.abs(diffY) * 1.8 && Math.abs(diffX) > swipeThreshold) {
      if (diffX < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
