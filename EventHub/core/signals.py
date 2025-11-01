from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Inscricao, Notificacao

@receiver(post_save, sender=Inscricao)
def criar_notificacao_apos_inscricao(sender, instance, created, **kwargs):
    """
    Cria uma notificação automaticamente quando uma inscrição é criada.
    """
    if created:
        # Notificação para o PARTICIPANTE (confirmação)
        existe_participante = Notificacao.objects.filter(
            participante=instance.participante,
            evento=instance.evento,
        ).exists()
        if not existe_participante:
            Notificacao.objects.create(
                participante=instance.participante,
                evento=instance.evento,
                mensagem=(
                    f"Sua inscrição no evento '{instance.evento.titulo}' foi registrada com status '{instance.status}'."
                ),
            )

        # Notificação para o ORGANIZADOR (nova inscrição)
        organizador = getattr(instance.evento, 'organizer', None)
        if organizador is not None:
            existe_organizador = Notificacao.objects.filter(
                organizador=organizador,
                evento=instance.evento,
            ).exists()
            if not existe_organizador:
                Notificacao.objects.create(
                    organizador=organizador,
                    evento=instance.evento,
                    mensagem=(
                        f"Nova inscrição recebida no evento '{instance.evento.titulo}'."
                    ),
                )
