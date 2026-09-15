import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { Button, ProgressBar, EmptyState } from '@/components/ui';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { paths, fetchPaths } = useStore();

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  const userCompleted = currentUser?.progress?.completedLessons || currentUser?.completedLessons || [];
  const completedLessonsCount = userCompleted.length;
  const currentStreak = currentUser?.stats?.currentStreak || currentUser?.currentStreak || 1;

  const continuePath = paths?.find(path => 
    (path.lessons_data || []).some(lesson => userCompleted.includes(lesson.id))
  ) || paths?.[0];

  const nextLessonToLearn = continuePath?.lessons_data?.find(l => !userCompleted.includes(l.id)) || continuePath?.lessons_data?.[0];

  if (!paths) {
    return <div className={styles.page}><p className={styles.loading}>Loading workspace...</p></div>;
  }

  if (paths.length === 0) {
    return (
      <div className={styles.page}>
        <EmptyState title="No courses found" message="There are no courses available right now." />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.greetingBadge}>
          <span className={styles.pulseDot} />
          <span>Active Learning Track</span>
        </div>
        <h1 className={styles.welcomeTitle}>
          Hey, {currentUser?.displayName || currentUser?.name || 'Developer'}
        </h1>
        <p className={styles.subtitle}>Welcome back. Explore at your own pace — your curriculum is fully unlocked.</p>
      </header>

      <section className={styles.globalProgressCard}>
        <div className={styles.progressCardHeader}>
          <div>
            <h2>Overall Mastery</h2>
            <p className={styles.progressSub}>{completedLessonsCount} of 40 lessons completed</p>
          </div>
          <div className={styles.progressTag}>
            {Math.round(Math.min((completedLessonsCount / 40) * 100, 100))}% Total
          </div>
        </div>
        <ProgressBar 
          progress={Math.min((completedLessonsCount / 40) * 100, 100)} 
        />
      </section>

      <div className={styles.middleSection}>
        {continuePath && (
          <div className={styles.continueCard}>
            <div className={styles.cardHeaderSmall}>
              <span className={styles.sectionLabel}>Next Up</span>
            </div>
            <h3>{continuePath.name || continuePath.title}</h3>
            <p>{continuePath.description}</p>
            <div className={styles.continueAction}>
              {nextLessonToLearn ? (
                <Link to={`/app/paths/${continuePath.id}/lessons/${nextLessonToLearn.id}`}>
                  <Button variant="primary" size="md" icon={<ArrowRight size={16} />}>
                    Continue: {nextLessonToLearn.title}
                  </Button>
                </Link>
              ) : (
                <Link to={`/app/paths/${continuePath.id}`}>
                  <Button variant="primary" size="md" icon={<ArrowRight size={16} />}>
                    View Curriculum
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        <div className={styles.streakCard}>
          <div className={styles.cardHeaderSmall}>
            <span className={styles.sectionLabel}>Cadence</span>
          </div>
          <div className={styles.streakContent}>
            <div className={styles.streakSolarIcon}>
              <Flame size={26} />
            </div>
            <div className={styles.streakNumbers}>
              <span className={styles.streakCount}>{currentStreak}</span>
              <span className={styles.streakUnit}>Day Streak</span>
            </div>
          </div>
          <p className={styles.streakSub}>Consistent daily practice builds mastery.</p>
        </div>
      </div>

      <section className={styles.allCoursesSection}>
        <div className={styles.tracksHeader}>
          <h2>Explore Tracks</h2>
          <span className={styles.trackCount}>{paths.length} Tracks Available</span>
        </div>
        
        <div className={styles.courseGrid}>
          {paths.map((path) => {
            const lessons = path.lessons_data || [];
            const completedInPath = lessons.filter(lesson => userCompleted.includes(lesson.id)).length;
            const totalInPath = lessons.length;
            const progress = totalInPath > 0 ? (completedInPath / totalInPath) * 100 : 0;

            return (
              <div key={path.id} className={styles.courseCard}>
                <div className={styles.cardTop}>
                  <h3>{path.name || path.title}</h3>
                  <p>{path.description}</p>
                </div>
                
                {totalInPath > 0 ? (
                  <div className={styles.courseProgress}>
                    <ProgressBar progress={progress} label={`${completedInPath}/${totalInPath} lessons`} />
                  </div>
                ) : (
                  <div className={styles.comingSoon}>
                    <span>Curriculum preparing</span>
                  </div>
                )}
                
                <div className={styles.cardActions}>
                  <Link to={`/app/paths/${path.id}`}>
                    <Button variant="secondary" size="sm" icon={<ArrowRight size={15} />}>
                      Explore Track
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
