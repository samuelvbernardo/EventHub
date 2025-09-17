from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Inscricao, Notificacao

@receiver(post_save, sender=Inscricao)
def criar_notificacao_apos_inscricao(sender, instance, created, **kwargs):
    """
    Cria uma notificação automaticamente quando uma inscrição é criada.
    """
    if created:
        # verifica se já existe notificação para esse participante e evento
        notificacao_existente = Notificacao.objects.filter(
            participante=instance.participante,
            evento=instance.evento
        ).exists()

        if not notificacao_existente:
            Notificacao.objects.create(
                participante=instance.participante,
                evento=instance.evento,
                mensagem=f"Sua inscrição no evento '{instance.evento.titulo}' foi registrada com status '{instance.status}'."
            )
