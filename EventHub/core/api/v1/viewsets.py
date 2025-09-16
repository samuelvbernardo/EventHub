from rest_framework import viewsets
from ...models import Evento
from .serializers import EventoSerializer
from rest_framework.permissions import IsAuthenticated

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

    permission_classes = [IsAuthenticated]

