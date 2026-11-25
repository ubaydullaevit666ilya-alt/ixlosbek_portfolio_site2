import json
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from django.core.cache import cache
from django.views.decorators.http import require_GET
from .models import ContactMessage, PageVisit, Project

# Персональные данные портфолио
NAME = "Ихлосбек"
TELEGRAM = "DarkNightZone"
EMAIL = "ubaydullaevit666ilya@gmail.com"

PROJECTS = [
    {
        "slug": "infagram",
        "name": "InfaGram",
        "description": "Веб-приложение для общения с друзьями: регистрация, вход, режим управления жестами и ИИ-функции.",
        "tags": ["Python", "HTML", "CSS", "PythonAnywhere"],
        "url": "https://ixlosbekexe.pythonanywhere.com/",
        "action": "Открыть проект",
        "number": "01",
    },
    {
        "slug": "neon-pong-evolution",
        "name": "Neon Pong Evolution",
        "description": "Неоновый пинг-понг: боты трёх уровней, игра вдвоём, аккаунты, монеты и магазин эффектов для мяча.",
        "tags": ["HTML", "CSS", "JavaScript", "Netlify"],
        "url": "https://ping-pong-aliv.netlify.app/",
        "action": "Играть",
        "number": "02",
    },
    {
        "slug": "laptop-zone",
        "name": "Laptop Zone",
        "description": "Каталог ноутбуков с фильтрами по цене, бренду и типу, настройкой цветовой темы и неона.",
        "tags": ["HTML", "CSS", "JavaScript", "Netlify"],
        "url": "https://laptop-shop-ultra.netlify.app/",
        "action": "Открыть проект",
        "number": "03",
    },
    {
        "slug": "techness-teacher",
        "name": "TechnessTeacher",
        "description": "Платформа для изучения Python: курсы и задания, система XP, премиум-видео и админ-панель.",
        "tags": ["HTML", "CSS", "JavaScript", "Netlify"],
        "url": "https://technessteacher.netlify.app/",
        "action": "Открыть проект",
        "number": "04",
    },
    {
        "slug": "saturn-hand-control",
        "name": "Saturn Hand Control",
        "description": "Управление 3D-фигурами жестами руки через камеру: Сатурн, куб, сфера и пирамида.",
        "tags": ["JavaScript", "3D", "Распознавание рук", "Netlify"],
        "url": "https://saturn-hand.netlify.app/",
        "action": "Попробовать",
        "number": "05",
    },
    {
        "slug": "avto-market",
        "name": "Avto Market",
        "description": "Веб-проект автомобильного маркетплейса.",
        "tags": ["Автомобили", "Marketplace", "Netlify"],
        "url": "https://avto-market.netlify.app/",
        "action": "Открыть проект",
        "number": "06",
    },
]

SKILLS = [
    {"name": "Python", "description": "Логика и серверная разработка", "level": 55},
    {"name": "HTML", "description": "Структура веб-страниц", "level": 50},
    {"name": "CSS", "description": "Дизайн и адаптивная вёрстка", "level": 40},
]

TIMELINE = [
    {
        "label": "ОСНОВА",
        "title": "Год обучения программированию",
        "description": "Прошёл годовые курсы программирования и получил базу для дальнейшей практики.",
    },
    {
        "label": "ПРАКТИКА",
        "title": "Собственные веб-проекты",
        "description": "Закрепляю знания на практике: собираю интерфейсы, добавляю функции и публикую проекты.",
    },
    {
        "label": "СЕЙЧАС",
        "title": "Развитие портфолио",
        "description": "Продолжаю изучать Python и веб-разработку, улучшаю свои проекты и осваиваю новые инструменты.",
    },
]

BOOT_LINES = [
    "INITIALIZING IXLOSBEK.PORTFOLIO ...",
    "Подключение модулей Python ........ OK",
    "Загрузка HTML-структуры ........... OK",
    "Компиляция визуальных стилей CSS .. OK",
    "Инициализация анимаций ............ OK",
    f"Поиск проектов .................... FOUND {len(PROJECTS):02d}",
    "Проверка адаптивности ............. OK",
    "Сборка интерфейса ................. COMPLETE",
    "Добро пожаловать. Запускаю сайт...",
]

ROLES = ["Python Developer", "Web Builder", "Django Developer", "Lifelong Learner"]

STATS = [
    {"value": len(PROJECTS), "label": "проектов в портфолио"},
    {"value": len(SKILLS), "label": "основных навыка"},
    {"value": 1, "label": "год курсов"},
]

MARQUEE = ["Python", "Django", "HTML", "CSS", "JavaScript", "Netlify", "PythonAnywhere", "3D", "UI / UX"]
PROJECT_FILTERS = ["Python", "JavaScript", "HTML", "CSS", "3D"]


def build_snippet() -> list[str]:
    """Python-код для окна в hero, собранный из данных портфолио."""
    stack = ", ".join(f'"{skill["name"]}"' for skill in SKILLS)
    return [
        "class Developer:",
        f'    name = "{NAME}"',
        f"    stack = [{stack}]",
        f"    projects = {len(PROJECTS)}",
        "",
        "    def mission(self):",
        '        return "build · learn · repeat"',
        "",
        "me = Developer()",
        "print(me.mission())",
    ]


def page_context() -> dict:
    return dict(
        name=NAME,
        telegram=TELEGRAM,
        email=EMAIL,
        projects=PROJECTS,
        skills=SKILLS,
        boot_lines=BOOT_LINES,
        roles=ROLES,
        stats=STATS,
        marquee=MARQUEE,
        snippet=build_snippet(),
        timeline=TIMELINE,
        project_filters=PROJECT_FILTERS,
        marquee_twice=MARQUEE * 2,
        boot_lines_json=json.dumps(BOOT_LINES, ensure_ascii=False),
        roles_json=json.dumps(ROLES, ensure_ascii=False),
        snippet_json=json.dumps(build_snippet(), ensure_ascii=False),
    )




def _project_data():
    rows = list(Project.objects.filter(featured=True).values('slug', 'name', 'description', 'tags', 'url', 'action', 'number'))
    return rows if rows else PROJECTS


def home(request):
    if not request.session.session_key:
        request.session.create()
    # Store anonymous visit data only; no IP address or personal identifier is collected.
    if not request.session.get('portfolio_visit_logged'):
        PageVisit.objects.create(path='/', session_key=request.session.session_key or '')
        request.session['portfolio_visit_logged'] = True
    context = page_context()
    context['projects'] = _project_data()
    context['stats'] = [dict(value=len(context['projects']), label='проектов в портфолио'), *STATS[1:]]
    for project in context["projects"]:
        project["tags_lower"] = "|".join(project["tags"]).lower()
        project["search_text"] = " ".join([project["name"], project["description"], *project["tags"]]).lower()
    return render(request, "portfolio/index.html", context)


def project_detail(request, slug):
    if Project.objects.exists():
        project = Project.objects.filter(slug=slug, featured=True).values('slug', 'name', 'description', 'tags', 'url', 'action', 'number').first()
    else:
        project = next((item for item in PROJECTS if item["slug"] == slug), None)
    if project is None:
        return render(request, "portfolio/404.html", {"name": NAME}, status=404)
    return render(request, "portfolio/project_detail.html", {"project": project, "name": NAME})


def api_projects(request):
    query = request.GET.get("q", "").strip().casefold()
    tag = request.GET.get("tag", "").strip().casefold()
    items = _project_data()
    if query:
        items = [item for item in items if query in " ".join([item["name"], item["description"], *item["tags"]]).casefold()]
    if tag:
        items = [item for item in items if tag in [value.casefold() for value in item["tags"]]]
    return JsonResponse(items, safe=False, json_dumps_params={"ensure_ascii": False})


def api_health(request):
    return JsonResponse({"status": "ok", "service": "ixlosbek-portfolio", "projects": Project.objects.filter(featured=True).count() or len(PROJECTS)})


def not_found(request, exception):
    return render(request, "portfolio/404.html", {"name": NAME}, status=404)


@require_POST
@csrf_protect
def api_contact(request):
    session_key = request.session.session_key or 'anonymous'
    rate_key = f"ix_contact_rate_{session_key}"
    if cache.get(rate_key, 0) >= 5:
        return JsonResponse({"error": "Слишком много сообщений. Попробуй позже."}, status=429)
    try:
        payload = json.loads(request.body or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Некорректный запрос."}, status=400)
    sender = str(payload.get("sender", "")).strip()
    subject = str(payload.get("subject", "")).strip()
    message = str(payload.get("message", "")).strip()
    email = str(payload.get("email", "")).strip()
    if not sender or not subject or not message:
        return JsonResponse({"error": "Заполни имя, тему и сообщение."}, status=400)
    if len(sender) > 70 or len(subject) > 90 or len(message) > 1200 or len(email) > 254:
        return JsonResponse({"error": "Слишком длинное поле."}, status=400)
    ContactMessage.objects.create(sender=sender, subject=subject, message=message, email=email)
    cache.set(rate_key, cache.get(rate_key, 0) + 1, 3600)
    return JsonResponse({"ok": True, "message": "Сообщение сохранено. Спасибо!"})


def _local_ai_answer(message, projects=None):
    """Сценарный помощник: отвечает по данным портфолио без внешнего AI API."""
    q = " ".join(str(message).casefold().split())
    projects = projects or _project_data()

    if any(word in q for word in ("ты настоящий", "настоящий ии", "нейросет", "искусственный интеллект", "как ты работаешь")):
        return (
            "Я IX Assistant — локальный помощник сайта. Я не являюсь нейросетью: "
            "подбираю заранее подготовленные ответы по ключевым словам и данным портфолио. "
            "Для моей работы не нужны API-ключ или платная подписка."
        )
    if any(word in q for word in ("привет", "здравств", "hello", "салам", "добрый день")):
        return "Привет! Я IX Assistant. Могу рассказать о проектах, технологиях, обучении Ихлосбека и способах связи. Что интересно?"
    if any(word in q for word in ("контакт", "связ", "телеграм", "почт", "email", "заказ", "сотруднич", "нанять")):
        return f"Связаться с Ихлосбеком можно в Telegram: @{TELEGRAM} или по email: {EMAIL}. Ссылки также есть в разделе «Контакты»."
    if any(word in q for word in ("навык", "стек", "технолог", "python", "django", "javascript", "html", "css", "умеет", "язык программирования")):
        return "В навыках портфолио указаны Python, HTML и CSS. В проектах также используются JavaScript и Django; в Saturn Hand Control применяются 3D-графика и распознавание жестов."
    if any(word in q for word in ("кто", "обо мне", "автор", "ихлосбек", "обуч", "курс", "опыт")):
        return "Ихлосбек — начинающий разработчик. Он прошёл годовые курсы программирования, создаёт собственные веб-проекты и продолжает развиваться в Python и веб-разработке."
    if any(word in q for word in ("все проекты", "список проектов", "какие проекты", "покажи проекты", "расскажи о проектах", "проект", "портфолио")):
        if not projects:
            return "Пока в портфолио нет опубликованных проектов."
        names = ", ".join(item.get("name", "Проект") for item in projects)
        return f"В портфолио {len(projects)} проектов: {names}. Открой карточку любого проекта, чтобы посмотреть описание и перейти к демо."

    # Подробный ответ о конкретном проекте, включая проекты, изменённые через Django Admin.
    for project in projects:
        name = str(project.get("name", ""))
        slug = str(project.get("slug", "")).replace("-", " ")
        if (name and name.casefold() in q) or (slug and slug.casefold() in q):
            tags = project.get("tags", [])
            stack = ", ".join(tags) if isinstance(tags, list) else str(tags)
            result = f"{name}: {project.get('description', 'Описание пока не добавлено')}"
            if stack:
                result += f" Технологии: {stack}."
            return result

    if any(word in q for word in ("сатурн", "жест", "камера", "3d")):
        return "Saturn Hand Control — проект, в котором можно управлять 3D-фигурами жестами руки через камеру: Сатурном, кубом, сферой и пирамидой."
    if any(word in q for word in ("цена", "стоимость", "сколько стоит", "бесплатно", "оплата")):
        return "По вопросам стоимости разработки лучше напрямую связаться с Ихлосбеком в Telegram @DarkNightZone или по email. Цена зависит от задачи и её объёма."
    if any(word in q for word in ("спасибо", "благодарю")):
        return "Пожалуйста! Рад помочь. Можешь спросить о конкретном проекте или технологиях."
    return (
        "Пока я умею отвечать только на типовые вопросы по этому портфолио. "
        "Попробуй спросить о проектах, например InfaGram или Saturn Hand Control, "
        "о технологиях, обучении или контактах Ихлосбека."
    )


@require_POST
@csrf_protect
def api_ai_chat(request):
    """Локальный сценарный чат; внешние API и сетевые запросы не используются."""
    ip = request.META.get("REMOTE_ADDR", "unknown")
    rate_key = f"ix_ai_rate_{ip}"
    count = cache.get(rate_key, 0)
    if count >= 15:
        return JsonResponse({"error": "Слишком много запросов. Подожди минуту и попробуй снова."}, status=429)
    cache.set(rate_key, count + 1, 60)
    try:
        payload = json.loads(request.body or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Некорректный JSON."}, status=400)
    message = str(payload.get("message", "")).strip()[:1500]
    if not message:
        return JsonResponse({"error": "Напиши вопрос."}, status=400)
    return JsonResponse({
        "reply": _local_ai_answer(message, _project_data()),
        "mode": "local",
        "label": "ЛОКАЛЬНЫЙ ПОМОЩНИК",
    }, json_dumps_params={"ensure_ascii": False})

