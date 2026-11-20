import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class SkillPath(models.Model):
    """A course, such as Full Stack Web Development.

    Two kinds:
      * official: VibeSkool's own courses. Everyone sees them once published;
        only admins edit them.
      * tutor courses: made by a team of tutors (CourseMember). Only the team
        sees and edits them; students see them once published, and only in
        the classes the course is shared with.
    """

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'

    id = models.SlugField(primary_key=True, max_length=80, help_text='Used in links, e.g. full-stack-web.')
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=40, blank=True)
    color = models.CharField(max_length=40, blank=True)
    tag = models.CharField(max_length=40, blank=True)
    modules = models.JSONField(default=list, blank=True, help_text='Module list shown on the path page.')
    order = models.PositiveIntegerField(default=0, db_index=True)
    is_default = models.BooleanField(default=False, help_text='The path new students start on.')
    is_official = models.BooleanField(default=False, help_text='A VibeSkool course: public, edited by admins only.')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT, db_index=True)
    classes = models.ManyToManyField(
        'classrooms.Classroom', blank=True, related_name='courses',
        help_text='Tutor courses: students in these classes can see the course once it is published.',
    )
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'title']

    def __str__(self):
        return self.title

    @property
    def is_published(self):
        return self.status == self.Status.PUBLISHED

    def role_of(self, user):
        """'admin', 'owner', 'editor' or None."""
        if not (user and user.is_authenticated):
            return None
        if user.is_admin:
            return 'admin'
        if self.is_official:
            return None
        m = next((m for m in self.team.all() if m.user_id == user.id), None)
        return m.role if m else None

    def can_edit(self, user):
        return self.role_of(user) is not None

    def can_manage(self, user):
        """Delete the course and change who is on the team."""
        return self.role_of(user) in ('admin', 'owner')


class Lesson(models.Model):
    id = models.SlugField(primary_key=True, max_length=80)
    path = models.ForeignKey(SkillPath, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    duration = models.CharField(max_length=20, blank=True, help_text='e.g. 9 min')
    part = models.CharField(max_length=80, blank=True, help_text='Module label, e.g. M1: Tooling')
    mek_label = models.CharField(max_length=120, blank=True)
    sections = models.JSONField(default=list, blank=True, help_text='The lesson body as a list of sections.')
    ai_prompt = models.TextField(blank=True)
    terminal_mission = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0, db_index=True)
    published = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['path__order', 'order']

    def __str__(self):
        return self.title


class LessonCompletion(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='completions')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='completions')
    completed_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['student', 'lesson'], name='one_completion_per_lesson')]
        ordering = ['-completed_at']

    def __str__(self):
        return f'{self.student} finished {self.lesson_id}'


class Streak(models.Model):
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name='streak')
    current = models.PositiveIntegerField(default=0)
    longest = models.PositiveIntegerField(default=0)
    last_active = models.DateField(null=True, blank=True)

    def __str__(self):
        return f'{self.student}: {self.current} days'


class PassedModule(models.Model):
    """A skill check the student passed. module_id matches a SkillCheck."""

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='passed_modules')
    module_id = models.CharField(max_length=40)
    score = models.PositiveSmallIntegerField(default=0)
    passed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['student', 'module_id'], name='one_pass_per_module')]
        ordering = ['module_id']

    def __str__(self):
        return f'{self.student} passed {self.module_id} ({self.score}%)'


class SkillCheck(models.Model):
    """The question bank for one module. A student passes with PASS_MARK percent."""

    PASS_MARK = 70

    module_id = models.CharField(max_length=40, primary_key=True, help_text='e.g. m0')
    title = models.CharField(max_length=160, blank=True)
    path = models.ForeignKey(SkillPath, null=True, blank=True, on_delete=models.SET_NULL, related_name='skill_checks')
    questions_per_attempt = models.PositiveSmallIntegerField(default=10)

    class Meta:
        ordering = ['module_id']

    def __str__(self):
        return self.title or self.module_id


class Question(models.Model):
    skill_check = models.ForeignKey(SkillCheck, on_delete=models.CASCADE, related_name='questions')
    key = models.SlugField(max_length=40, unique=True, help_text='Stable id, e.g. m0-q1')
    topic = models.CharField(max_length=120, blank=True)
    prompt = models.TextField()
    explanation = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['skill_check', 'order']

    def __str__(self):
        return self.prompt[:80]


class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.TextField()
    correct = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.text[:80]


class Exercise(models.Model):
    """A practice task attached to a lesson. Coding exercises are checked against test cases."""

    class Type(models.TextChoices):
        CODING = 'coding', 'Coding'
        MULTIPLE_CHOICE = 'multiple_choice', 'Multiple choice'
        FILL_BLANK = 'fill_blank', 'Fill in the blank'
        FREE_RESPONSE = 'free_response', 'Free response'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.ForeignKey(Lesson, null=True, blank=True, on_delete=models.CASCADE, related_name='exercises')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.CODING)
    language = models.CharField(max_length=20, default='javascript')
    title = models.CharField(max_length=200)
    instructions = models.TextField(blank=True)
    starter_code = models.TextField(blank=True)
    solution_code = models.TextField(blank=True, help_text='Only tutors see this.')
    test_cases = models.JSONField(default=list, blank=True, help_text='[{"input": "add(1, 2)", "expected_output": "3"}]')
    options = models.JSONField(default=list, blank=True)
    points = models.PositiveIntegerField(default=10)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.title


class ExerciseSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exercise_submissions')
    code = models.TextField(blank=True)
    answer_text = models.TextField(blank=True)
    output = models.TextField(blank=True)
    passed = models.BooleanField(default=False)
    score = models.PositiveSmallIntegerField(default=0)
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['-submitted_at']


class CourseMember(models.Model):
    """A tutor on a course team. The owner manages the team; editors edit the content."""

    class Role(models.TextChoices):
        OWNER = 'owner', 'Owner'
        EDITOR = 'editor', 'Editor'

    course = models.ForeignKey(SkillPath, on_delete=models.CASCADE, related_name='team')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_memberships')
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.EDITOR)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['course', 'user'], name='one_seat_per_course')]
        ordering = ['-role', 'added_at']  # owner first

    def __str__(self):
        return f'{self.user} ({self.role}) on {self.course}'


class CourseInvite(models.Model):
    """An invitation for a tutor to join a course team, matched by email.

    The person inviting is never told whether an account exists for the email.
    """

    course = models.ForeignKey(SkillPath, on_delete=models.CASCADE, related_name='invites')
    email = models.EmailField()
    invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['course', 'email'], name='one_invite_per_email')]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.email} → {self.course}'
