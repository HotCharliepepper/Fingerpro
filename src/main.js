document.addEventListener('DOMContentLoaded', () => {
const { makeConversationNote, makeSelectionSummary } = globalThis.FingerProCopy;
const { initMotion, animateSwitch, refreshMotion } = globalThis.FingerProMotion;

document.documentElement.classList.remove('no-js');

// 키보드에서 좌우 화살표 / Home / End로도 이동할 수 있는 탭 인터랙션.
function tabGroup(selector, attr, panelSelector, activate) {
  const tabs = [...document.querySelectorAll(selector)];
  const panels = [...document.querySelectorAll(panelSelector)];
  const select = (tab, focus = false) => {
    tabs.forEach((t) => { const active = t === tab; t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1; });
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panels.forEach((p) => { p.hidden = p !== panel; });
    activate(tab.getAttribute(attr), panel);
    if (focus) tab.focus();
    refreshMotion();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (nextIndex !== null) { event.preventDefault(); select(tabs[nextIndex], true); }
    });
  });
}

const compareCopy = {
  current: ['기존 제품과 기기를 중심으로 소개하는 첫 화면입니다.', '2026.11.11 제공된 캡처'],
  proposed: ['먼저 원장님의 한 장면을 보여주는 제안입니다.', '개념 시안 · 실제 제품 화면 아님'],
};
tabGroup('[data-compare]', 'data-compare', '.compare-body', (key, panel) => {
  document.querySelector('#compare-copy').textContent = compareCopy[key][0];
  document.querySelector('#compare-qualifier').textContent = compareCopy[key][1];
  animateSwitch(panel);
});

tabGroup('[data-scene]', 'data-scene', '[data-scene-panel]', (key, panel) => {
  const index = { booking: '01', record: '02', close: '03' }[key];
  document.querySelector('#scene-indicator').textContent = `${index} / 03`;
  animateSwitch(panel);
});

const priorities = [...document.querySelectorAll('[data-priority]')];
const memoText = document.querySelector('#memo-text');
const memoSummary = document.querySelector('#selected-summary');
const copyButton = document.querySelector('#copy-memo');
const copyStatus = document.querySelector('#copy-status');
const selected = new Set();
function refreshMemo() {
  const values = priorities.map((btn) => btn.dataset.priority).filter((value) => selected.has(value));
  memoText.value = makeConversationNote(values);
  memoSummary.textContent = makeSelectionSummary(values);
  copyStatus.textContent = '메모는 이 화면에서만 생성됩니다. 전송·저장되지 않습니다.';
  copyButton.innerHTML = '대화 메모 복사 <span aria-hidden="true">↗</span>';
  memoText.classList.remove('manual-copy');
}
priorities.forEach((btn) => btn.addEventListener('click', () => {
  const id = btn.dataset.priority;
  if (selected.has(id)) selected.delete(id); else selected.add(id);
  btn.setAttribute('aria-pressed', String(selected.has(id)));
  btn.querySelector('.priority-check').textContent = selected.has(id) ? '✓' : '+';
  refreshMemo();
}));
refreshMemo();
copyButton.addEventListener('click', async () => {
  // 현재 화면의 메모만 복사합니다. 요청/분석/저장 API는 호출하지 않습니다.
  const value = memoText.value;
  const unchanged = () => memoText.value === value;
  copyButton.disabled = true;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(value);
    if (!unchanged()) { copyStatus.textContent = '선택이 바뀌었습니다. 메모를 다시 복사해 주세요.'; return; }
    copyStatus.textContent = '복사했습니다. 기존 대화창에 붙여 넣어 전달할 수 있습니다.';
    copyButton.innerHTML = '복사 완료 <span aria-hidden="true">✓</span>';
  } catch {
    if (!unchanged()) return;
    memoText.classList.add('manual-copy');
    memoText.focus(); memoText.select();
    memoText.setSelectionRange(0, value.length);
    copyStatus.textContent = '자동 복사가 제한됐습니다. 아래 선택된 메모를 Ctrl+C / ⌘C로 복사하세요. 모바일에서는 길게 눌러 복사할 수 있습니다.';
    copyButton.innerHTML = '복사 다시 시도 <span aria-hidden="true">↗</span>';
  } finally { copyButton.disabled = false; }
});

try { initMotion(); } catch(error) {
  document.querySelectorAll('[data-hero],[data-reveal],[data-hero-visual]').forEach((node) => { node.style.opacity = '1'; node.style.removeProperty('transform'); });
  console.warn('Motion unavailable; content remains visible.', error);
}

});
