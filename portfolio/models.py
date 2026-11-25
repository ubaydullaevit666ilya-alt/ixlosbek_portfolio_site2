from django.db import models

class Project(models.Model):
    slug = models.SlugField(max_length=80, unique=True)
    name = models.CharField(max_length=120)
    description = models.TextField()
    tags = models.JSONField(default=list, blank=True)
    url = models.URLField(blank=True)
    action = models.CharField(max_length=60, default='Открыть проект')
    number = models.CharField(max_length=8, blank=True)
    featured = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['sort_order', 'id']
    def __str__(self): return self.name

class ContactMessage(models.Model):
    sender = models.CharField(max_length=70)
    email = models.EmailField(blank=True)
    subject = models.CharField(max_length=90)
    message = models.TextField(max_length=1200)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    class Meta:
        ordering = ['-created_at']
    def __str__(self): return f'{self.sender}: {self.subject}'

class PageVisit(models.Model):
    path = models.CharField(max_length=255, db_index=True)
    visited_at = models.DateTimeField(auto_now_add=True, db_index=True)
    session_key = models.CharField(max_length=40, blank=True)
    class Meta:
        ordering = ['-visited_at']
    def __str__(self): return f'{self.path} — {self.visited_at:%Y-%m-%d %H:%M}'
