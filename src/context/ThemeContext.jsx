import React, { createContext, useContext, useEffect, useState } from 'react';

// 화면 모드(라이트/다크)를 앱 전체에서 같이 쓰기 위한 보관함
const ThemeContext = createContext(null);

// localStorage 에 저장할 때 쓰는 이름
const STORAGE_KEY = 'tasko-theme';

// 처음 열 때 어떤 모드로 시작할지 정한다.
// 1순위: 브라우저에 저장된 값 / 2순위: 기기(시스템) 설정
function getInitialTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    saved = null;
  }
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    return 'dark';
  }
  return 'light';
}

/**
 * 라이트/다크 모드 제공자
 * - theme: 'light' 또는 'dark'
 * - toggleTheme: 모드를 서로 바꾸는 함수
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // 모드가 바뀔 때마다 <html> 의 dark 클래스를 켜고 끄고, 선택을 브라우저에 저장한다
  useEffect(
    function applyTheme() {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // 저장이 막힌 브라우저에서는 이번 접속 동안만 유지된다
      }
    },
    [theme]
  );

  function toggleTheme() {
    setTheme(function next(current) {
      if (current === 'dark') {
        return 'light';
      }
      return 'dark';
    });
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

// 다른 화면에서 모드 정보를 꺼내 쓰는 함수
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme 은 ThemeProvider 안에서만 쓸 수 있습니다.');
  }
  return value;
}
