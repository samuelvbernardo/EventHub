from rest_framework import serializers
from ...models import Evento, Participante, Inscricao, Notificacao

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'


class ParticipanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participante
        fields = '__all__'


class InscricaoSerializer(serializers.ModelSerializer):
    participante_nome = serializers.CharField(source='participante.nome', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = Inscricao
        fields = '__all__'

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

        # Se não existir, cria normalmente
        return super().create(validated_data)

class NotificacaoSerializer(serializers.ModelSerializer):
    participante_nome = serializers.CharField(source='participante.nome', read_only=True)
    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)

    class Meta:
        model = Notificacao
        fields = '__all__'
