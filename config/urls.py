from django.contrib import admin
from django.urls import path
from portfolio import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('projects/<slug:slug>/', views.project_detail, name='project_detail'),
    path('api/projects/', views.api_projects, name='api_projects'),
    path('api/health/', views.api_health, name='api_health'),
    path('api/contact/', views.api_contact, name='api_contact'),
    path('api/ai/chat/', views.api_ai_chat, name='api_ai_chat'),
]
handler404 = 'portfolio.views.not_found'
