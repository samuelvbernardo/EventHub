from rest_framework import viewsets
from ...models import Evento, Participante, Inscricao, Notificacao
from .serializers import EventoSerializer, ParticipanteSerializer, InscricaoSerializer, NotificacaoSerializer
from rest_framework.permissions import IsAuthenticated

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

    permission_classes = [IsAuthenticated]

class ParticipanteViewSet(viewsets.ModelViewSet):
    queryset = Participante.objects.all()
    serializer_class = ParticipanteSerializer

    permission_classes = [IsAuthenticated]


class InscricaoViewSet(viewsets.ModelViewSet):
    queryset = Inscricao.objects.all()
    serializer_class = InscricaoSerializer

    permission_classes = [IsAuthenticated]

class NotificacaoViewSet(viewsets.ModelViewSet):
    queryset = Notificacao.objects.all()
    serializer_class = NotificacaoSerializer

    permission_classes = [IsAuthenticated]
