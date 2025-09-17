from rest_framework.routers import DefaultRouter
from .viewsets import EventoViewSet, ParticipanteViewSet, InscricaoViewSet, NotificacaoViewSet

router = DefaultRouter()
router.register(r'eventos', EventoViewSet)
router.register(r'participantes', ParticipanteViewSet)
router.register(r'inscricoes', InscricaoViewSet)
router.register(r'notificacoes', NotificacaoViewSet)

urlpatterns = router.urls

