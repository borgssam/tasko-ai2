import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTasks } from '../context/TaskContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import TaskCard from '../components/TaskCard.jsx';
import BottomSheet from '../components/BottomSheet.jsx';

/**
 * Tasko 모바일 대시보드 화면
 * - 완료율 달성 카드 및 카테고리별 진행도 표시
 * - "오늘 할 일 · 전체 보기 >" 링크 제공 (클릭 시 전체 목록 화면으로 이동)
 * - 할 일 카드 터치 시 상세/수정 화면으로 이동
 * - 우측 하단 에메랄드 그린 FAB (+) 버튼을 통해 새로운 할 일 추가 바텀시트 오픈
 */
export default function DashboardScreen() {
  const navigate = useNavigate();
  const {
    tasks,
    toggleTask,
    addTask,
    totalCount,
    completedCount,
    inProgressCount,
    starredCount,
    percentage,
    categoryStats,
  } = useTasks();

  // 라이트/다크 모드 (해/달 버튼에서 사용)
  const { theme, toggleTheme } = useTheme();

  // 로그아웃 (프로필 TK 버튼에서 사용)
  const { signOut } = useAuth();
  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  // 다크일 때는 해(라이트로 전환), 라이트일 때는 달(다크로 전환) 아이콘을 보여 준다
  let themeButtonLabel = '다크 모드로 전환';
  let themeIcon = <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>;
  if (theme === 'dark') {
    themeButtonLabel = '라이트 모드로 전환';
    themeIcon = (
      <>
        <circle cx="12" cy="12" r="4"></circle>
        <line x1="12" y1="2" x2="12" y2="4"></line>
        <line x1="12" y1="20" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="4" y2="12"></line>
        <line x1="20" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line>
        <line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line>
      </>
    );
  }

  const [currentFilter, setCurrentFilter] = useState('ALL'); // 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'STARRED'
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // 필터 조건에 따른 태스크 필터링
  const filteredTasks = tasks.filter((task) => {
    // 텍스트 검색 조건 (검색 활성화 시)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        task.title.toLowerCase().includes(q) ||
        task.tag.toLowerCase().includes(q) ||
        (task.dueDate && task.dueDate.toLowerCase().includes(q));
      if (!match) return false;
    }

    // 상태 필터 조건
    if (currentFilter === 'IN_PROGRESS') return !task.completed;
    if (currentFilter === 'COMPLETED') return task.completed;
    if (currentFilter === 'STARRED') return task.starred;
    return true;
  });

  return (
    <div className="relative w-full h-full bg-tasko-bg flex flex-col overflow-hidden select-none">
      {/* 1. 상단 Safe Area & 헤더 섹션 */}
      <header className="pt-2 px-5 pb-3 bg-tasko-surface border-b border-tasko-border flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-tasko-primary flex items-center justify-center text-white shadow-sm">
            <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-tasko-text tracking-tight">오늘의 할 일</h1>
        </div>

        {/* 우측 액션: 검색 아이콘 및 프로필 아바타 */}
        <div className="flex items-center gap-2.5">
          {/* 검색 토글 버튼 */}
          <button
            type="button"
            onClick={() => setIsSearchActive(!isSearchActive)}
            aria-label="할 일 검색"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-tasko-bg text-tasko-secondary active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          {/* 라이트/다크 모드 전환 버튼: 다크일 때는 해, 라이트일 때는 달 아이콘 */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeButtonLabel}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-tasko-bg text-tasko-secondary active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {themeIcon}
            </svg>
          </button>
          {/* 프로필 아바타: 클릭 시 로그아웃하고 로그인 화면으로 이동 */}
          <button
            type="button"
            onClick={handleLogout}
            title="로그아웃"
            className="w-8 h-8 rounded-full bg-tasko-primary-light border border-tasko-primary/20 flex items-center justify-center text-xs font-bold text-tasko-primary hover:opacity-80 transition-opacity"
          >
            TK
          </button>
        </div>
      </header>

      {/* 인라인 검색 바 (검색 토글 시 노출) */}
      {isSearchActive && (
        <div className="bg-tasko-surface px-5 py-2.5 border-b border-tasko-border flex items-center gap-2">
          <input
            type="text"
            placeholder="할 일 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 h-9 px-3 rounded-lg bg-tasko-bg border border-tasko-border text-xs text-tasko-text focus:outline-none focus:border-tasko-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-tasko-muted hover:text-tasko-text px-1"
            >
              지우기
            </button>
          )}
        </div>
      )}

      {/* 2. 상단 요약 & 필터 섹션 */}
      <div className="shrink-0 bg-tasko-surface px-5 pt-3 pb-3 border-b border-tasko-border shadow-xs">
        {/* 2-1. 완료율 달성 프로그레스 카드 */}
        <div className="bg-tasko-primary-light rounded-2xl p-4 border border-tasko-primary/20 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-tasko-primary px-2 py-0.5 bg-tasko-surface rounded-full shadow-xs">
                목표 달성률
              </span>
              <span className="text-xs text-tasko-secondary">
                {totalCount}개 중 {completedCount}개 완료
              </span>
            </div>
            <span className="text-sm font-bold text-tasko-primary">{percentage}%</span>
          </div>
          {/* 게이지 바 */}
          <div className="w-full h-2.5 bg-tasko-surface/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-tasko-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* 2-2. 카테고리별 진행도 카드 (8개 샘플 데이터 기반 자동 계산) */}
        <div className="bg-tasko-surface rounded-xl p-3.5 border border-tasko-border shadow-xs mb-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-tasko-secondary">카테고리별 진행도</span>
            <span className="text-[11px] text-tasko-muted">총 {categoryStats.length}개 분야</span>
          </div>
          <div className="space-y-2.5">
            {categoryStats.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-tasko-bg text-tasko-secondary border border-tasko-border">
                    {cat.name}
                  </span>
                  <span className="text-xs font-semibold text-tasko-text">
                    {cat.completed}/{cat.total}{' '}
                    <span className={`text-[11px] font-medium ${cat.percentage > 0 ? 'text-tasko-primary' : 'text-tasko-muted'}`}>
                      ({cat.percentage}%)
                    </span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-tasko-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tasko-primary rounded-full transition-all duration-300"
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-3. 가로 스크롤 상태 필터 칩 바 */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* 전체 */}
          <button
            type="button"
            onClick={() => setCurrentFilter('ALL')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all active:scale-95 cursor-pointer ${
              currentFilter === 'ALL'
                ? 'font-semibold bg-tasko-primary text-white shadow-xs'
                : 'font-medium bg-tasko-surface border border-tasko-border text-tasko-text hover:bg-tasko-bg'
            }`}
          >
            <span>전체</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                currentFilter === 'ALL' ? 'font-bold bg-white/20 text-white' : 'font-medium bg-tasko-bg text-tasko-secondary'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* 진행 중 */}
          <button
            type="button"
            onClick={() => setCurrentFilter('IN_PROGRESS')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all active:scale-95 cursor-pointer ${
              currentFilter === 'IN_PROGRESS'
                ? 'font-semibold bg-tasko-primary text-white shadow-xs'
                : 'font-medium bg-tasko-surface border border-tasko-border text-tasko-text hover:bg-tasko-bg'
            }`}
          >
            <span>진행 중</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                currentFilter === 'IN_PROGRESS'
                  ? 'font-bold bg-white/20 text-white'
                  : 'font-medium bg-tasko-bg text-tasko-secondary'
              }`}
            >
              {inProgressCount}
            </span>
          </button>

          {/* 완료 */}
          <button
            type="button"
            onClick={() => setCurrentFilter('COMPLETED')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all active:scale-95 cursor-pointer ${
              currentFilter === 'COMPLETED'
                ? 'font-semibold bg-tasko-primary text-white shadow-xs'
                : 'font-medium bg-tasko-surface border border-tasko-border text-tasko-text hover:bg-tasko-bg'
            }`}
          >
            <span>완료</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                currentFilter === 'COMPLETED'
                  ? 'font-bold bg-white/20 text-white'
                  : 'font-medium bg-tasko-bg text-tasko-secondary'
              }`}
            >
              {completedCount}
            </span>
          </button>

          {/* 중요 */}
          <button
            type="button"
            onClick={() => setCurrentFilter('STARRED')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all active:scale-95 cursor-pointer ${
              currentFilter === 'STARRED'
                ? 'font-semibold bg-tasko-primary text-white shadow-xs'
                : 'font-medium bg-tasko-surface border border-tasko-border text-tasko-text hover:bg-tasko-bg'
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 ${
                currentFilter === 'STARRED' ? 'fill-white text-white' : 'fill-tasko-yellow text-tasko-yellow'
              }`}
              viewBox="0 0 24 24"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>중요</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                currentFilter === 'STARRED'
                  ? 'font-bold bg-white/20 text-white'
                  : 'font-medium bg-tasko-bg text-tasko-secondary'
              }`}
            >
              {starredCount}
            </span>
          </button>
        </div>
      </div>

      {/* 3. 중앙 메인 스크롤 영역: 할 일 목록 */}
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 pb-24 no-scrollbar">
        {/* [요구사항] "오늘 할 일 · 전체 보기 >" 링크 */}
        <div className="flex items-center justify-between px-1 pt-1 pb-1">
          <Link
            to="/tasks"
            className="group inline-flex items-center gap-1 text-[13px] font-bold text-tasko-primary hover:text-tasko-primary-hover transition-colors"
          >
            <span>오늘 할 일 · 전체 보기</span>
            <svg
              className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Link>
          <span className="text-[11px] font-medium text-tasko-muted">
            {filteredTasks.length}개 표시 중
          </span>
        </div>

        {/* 할 일 카드 리스트 */}
        {filteredTasks.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 bg-tasko-surface rounded-2xl border border-dashed border-tasko-border">
            <div className="w-10 h-10 rounded-full bg-tasko-bg flex items-center justify-center text-tasko-muted mb-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p className="text-sm font-medium text-tasko-secondary">해당하는 할 일이 없습니다</p>
            <p className="text-xs text-tasko-muted mt-0.5">우측 하단 (+) 버튼을 눌러 새 할 일을 등록해보세요</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask} />
          ))
        )}
      </main>

      {/* 4. 최하단 고정 플로팅 액션 버튼 (FAB +) */}
      <div className="absolute bottom-5 right-5 z-30">
        <button
          type="button"
          onClick={() => setIsBottomSheetOpen(true)}
          aria-label="새로운 태스크 추가"
          className="w-14 h-14 rounded-full bg-tasko-primary hover:bg-tasko-primary-hover active:scale-95 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(30,166,92,0.4)] transition-all cursor-pointer"
        >
          <svg className="w-6 h-6 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {/* 5. 태스크 등록 바텀시트 */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onAddTask={addTask}
      />
    </div>
  );
}
