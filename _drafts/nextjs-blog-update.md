# Next.js 블로그 대규모 업데이트

블로그 기능을 하나둘 추가하다 보니 어느새 코드가 꽤 비대해졌습니다. 특히 글을 작성하는 `PostEditor.tsx` 파일은 400줄이 넘어가며 유지보수가 힘든 'God Component'가 되어가고 있었죠.

그래서 이번 주말, **전면적인 코드 리팩토링**과 함께 독자 경험(DX/UX)을 높여줄 **두 가지 멋진 기능**을 추가했습니다.

## 1. 🛠️ 대규모 리팩토링: 모듈화와 최적화

가장 먼저 한 일은 "역할 분리"였습니다.

### 거대 컴포넌트 분해
기존 에디터 컴포넌트는 UI 렌더링, 상태 관리, 이미지 업로드 로직이 한곳에 뒤섞여 있었습니다. 이를 다음과 같이 분리했습니다.

- **UI 컴포넌트 분리**: 이미지 관리는 `ImageManager`, 툴바는 `MarkdownToolbar`로 쪼개어 가독성을 높였습니다.
- **Custom Hooks 도입**: 복잡한 상태 관리 로직은 `useMarkdownEditor`, `useSearch` 같은 커스텀 훅으로 추출했습니다.
- **디렉토리 구조 정리**: `src/hooks`, `src/lib`, `src/constants` 등 공통 로직을 위한 디렉토리를 정비했습니다.

덕분에 코드가 훨씬 깔끔해졌고, 새로운 기능을 추가할 때 사이드 이펙트를 걱정할 일이 줄어들었습니다.

## 2. ⚡️ 인터랙티브 코드 플레이그라운드 (Sandpack)

기술 블로그라면 코드를 단순히 "보여주는" 것에서 그치지 않고, **"실행해볼 수 있어야 한다"**고 생각했습니다.

그래서 CodeSandbox 팀이 만든 **[Sandpack](https://sandpack.codesandbox.io/)**을 도입했습니다. 이제 제 블로그에서는 코드 블록에 `live` 키워드만 붙이면 브라우저에서 바로 실행되는 리액트 환경이 렌더링됩니다.

**👇 아래 코드를 직접 수정해보세요! (실제 동작하는 데모입니다)**

```jsx live
import { useState } from 'react';

export default function InteractiveDemo() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      padding: '2rem', 
      background: 'linear-gradient(135deg, #6e8efb, #a777e3)', 
      borderRadius: '12px',
      color: 'white',
      textAlign: 'center'
    }}>
      <h3>🚀 Sandpack on My Blog</h3>
      <p>코드를 수정하면 실시간으로 반영됩니다!</p>
      
      <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: '1rem 0' }}>
        {count}
      </div>
      
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: '0.8rem 1.5rem',
          fontSize: '1rem',
          border: 'none',
          borderRadius: '30px',
          background: 'white',
          color: '#a777e3',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
      >
        Click Me +
      </button>
    </div>
  );
}
```

이제 프론트엔드 관련 포스팅을 할 때, 독자분들에게 훨씬 풍부한 경험을 제공할 수 있게 되었습니다.

## 3. 🔗 문단별 앵커 공유 (Deep Linking)

긴 기술 아티클을 읽다 보면 **"이 부분만 친구에게 공유하고 싶은데?"** 라는 생각이 들 때가 있습니다.

이를 위해 **Deep Linking** 기능을 추가했습니다. 이제 글의 소제목(Heading)에 마우스를 올리면 왼쪽에 `#` 아이콘이 나타납니다.

- **🖱️ Hover**: 헤딩에 마우스를 올리면 앵커 아이콘 등장
- **📋 Click**: 클릭 시 해당 위치의 URL이 클립보드에 복사됨
- **📜 Scroll**: URL을 통해 접속하면 해당 위치로 부드럽게 스크롤 이동

구현에는 `rehype-slug`와 `rehype-autolink-headings` 플러그인을 사용하여, 마크다운 변환 시점에 자동으로 ID와 링크를 주입하도록 했습니다.

## 마치며

단순히 글만 쌓이는 공간이 아니라, **블로그 서비스 자체도 계속 성장하는 모습**을 보여드리고 싶습니다.

리팩토링으로 기반을 다졌으니, 앞으로 더 재미있고 유용한 기능들을 많이 추가해 보겠습니다. 이번 업데이트가 마음에 드셨다면 댓글로 알려주세요!
