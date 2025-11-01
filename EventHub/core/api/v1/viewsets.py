from rest_framework import viewsets, mixins
from rest_framework import serializers
from ...models import Evento, Participante, Inscricao, Notificacao, Organizador
from .serializers import (
    EventoSerializer,
    EventoDetailSerializer,
    ParticipanteSerializer,
    ParticipanteDetailSerializer,
    InscricaoSerializer,
    NotificacaoSerializer,
    OrganizadorSerializer,
    OrganizadorDetailSerializer,
    UserRegisterSerializer,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .permissions import IsOrganizador
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.views import APIView


class RegisterViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """ViewSet que expõe um endpoint POST /auth/register/ para criação de usuário."""
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Se for erro de integridade (duplicidade), retorna 400 em vez de 500
            if 'UNIQUE constraint failed' in str(e):
                if 'auth_user.username' in str(e):
                    return Response(
                        {'username': ['Este nome de usuário já está em uso.']},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if 'core_participante.email' in str(e):
                    return Response(
                        {'email': ['Este e-mail já está em uso.']},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            raise

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    
    def get_permissions(self):
        # leitura pública é permitida (ajuste se necessário)
        if self.action in ['list', 'retrieve']:
            return []
        # criação/edição/exclusão exigem usuário autenticado e organizador
        return [IsAuthenticated(), IsOrganizador()]

    def get_queryset(self):
        """Restringe eventos para o organizador autenticado ver apenas os próprios.
        Participantes/usuários anônimos continuam vendo todos os eventos públicos.
        """
        base_qs = Evento.objects.select_related("organizer").prefetch_related("inscricoes__participante")
        user = getattr(self.request, "user", None)
        try:
            if user and user.is_authenticated and hasattr(user, "organizador") and user.organizador is not None:
                return base_qs.filter(organizer=user.organizador)
        except Exception:
            pass
        return base_qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventoDetailSerializer
        return super().get_serializer_class()

    def perform_create(self, serializer):
        """Ao criar um evento, atribui automaticamente o organizador logado."""
        try:
            organizador = self.request.user.organizador
        except Exception:
            organizador = None

        if organizador is None:
            # segurança: não permitir criação sem organizador
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Usuário não possui perfil de organizador")

        serializer.save(organizer=organizador)

    def perform_update(self, serializer):
        """Ao atualizar, garante que o organizador do evento não seja alterado."""
        instance = self.get_object()
        # preserva o organizador original
        serializer.save(organizer=instance.organizer)

    

class ParticipanteViewSet(viewsets.ModelViewSet):
    queryset = Participante.objects.all()
    serializer_class = ParticipanteSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Participante.objects.all().prefetch_related("inscricoes__evento")

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ParticipanteDetailSerializer
        return super().get_serializer_class()


class InscricaoViewSet(viewsets.ModelViewSet):
    queryset = Inscricao.objects.all()
    serializer_class = InscricaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = Inscricao.objects.select_related("participante", "evento", "evento__organizer")
        try:
            if hasattr(user, 'participante'):
                return base_qs.filter(participante=user.participante)
            elif hasattr(user, 'organizador'):
                return base_qs.filter(evento__organizer=user.organizador)
        except Exception:
            pass
        return Inscricao.objects.none()

    def create(self, request, *args, **kwargs):
        # Validar autenticação
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return Response({"detail": "Participante não autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        # Obter participante do usuário
        try:
            participante = user.participante
        except Exception:
            return Response({"detail": "Participante não foi encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Normalizar payload: aceitar "evento" ou "evento_id"
        data = request.data.copy()
        evento_id = data.get('evento') or data.get('evento_id')
        if not evento_id:
            return Response({"detail": "evento_id é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

        # Prevenir duplicidade
        if Inscricao.objects.filter(participante=participante, evento_id=evento_id, is_deleted=False).exists():
            return Response({"detail": "Você já está inscrito neste evento"}, status=status.HTTP_400_BAD_REQUEST)

        # Buscar o evento para verificar se é pago
        try:
            evento = Evento.objects.get(id=evento_id, is_deleted=False)
        except Evento.DoesNotExist:
            return Response({"detail": "Evento não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Definir status inicial baseado no preço do evento
        # Evento gratuito (preco = 0.00) → status "confirmada"
        # Evento pago (preco > 0.00) → status "pendente" (aguardando pagamento)
        from decimal import Decimal
        is_evento_pago = evento.preco > Decimal('0.00')
        status_inicial = 'pendente' if is_evento_pago else 'confirmada'

        data['evento'] = evento_id
        data['participante'] = participante.id
        data['status'] = status_inicial

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        # Salvar garantindo o status inicial correto mesmo sendo read_only no input
        instance = serializer.save(status=status_inicial)
        headers = self.get_success_headers(serializer.data)

        # Retornar informações adicionais para o frontend exibir a mensagem adequada
        if is_evento_pago:
            message = "Inscrição registrada com status pendente. Aguardando confirmação de pagamento."
        else:
            message = "Inscrição confirmada com sucesso! Você está inscrito neste evento gratuito."
        
        response_data = {
            "message": message,
            "inscricao": self.get_serializer(instance).data,
            "evento_pago": is_evento_pago,
            "status": status_inicial
        }
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=["get"], url_path="organizador")
    def organizador_inscricoes(self, request):
        """Lista inscrições apenas dos eventos do organizador autenticado."""
        user = request.user
        # Garante autenticação e papel
        if not user or not user.is_authenticated:
            return Response({"detail": "Não autenticado"}, status=status.HTTP_401_UNAUTHORIZED)
        if not hasattr(user, 'organizador') or user.organizador is None:
            return Response({"detail": "Acesso restrito a organizadores"}, status=status.HTTP_403_FORBIDDEN)

        queryset = self.get_queryset()  # já filtrado por organizador no get_queryset
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancela a inscrição (status = 'cancelada').
        Apenas o dono (participante) ou o organizador do evento relacionado
        verão a inscrição via get_queryset, então self.get_object() já respeita o escopo.
        """
        inscricao = self.get_object()
        if inscricao.status == "cancelada":
            return Response({"detail": "Inscrição já está cancelada"}, status=status.HTTP_200_OK)

        inscricao.status = "cancelada"
        inscricao.save(update_fields=["status", "updated_at"])
        serializer = self.get_serializer(inscricao)
        return Response(serializer.data, status=status.HTTP_200_OK)

class NotificacaoViewSet(viewsets.ModelViewSet):
    queryset = Notificacao.objects.all()
    serializer_class = NotificacaoSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = Notificacao.objects.select_related("participante", "evento", "evento__organizer", "organizador")
        # Se for organizador, retornar notificações destinadas ao organizador logado
        try:
            if hasattr(user, 'organizador') and user.organizador is not None:
                return base_qs.filter(organizador=user.organizador)
        except Exception:
            pass

        # Se for participante, retornar notificações destinadas ao participante logado
        try:
            if hasattr(user, 'participante') and user.participante is not None:
                return base_qs.filter(participante=user.participante)
        except Exception:
            pass

        return Notificacao.objects.none()

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        """Marca uma notificação como lida."""
        try:
            notificacao = self.get_object()
            notificacao.is_read = True
            notificacao.save()
            return Response({'status': 'marked'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': 'Erro ao marcar como lida'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        user = request.user
        count = 0
        try:
            if hasattr(user, 'organizador') and user.organizador is not None:
                count = Notificacao.objects.filter(organizador=user.organizador, is_read=False).count()
            elif hasattr(user, 'participante') and user.participante is not None:
                count = Notificacao.objects.filter(participante=user.participante, is_read=False).count()
        except Exception:
            count = 0
        return Response({'unread': count}, status=status.HTTP_200_OK)


class OrganizadorViewSet(viewsets.ModelViewSet):
    queryset = Organizador.objects.all()
    serializer_class = OrganizadorSerializer

    # Exigir autenticação para criar e gerenciar organizadores
    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return []
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        """Vincula automaticamente o organizador ao usuário autenticado (Opção A).
        Evita duplicidade: um usuário não pode ter dois perfis de organizador.
        """
        user = self.request.user
        if not user or not user.is_authenticated:
            raise PermissionDenied("É necessário estar autenticado para criar um organizador.")

        if hasattr(user, "organizador") and user.organizador is not None:
            raise ValidationError({"detail": "Usuário já possui perfil de organizador."})

        serializer.save(user=user)

    def get_queryset(self):
        return Organizador.objects.all().prefetch_related("eventos")

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrganizadorDetailSerializer
        return super().get_serializer_class()


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = 'participante'
        participante_id = None
        organizador_id = None
        try:
            if hasattr(user, 'organizador') and user.organizador is not None:
                role = 'organizador'
                organizador_id = user.organizador.id
            elif hasattr(user, 'participante') and user.participante is not None:
                role = 'participante'
                participante_id = user.participante.id
        except Exception:
            pass

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': role,
                'participante_id': participante_id,
                'organizador_id': organizador_id,
            }
        }, status=status.HTTP_200_OK)
