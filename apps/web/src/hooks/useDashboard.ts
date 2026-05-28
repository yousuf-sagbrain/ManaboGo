"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export interface DashboardStats {
  day_streak: number;
  longest_streak: number;
  sakura_coins: number;
  xp_total: number;
  xp_level: number;
  lessons_completed: number;
  vocab_mastered: number;
  last_activity_date: string | null;
}

export interface LessonBrief {
  id: string;
  title: string;
  title_ja: string | null;
  type: string;
  description: string;
  sort_order: number;
  is_free: boolean;
  completed: boolean;
}

interface ReviewQueueMeta {
  total_due: number;
}

interface DashboardData {
  stats: DashboardStats | null;
  lessons: LessonBrief[];
  totalDue: number;
  loading: boolean;
  error: string | null;
}

const EMPTY_STATS: DashboardStats = {
  day_streak: 0,
  longest_streak: 0,
  sakura_coins: 0,
  xp_total: 0,
  xp_level: 1,
  lessons_completed: 0,
  vocab_mastered: 0,
  last_activity_date: null,
};

export function useDashboard(): DashboardData {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lessons, setLessons] = useState<LessonBrief[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Fire all three requests in parallel
        const [statsData, lessonsData, queueMeta] = await Promise.all([
          apiFetch<DashboardStats>("/content/stats"),
          apiFetch<LessonBrief[]>("/content/lessons"),
          apiFetch<ReviewQueueMeta>("/content/review-queue?limit=1&include_new=false"),
        ]);

        if (cancelled) return;
        setStats(statsData);
        setLessons(lessonsData);
        setTotalDue(queueMeta.total_due);
      } catch {
        if (!cancelled) setError("Could not load dashboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { stats, lessons, totalDue, loading, error };
}

/** First lesson not yet completed, or the first lesson if all are done. */
export function nextLesson(lessons: LessonBrief[]): LessonBrief | null {
  return lessons.find((l) => !l.completed) ?? lessons[0] ?? null;
}

/** XP needed to reach next level (500 XP per level). */
export function xpToNextLevel(xpTotal: number): { current: number; needed: number; pct: number } {
  const current = xpTotal % 500;
  return { current, needed: 500, pct: Math.round((current / 500) * 100) };
}
