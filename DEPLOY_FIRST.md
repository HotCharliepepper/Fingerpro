# FingerPro R2 · GitHub → Netlify

이 폴더를 GitHub 저장소의 **최상위 폴더(루트)**로 업로드하세요. ZIP 파일 그대로 올리면 안 됩니다.

루트에 `index.html`, `package.json`, `netlify.toml`, `src/`, `public/`, `scripts/`가 보여야 합니다.

1. GitHub에서 새 **Private** 저장소를 만들고, 이 폴더 안의 파일과 하위 폴더를 GitHub 최상위에 업로드합니다.
2. Netlify → Add new project → Import an existing project → GitHub → 해당 저장소 선택.
3. Base directory: (비워둠), Build command: `npm run build`, Publish directory: `dist`.
4. Deploy 후 Netlify의 `*.netlify.app` 주소에서 모바일 및 인터랙션을 확인합니다.
5. 향후 GitHub main에 커밋하면 자동으로 다시 배포됩니다.

이 페이지는 **대외 공개 승인을 받지 않은 제안용 시안**입니다. `noindex`가 들어 있지만 주소를 아는 사람의 접근을 막지 않습니다. 권한/내용을 검토한 후 공유하세요.

로컬 테스트:
`npm run check` / `npm run build` / `npm run dev`

주의: 글꼴 파일은 포함하지 않았으며 시스템 서체를 사용합니다.
