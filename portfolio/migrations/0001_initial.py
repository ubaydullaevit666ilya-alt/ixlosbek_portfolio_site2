from django.db import migrations, models

def seed_projects(apps, schema_editor):
    Project = apps.get_model('portfolio', 'Project')
    projects = [
        ('infagram', 'InfaGram', 'Веб-приложение для общения с друзьями: регистрация, вход, режим управления жестами и ИИ-функции.', ['Python', 'HTML', 'CSS', 'PythonAnywhere'], 'https://ixlosbekexe.pythonanywhere.com/', 'Открыть проект', '01'),
        ('neon-pong-evolution', 'Neon Pong Evolution', 'Неоновый пинг-понг: боты трёх уровней, игра вдвоём, аккаунты, монеты и магазин эффектов для мяча.', ['HTML', 'CSS', 'JavaScript', 'Netlify'], 'https://ping-pong-aliv.netlify.app/', 'Играть', '02'),
        ('laptop-zone', 'Laptop Zone', 'Каталог ноутбуков с фильтрами по цене, бренду и типу, настройкой цветовой темы и неона.', ['HTML', 'CSS', 'JavaScript', 'Netlify'], 'https://laptop-shop-ultra.netlify.app/', 'Открыть проект', '03'),
        ('techness-teacher', 'TechnessTeacher', 'Платформа для изучения Python: курсы и задания, система XP, премиум-видео и админ-панель.', ['HTML', 'CSS', 'JavaScript', 'Netlify'], 'https://technessteacher.netlify.app/', 'Открыть проект', '04'),
        ('saturn-hand-control', 'Saturn Hand Control', 'Управление 3D-фигурами жестами руки через камеру: Сатурн, куб, сфера и пирамида.', ['JavaScript', '3D', 'Распознавание рук', 'Netlify'], 'https://saturn-hand.netlify.app/', 'Попробовать', '05'),
        ('avto-market', 'Avto Market', 'Веб-проект автомобильного маркетплейса.', ['Автомобили', 'Marketplace', 'Netlify'], 'https://avto-market.netlify.app/', 'Открыть проект', '06'),
    ]
    for order, item in enumerate(projects):
        slug, name, description, tags, url, action, number = item
        Project.objects.get_or_create(slug=slug, defaults={'name': name, 'description': description, 'tags': tags, 'url': url, 'action': action, 'number': number, 'sort_order': order})

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(name='Project', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('slug', models.SlugField(max_length=80, unique=True)), ('name', models.CharField(max_length=120)), ('description', models.TextField()), ('tags', models.JSONField(blank=True, default=list)), ('url', models.URLField(blank=True)), ('action', models.CharField(default='Открыть проект', max_length=60)), ('number', models.CharField(blank=True, max_length=8)), ('featured', models.BooleanField(default=True)), ('sort_order', models.PositiveIntegerField(default=0)), ('created_at', models.DateTimeField(auto_now_add=True)), ('updated_at', models.DateTimeField(auto_now=True))], options={'ordering': ['sort_order', 'id']}),
        migrations.CreateModel(name='ContactMessage', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('sender', models.CharField(max_length=70)), ('email', models.EmailField(blank=True, max_length=254)), ('subject', models.CharField(max_length=90)), ('message', models.TextField(max_length=1200)), ('created_at', models.DateTimeField(auto_now_add=True)), ('is_read', models.BooleanField(default=False))], options={'ordering': ['-created_at']}),
        migrations.CreateModel(name='PageVisit', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('path', models.CharField(db_index=True, max_length=255)), ('visited_at', models.DateTimeField(db_index=True, auto_now_add=True)), ('session_key', models.CharField(blank=True, max_length=40))], options={'ordering': ['-visited_at']}),
        migrations.RunPython(seed_projects, migrations.RunPython.noop),
    ]
