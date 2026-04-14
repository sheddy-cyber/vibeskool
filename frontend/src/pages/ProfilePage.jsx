import React from "react";
import { useStore, PATHS } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { ProgressBar, MEKBar } from "@/components/ui";
import styles from "./ProfilePage.module.css";
import { FadeUp, RevealOnScroll, StaggerGroup } from "@/components/ui/Motion";

// SVG icons for builds
const BuildIcons = {
  web: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  bot: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M12 11V5" />
      <circle cx="12" cy="4" r="1" />
      <path d="M8 15h.01M16 15h.01" />
    </svg>
  ),
  api: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  db: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  deploy: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

const BUILDS = [
  {
    icon: BuildIcons.web,
    title: "Landing Page with AI",
    unlocked: (score) => score >= 30,
  },
  {
    icon: BuildIcons.bot,
    title: "Chatbot Interface",
    unlocked: (score) => score >= 50,
  },
  {
    icon: BuildIcons.api,
    title: "REST API (AI-assisted)",
    unlocked: (score) => score >= 65,
  },
  {
    icon: BuildIcons.db,
    title: "Database-backed App",
    unlocked: (score) => score >= 80,
  },
  {
    icon: BuildIcons.deploy,
    title: "Full-Stack Deploy",
    unlocked: (score) => score >= 95,
  },
];

const CheckIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="2,6 5,9 10,3" />
  </svg>
);
const LockIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const PATH_ICONS = {
  "vibe-web": (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  "vibe-coding": (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  "git-github": (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 012 2v7" />
      <line x1="6" y1="9" x2="6" y2="21" />
    </svg>
  ),
  "python-basics": (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  apis: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M8 9l3 3-3 3" />
      <line x1="13" y1="15" x2="16" y2="15" />
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  "sql-basics": (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
};

export default function ProfilePage() {
  const { user: storeUser, progress } = useStore();
  const { currentUser } = useAuth();
  const user = currentUser
    ? {
        name: currentUser.name,
        avatar: currentUser.avatar,
        mekScore: currentUser.mekScore ?? 0,
        lessonsCompleted: currentUser.lessonsCompleted ?? 0,
        buildsUnlocked: currentUser.buildsUnlocked ?? 0,
      }
    : storeUser;

  const totalLessons = PATHS.reduce((sum, p) => sum + p.lessons_data.length, 0);
  const doneLessons = Object.values(progress).reduce((a, b) => a + b, 0);
  const overallPct = Math.round((doneLessons / totalLessons) * 100);

  return (
    <div className={styles.page}>
      {/* Profile card */}
      <FadeUp delay={0}>
        <div className={styles.profileCard}>
          <div className={styles.avatarLg}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--bg-base)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{user.name}</h1>
            <p className={styles.profileSub}>AI-native learner · VibeSkool</p>
            <div className={styles.profileStats}>
              <div className={styles.pStat}>
                <span className={styles.pStatNum}>{user.lessonsCompleted}</span>
                <span className={styles.pStatLabel}>Lessons done</span>
              </div>
              <div className={styles.pStatDiv} />
              <div className={styles.pStat}>
                <span className={styles.pStatNum}>{user.mekScore}%</span>
                <span className={styles.pStatLabel}>MEK Score</span>
              </div>
              <div className={styles.pStatDiv} />
              <div className={styles.pStat}>
                <span className={styles.pStatNum}>{user.buildsUnlocked}</span>
                <span className={styles.pStatLabel}>Builds unlocked</span>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* MEK bar */}
      <FadeUp delay={80}>
        <div>
          <MEKBar
            score={user.mekScore}
            label="enough to build a full landing page with AI"
          />
        </div>
      </FadeUp>

      {/* Overall progress */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Overall Progress</h2>
        <div className={styles.overallProgress}>
          <div className={styles.overallTop}>
            <span className={styles.overallLabel}>Across all paths</span>
            <span className={styles.overallPct}>{overallPct}%</span>
          </div>
          <ProgressBar
            value={doneLessons}
            max={totalLessons}
            color="violet"
            height={6}
          />
          <span className={styles.overallSub}>
            {doneLessons} of {totalLessons} lessons complete
          </span>
        </div>
      </div>

      {/* Per-path progress */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Path Breakdown</h2>
        <div className={styles.pathsBreakdown}>
          {PATHS.map((path) => {
            const done = progress[path.id] || 0;
            const total = path.lessons_data.length;
            const pct = Math.round((done / total) * 100);
            return (
              <div key={path.id} className={styles.pathRow}>
                <span className={styles.pathRowIcon}>
                  {PATH_ICONS[path.id] || PATH_ICONS["vibe-coding"]}
                </span>
                <div className={styles.pathRowInfo}>
                  <div className={styles.pathRowTop}>
                    <span className={styles.pathRowName}>{path.name}</span>
                    <span className={styles.pathRowPct}>{pct}%</span>
                  </div>
                  <ProgressBar
                    value={done}
                    max={total}
                    color={path.color}
                    height={4}
                  />
                  <span className={styles.pathRowSub}>
                    {done} / {total} lessons
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Builds unlocked */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Builds Unlocked</h2>
        <p className={styles.buildsSub}>
          Things you can now build with AI based on your MEK score.
        </p>
        <div className={styles.buildsList}>
          {BUILDS.map((b, i) => {
            const isUnlocked = b.unlocked(user.mekScore);
            return (
              <div
                key={i}
                className={`${styles.buildRow} ${isUnlocked ? styles.buildUnlocked : styles.buildLocked}`}
              >
                <span className={styles.buildIcon}>{b.icon}</span>
                <span className={styles.buildTitle}>{b.title}</span>
                <span className={styles.buildStatus}>
                  {isUnlocked ? (
                    <>
                      <CheckIcon /> Unlocked
                    </>
                  ) : (
                    <>
                      <LockIcon /> Keep learning
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
