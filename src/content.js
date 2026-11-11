// R2 문안의 기준 파일. 합의되지 않은 정책·기능을 단정하지 않습니다.
const areas = {
  brand: {
    label: '브랜드의 연결',
    question: '기존 이름과 FingerPro Studio, 고객용 앱의 관계를 어디서부터 통일할까요?',
  },
  scene: {
    label: '첫 업무 장면',
    question: '원장님이 실제로 자주 하는 작업 하나를 어떤 화면으로 보여줄까요?',
  },
  start: {
    label: '시작 전 안내',
    question: '이관·노출·기록 관리의 실제 조건 중 무엇을 먼저 설명해야 할까요?',
  },
};

function makeConversationNote(ids) {
  const selections = ids.filter((id) => areas[id]);
  const interest = selections.length
    ? selections.map((id) => '· ' + areas[id].label).join('\n')
    : '· 세 가지 관찰 중 우선순위 함께 결정';
  const questions = selections.length
    ? selections.map((id, i) => `${i + 1}. ${areas[id].question}`).join('\n')
    : '1. 어떤 원장님과 어떤 업무 장면을 가장 먼저 살펴볼까요?';
  return [
    'FingerPro × Mashcore 제안 R2를 보고 함께 확인하고 싶은 내용을 정리했습니다.',
    '',
    '먼저 보고 싶은 영역',
    interest,
    '',
    '함께 확인할 질문',
    questions,
    '',
    '현재 운영 조건과 제품 기능을 확인한 뒤, 적용 범위와 우선순위를 이야기하고 싶습니다.',
    '※ 공개 자료 기반 제안이며, 운영 반영이나 개선 성과는 아직 검증 전입니다.',
  ].join('\n');
}

function makeSelectionSummary(ids) {
  const labels = ids.filter((id) => areas[id]).map((id) => areas[id].label);
  return labels.length ? `${labels.join(' · ')} — 이 ${labels.length}개 영역부터 함께 살펴봅니다.` : '원하는 항목을 고르면 대화 메모에 담깁니다.';
}

;globalThis.FingerProCopy = { areas, makeConversationNote, makeSelectionSummary };
