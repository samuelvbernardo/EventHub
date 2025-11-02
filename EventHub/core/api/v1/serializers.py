from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from ...models import Evento, Participante, Inscricao, Notificacao, Organizador

class UserRegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=['participante', 'organizador'])
    nome = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    telefone = serializers.CharField(required=False, allow_null=True)
    empresa = serializers.CharField(required=False, allow_null=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role', 'nome', 'telefone', 'empresa')

    def create(self, validated_data):
        role = validated_data.pop('role')
        nome = validated_data.pop('nome')
        telefone = validated_data.pop('telefone', None)
        empresa = validated_data.pop('empresa', None)

        # Verificar se já existe um participante com esse email
        if Participante.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({"email": "Um participante com este e-mail já existe."})

        # Verificar se já existe um organizador com esse email
        if Organizador.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({"email": "Um organizador com este e-mail já existe."})

        # Verificar se já existe um usuário com esse username
        if User.objects.filter(username=validated_data['username']).exists():
            raise serializers.ValidationError({"username": "Um usuário com este nome de usuário já existe."})

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Criar Participante ou Organizador
        if role == 'participante':
            Participante.objects.create(
                user=user,
                nome=nome,
                email=validated_data['email']
            )
        else:  # organizador
            if not empresa:
                raise serializers.ValidationError({"empresa": "Campo obrigatório para organizadores"})
            
            Organizador.objects.create(
                user=user,
                nome=nome,
                email=validated_data['email'],
                telefone=telefone,
                empresa=empresa
            )

        return user

    def to_representation(self, instance):
        refresh = RefreshToken.for_user(instance)
        # Busca o participante associado ao usuário
        try:
            participante = Participante.objects.get(user=instance)
            participante_id = participante.id
            role = 'participante'
        except Participante.DoesNotExist:
            try:
                organizador = Organizador.objects.get(user=instance)
                participante_id = None
                role = 'organizador'
            except Organizador.DoesNotExist:
                participante_id = None
                role = 'participante'

        return {
            'user': {
                'id': instance.id,
                'username': instance.username,
                'email': instance.email,
                'participante_id': participante_id,
                'role': role
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }

class EventoSerializer(serializers.ModelSerializer):
    organizer = serializers.PrimaryKeyRelatedField(read_only=True)
    organizer_nome = serializers.CharField(source='organizer.nome', read_only=True)
    isInscrito = serializers.SerializerMethodField(read_only=True)
    inscricaoStatus = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Evento
        fields = '__all__'

    def create(self, validated_data):
        # Associação automática do organizador com base no usuário autenticado
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            try:
                organizador = getattr(request.user, 'organizador', None)
                if organizador:
                    validated_data['organizer'] = organizador
            except Exception:
                pass
        return super().create(validated_data)

    def get_isInscrito(self, obj):
        """Retorna True se o usuário autenticado possui inscrição ativa (não cancelada) neste evento."""
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        try:
            if not user or not user.is_authenticated:
                return False
            # Garantir que é participante
            if not hasattr(user, 'participante') or user.participante is None:
                return False
            # Existe inscrição não cancelada para este evento?
            return Inscricao.objects.filter(
                evento=obj,
                participante__user=user,
                is_deleted=False
            ).exclude(status='cancelada').exists()
        except Exception:
            return False

    def get_inscricaoStatus(self, obj):
        """Retorna o status da inscrição do usuário autenticado neste evento (ou None se não inscrito)."""
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        try:
            if not user or not user.is_authenticated:
                return None
            # Garantir que é participante
            if not hasattr(user, 'participante') or user.participante is None:
                return None
            # Buscar a inscrição mais recente do usuário para este evento
            inscricao = Inscricao.objects.filter(
                evento=obj,
                participante__user=user,
                is_deleted=False
            ).order_by('-data_inscricao').first()
            
            return inscricao.status if inscricao else None
        except Exception:
            return None


class EventoBriefSerializer(serializers.ModelSerializer):
    organizer_nome = serializers.CharField(source='organizer.nome', read_only=True)

    class Meta:
        model = Evento
        fields = (
            'id', 'titulo', 'data_inicio', 'data_fim', 'local', 'capacidade',
            'is_active', 'tipo', 'preco', 'organizer', 'organizer_nome', 'created_at', 'updated_at'
        )


class ParticipanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participante
        fields = '__all__'


class InscricaoBriefSerializer(serializers.ModelSerializer):
    participante_nome = serializers.CharField(source='participante.nome', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = Inscricao
        fields = ['id', 'participante', 'participante_nome', 'evento', 'evento_titulo', 'status', 'data_inscricao']


class InscricaoSerializer(serializers.ModelSerializer):
    participante_nome = serializers.CharField(source='participante.nome', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = Inscricao
        fields = ['id', 'participante', 'evento', 'status', 'data_inscricao', 'participante_nome', 'evento_titulo']
        read_only_fields = ['status', 'data_inscricao']

    def create(self, validated_data):
        participante = validated_data.get('participante')
        evento = validated_data.get('evento')

        # Se já existir, atualiza
        instance = Inscricao.objects.filter(participante=participante, evento=evento).first()
        if instance:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance

        # Se não existir, cria normalmente. Notificações são geradas via signals.
        instance = super().create(validated_data)
        return instance

class NotificacaoSerializer(serializers.ModelSerializer):
    participante_nome = serializers.CharField(source='participante.nome', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = Notificacao
        fields = '__all__'


class OrganizadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizador
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'deleted_at')


class ParticipanteDetailSerializer(serializers.ModelSerializer):
    inscricoes = serializers.SerializerMethodField()
    total_inscricoes = serializers.SerializerMethodField()

    class Meta:
        model = Participante
        fields = ('id', 'nome', 'email', 'user', 'created_at', 'updated_at', 'inscricoes', 'total_inscricoes')

    def get_inscricoes(self, obj):
        request = self.context.get('request')
        # Filtrar apenas inscrições confirmadas
        qs = obj.inscricoes.filter(status='confirmada').select_related('evento', 'participante')
        try:
            user = getattr(request, 'user', None) if request else None
            if user and hasattr(user, 'organizador') and user.organizador is not None:
                # Organizador vê apenas inscrições confirmadas dos seus eventos
                qs = qs.filter(evento__organizer=user.organizador)
        except Exception:
            pass
        return InscricaoBriefSerializer(qs, many=True).data

    def get_total_inscricoes(self, obj):
        request = self.context.get('request')
        # Contar apenas inscrições confirmadas
        qs = obj.inscricoes.filter(status='confirmada')
        try:
            user = getattr(request, 'user', None) if request else None
            if user and hasattr(user, 'organizador') and user.organizador is not None:
                # Organizador conta apenas inscrições confirmadas dos seus eventos
                return qs.filter(evento__organizer=user.organizador).count()
        except Exception:
            pass
        return qs.count()


class OrganizadorDetailSerializer(serializers.ModelSerializer):
    eventos = EventoBriefSerializer(many=True, read_only=True)
    total_eventos = serializers.SerializerMethodField()

    class Meta:
        model = Organizador
        fields = ('id', 'nome', 'email', 'telefone', 'empresa', 'user', 'created_at', 'updated_at', 'eventos', 'total_eventos')
        read_only_fields = ('id', 'created_at', 'updated_at', 'deleted_at')

    def get_total_eventos(self, obj):
        try:
            return obj.eventos.count()
        except Exception:
            return 0


class EventoDetailSerializer(EventoSerializer):
    inscricoes = InscricaoBriefSerializer(many=True, read_only=True)
    total_inscricoes = serializers.SerializerMethodField()

    class Meta(EventoSerializer.Meta):
        # Mantém todos os campos do Evento e inclui os adicionais declarados acima
        fields = '__all__'

    def get_total_inscricoes(self, obj):
        try:
            return obj.inscricoes.count()
        except Exception:
            return 0
