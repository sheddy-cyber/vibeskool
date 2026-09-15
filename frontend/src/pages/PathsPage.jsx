import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { Button, ProgressBar } from '@/components/ui';
import styles from './PathsPage.module.css';
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';

function getModuleLessons(path, mod) {
  if (!path?.lessons_data) return [];
  return path.lessons_data.filter(l => {
    const partMatch = l.part && l.part.toLowerCase().startsWith(mod.id.toLowerCase() + ':');
    const idMatch = l.id.toLowerCase().startsWith(mod.id.toLowerCase() + '-') || (mod.id.toLowerCase() === 'm2' && l.id.toLowerCase().startsWith('m2'));
    return partMatch || idMatch;
  });
}

const PathsPage = () => {
  const { pathId } = useParams();
  const { paths, fetchPaths } = useStore();
  const { currentUser } = useAuth();
  const [expandedPathId, setExpandedPathId] = useState(pathId || null);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  useEffect(() => {
    if (pathId) {
      setExpandedPathId(pathId);
    }
  }, [pathId]);

  const toggleExpand = (id) => {
    setExpandedPathId(prev => (prev === id ? null : id));
  };

  const calculateProgress = (path) => {
    const userCompleted = currentUser?.progress?.completedLessons || currentUser?.completedLessons || [];
    const lessons = path.lessons_data || [];
    if (lessons.length === 0) return 0;
    const completed = lessons.filter(l => userCompleted.includes(l.id)).length;
    return Math.round((completed / lessons.length) * 100);
  };

  const isLessonCompleted = (lessonId) => {
    const userCompleted = currentUser?.progress?.completedLessons || currentUser?.completedLessons || [];
    return userCompleted.includes(lessonId);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Courses</h1>
        <p>Pick a track and start learning. Go at your own pace — all lessons are unlocked for free exploration.</p>
      </header>

      <div className={styles.courseList}>
        {paths?.map((path) => {
          const isExpanded = expandedPathId === path.id;
          const progress = calculateProgress(path);
          const hasModules = path.modules && path.modules.length > 0;
          const hasLessons = path.lessons_data && path.lessons_data.length > 0;

          return (
            <div key={path.id} className={styles.courseCard} id={`course-${path.id}`}>
              <div className={styles.courseHeader}>
                <div className={styles.courseInfo}>
                  <h2>{path.name || path.title}</h2>
                  <p>{path.description}</p>
                </div>
                
                <div className={styles.courseActions}>
                  <div className={styles.progressSection}>
                    <ProgressBar progress={progress} label={`${progress}% completed`} />
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={() => toggleExpand(path.id)}
                    icon={isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  >
                    {isExpanded ? 'Hide chapters' : 'View chapters'}
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.curriculum}>
                  {hasModules ? (
                    path.modules.map((mod) => {
                      const moduleLessons = getModuleLessons(path, mod);
                      return (
                        <div key={mod.id} className={styles.chapter}>
                          <h3>{mod.title}</h3>
                          {mod.goal && <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{mod.goal}</p>}
                          <div className={styles.lessonList}>
                            {moduleLessons.length > 0 ? (
                              moduleLessons.map((lesson) => {
                                const completed = isLessonCompleted(lesson.id);
                                return (
                                  <Link 
                                    key={lesson.id} 
                                    to={`/app/paths/${path.id}/lessons/${lesson.id}`}
                                    className={`${styles.lessonItem} ${completed ? styles.lessonCompleted : ''}`}
                                  >
                                    <span className={styles.statusIcon}>
                                      {completed ? <CheckCircle2 size={16} style={{ color: 'var(--green)' }} /> : <Circle size={16} style={{ color: 'var(--text-tertiary)' }} />}
                                    </span>
                                    <span className={styles.lessonTitle}>
                                      {lesson.title}
                                    </span>
                                    {lesson.duration && (
                                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', background: 'var(--bg-raised, #f5f5f4)', padding: '2px 8px', borderRadius: '4px' }}>
                                        {lesson.duration}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })
                            ) : (
                              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', fontStyle: 'italic' }}>
                                No lessons in this chapter yet.
                              </p>
                            )}
                            <Link 
                              to={`/app/paths/${path.id}/modules/${mod.id}/skill-check`}
                              className={styles.quizLink}
                            >
                              Quick Quiz →
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : hasLessons ? (
                    <div className={styles.chapter}>
                      <h3>All Lessons</h3>
                      <div className={styles.lessonList}>
                        {path.lessons_data.map((lesson) => {
                          const completed = isLessonCompleted(lesson.id);
                          return (
                            <Link 
                              key={lesson.id} 
                              to={`/app/paths/${path.id}/lessons/${lesson.id}`}
                              className={`${styles.lessonItem} ${completed ? styles.lessonCompleted : ''}`}
                            >
                              <span className={styles.statusIcon}>
                                {completed ? <CheckCircle2 size={16} style={{ color: 'var(--green)' }} /> : <Circle size={16} style={{ color: 'var(--text-tertiary)' }} />}
                              </span>
                              <span className={styles.lessonTitle}>
                                {lesson.title}
                              </span>
                              {lesson.duration && (
                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                  {lesson.duration}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-tertiary)', padding: '16px', fontStyle: 'italic' }}>
                      Lessons for this track are currently being prepared. Check back soon!
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PathsPage;
