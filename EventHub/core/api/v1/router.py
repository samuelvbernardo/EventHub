from rest_framework.routers import DefaultRouter
from django.urls import path
from .viewsets import (
	EventoViewSet,
	ParticipanteViewSet,
	InscricaoViewSet,
	NotificacaoViewSet,
	OrganizadorViewSet,
	RegisterViewSet,
    MeView,
)

router = DefaultRouter()
router.register(r'eventos', EventoViewSet)
router.register(r'participantes', ParticipanteViewSet)
router.register(r'inscricoes', InscricaoViewSet)
router.register(r'notificacoes', NotificacaoViewSet)
router.register(r'organizadores', OrganizadorViewSet)
router.register(r'auth/register', RegisterViewSet, basename='auth-register')
urlpatterns = router.urls

# Rotas adicionais não baseadas em router
urlpatterns += [
	path('auth/me/', MeView.as_view(), name='auth-me'),
]

