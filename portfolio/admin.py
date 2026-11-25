from django.contrib import admin
from .models import ContactMessage, PageVisit, Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'featured', 'sort_order', 'updated_at')
    list_editable = ('featured', 'sort_order')
    list_filter = ('featured',)
    search_fields = ('name', 'description', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('sort_order', 'id')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'subject', 'email', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('sender', 'email', 'subject', 'message')
    list_editable = ('is_read',)
    readonly_fields = ('sender', 'email', 'subject', 'message', 'created_at')

@admin.register(PageVisit)
class PageVisitAdmin(admin.ModelAdmin):
    list_display = ('path', 'session_key', 'visited_at')
    list_filter = ('visited_at',)
    search_fields = ('path',)
    readonly_fields = ('path', 'session_key', 'visited_at')
