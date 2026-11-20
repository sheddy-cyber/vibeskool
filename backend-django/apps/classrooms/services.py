"""Who needs help, and where each student stands on each assignment."""
from datetime import timedelta

from django.db.models import Count, Exists, Max, OuterRef, Q
from django.utils import timezone

from apps.learning.models import LessonCompletion
from apps.learning.services import current_streak

from .models import Assignment, Post, Reply, Submission

INACTIVE_AFTER = timedelta(days=7)
UNANSWERED_AFTER = timedelta(hours=24)

# Per student, per assignment
NOT_STARTED, MISSING = 'not_started', 'missing'
DONE = 'done'  # a lesson assignment the student has finished


def assignment_status(assignment, submission=None, finished_lessons=frozenset()):
    if assignment.kind == Assignment.Kind.LESSON:
        if assignment.lesson_id in finished_lessons:
            return DONE
    elif submission:
        return submission.status
    return MISSING if assignment.is_past_due else NOT_STARTED


def is_open(status):
    """Still something for the student to do."""
    return status in (NOT_STARTED, MISSING, Submission.Status.CHANGES)


def roster_for_assignment(assignment, members):
    """Each student's status for one assignment (the tutor's view)."""
    subs = {s.student_id: s for s in assignment.submissions.all()}
    finished = set()
    if assignment.kind == Assignment.Kind.LESSON and assignment.lesson_id:
        finished = set(LessonCompletion.objects.filter(lesson_id=assignment.lesson_id, student__in=[m.student_id for m in members])
                       .values_list('student_id', flat=True))
    rows = []
    for m in members:
        sub = subs.get(m.student_id)
        status = assignment_status(assignment, sub, {assignment.lesson_id} if m.student_id in finished else set())
        rows.append({'student': m.student, 'status': status, 'submission': sub})
    return rows


def status_counts(assignment, members):
    counts = {NOT_STARTED: 0, MISSING: 0, DONE: 0, 'submitted': 0, 'changes_requested': 0, 'approved': 0}
    for row in roster_for_assignment(assignment, members):
        counts[row['status']] += 1
    return counts


def class_insights(classroom):
    """One row per student with the signals a tutor acts on, most urgent first."""
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    members = list(classroom.memberships.select_related('student', 'student__streak'))
    ids = [m.student_id for m in members]

    lesson_stats = {
        r['student_id']: r for r in LessonCompletion.objects.filter(student_id__in=ids)
        .values('student_id').annotate(total=Count('id'), this_week=Count('id', filter=Q(completed_at__gte=week_ago)),
                                       last=Max('completed_at'))
    }
    post_last = dict(Post.objects.filter(classroom=classroom, author_id__in=ids).values('author_id')
                     .annotate(last=Max('created_at')).values_list('author_id', 'last'))
    sub_last = dict(Submission.objects.filter(assignment__classroom=classroom, student_id__in=ids).values('student_id')
                    .annotate(last=Max('submitted_at')).values_list('student_id', 'last'))

    # Questions still waiting on the tutor: unresolved, and the tutor hasn't replied
    tutor_replied = Reply.objects.filter(post=OuterRef('pk'), author=classroom.teacher)
    waiting = list(Post.objects.filter(classroom=classroom, kind=Post.Kind.QUESTION, resolved_at__isnull=True)
                   .exclude(author=classroom.teacher).exclude(Exists(tutor_replied))
                   .select_related('author', 'lesson').order_by('created_at'))
    waiting_by_student = {}
    for q in waiting:
        waiting_by_student.setdefault(q.author_id, []).append(q)

    assignments = list(classroom.assignments.filter(published=True).prefetch_related('submissions'))
    finished = {}
    lesson_ids = {a.lesson_id for a in assignments if a.kind == Assignment.Kind.LESSON and a.lesson_id}
    if lesson_ids:
        for sid, lid in LessonCompletion.objects.filter(student_id__in=ids, lesson_id__in=lesson_ids).values_list('student_id', 'lesson_id'):
            finished.setdefault(sid, set()).add(lid)

    rows = []
    for m in members:
        sid = m.student_id
        ls = lesson_stats.get(sid, {})
        last_active = max([t for t in (m.last_seen_at, ls.get('last'), post_last.get(sid), sub_last.get(sid)) if t], default=None)
        overdue, changes = [], []
        for a in assignments:
            sub = next((s for s in a.submissions.all() if s.student_id == sid), None)
            st = assignment_status(a, sub, finished.get(sid, set()))
            if st == MISSING:
                overdue.append({'id': a.id, 'title': a.title, 'kind': a.kind, 'due_at': a.due_at})
            elif st == Submission.Status.CHANGES:
                changes.append({'id': a.id, 'title': a.title})
        questions = waiting_by_student.get(sid, [])

        flags = []
        if questions and now - questions[0].created_at > UNANSWERED_AFTER:
            flags.append('waiting_on_you')
        if overdue:
            flags.append('overdue')
        if last_active is None or now - last_active > INACTIVE_AFTER:
            flags.append('inactive')
        if changes:
            flags.append('changes_requested')

        streak = getattr(m.student, 'streak', None)
        rows.append({
            'student': m.student,
            'joined_at': m.joined_at,
            'last_active': last_active,
            'lessons_completed': ls.get('total', 0),
            'lessons_this_week': ls.get('this_week', 0),
            'streak': current_streak(streak),
            'xp': m.student.xp,
            'open_questions': len(questions),
            'overdue': overdue,
            'changes_requested': changes,
            'flags': flags,
        })

    order = {'waiting_on_you': 0, 'overdue': 1, 'inactive': 2, 'changes_requested': 3}
    rows.sort(key=lambda r: (min((order[f] for f in r['flags']), default=9), -(r['lessons_this_week'])))
    return rows, waiting



def reanchor_comments(submission, old_code, new_code):
    """Keep line comments attached to their line after the code changes.

    A comment stays put if its line is unchanged, moves if the same line now
    sits elsewhere (the nearest copy wins), and is marked outdated if the
    line was edited or removed. Returns how many became outdated.
    """
    if old_code == new_code:
        return 0
    new_lines = [l.rstrip() for l in new_code.splitlines()]
    outdated = 0
    for c in submission.comments.filter(line__isnull=False, outdated=False):
        target = c.line_text.rstrip()
        if c.line <= len(new_lines) and new_lines[c.line - 1] == target:
            continue
        matches = [i + 1 for i, l in enumerate(new_lines) if target.strip() and l == target]
        if matches:
            c.line = min(matches, key=lambda n: abs(n - c.line))
        else:
            c.outdated = True
            outdated += 1
        c.save(update_fields=['line', 'outdated'])
    return outdated
