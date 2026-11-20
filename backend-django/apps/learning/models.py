from django.conf import settings
from django.db import models
from django.utils import timezone


class SkillPath(models.Model):
    """A curriculum such as Full Stack Web Development."""

    id = models.SlugField(primary_key=True, max_length=80, help_text='Used in links, e.g. full-stack-web.')
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=40, blank=True)
    color = models.CharField(max_length=40, blank=True)
    tag = models.CharField(max_length=40, blank=True)
    modules = models.JSONField(default=list, blank=True, help_text='Module list shown on the path page.')
    order = models.PositiveIntegerField(default=0, db_index=True)
    is_default = models.BooleanField(default=False, help_text='The path new students start on.')
    classroom = models.ForeignKey(
        'classrooms.Classroom', null=True, blank=True, on_delete=models.CASCADE, related_name='paths',
        help_text='Leave empty for a public path. Set it to make a path only one class can see.',
    )
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'title']

    def __str__(self):
        return self.title


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
