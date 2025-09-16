from rest_framework.routers import DefaultRouter
from .viewsets import EventoViewSet

router = DefaultRouter()
router.register(r'eventos', EventoViewSet)


urlpatterns = router.urls

