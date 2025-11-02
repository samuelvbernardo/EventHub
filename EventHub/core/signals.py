from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Inscricao, Notificacao
from decimal import Decimal

@receiver(post_save, sender=Inscricao)
def criar_notificacao_apos_inscricao(sender, instance, created, **kwargs):
    """
    Cria notificações automaticamente quando uma inscrição é criada ou atualizada.
    - Evento gratuito (preco = 0): status "confirmada" → mensagem de sucesso
    - Evento pago (preco > 0): status "pendente" → mensagem de aguardando pagamento
    - Status "cancelada": notificação de cancelamento
    """
    if created:
        # Determinar se o evento é pago
        is_evento_pago = instance.evento.preco > Decimal('0.00')
        
        # Mensagem para o PARTICIPANTE baseada no status e tipo de evento
        if instance.status == 'confirmada':
            if is_evento_pago:
                mensagem_participante = (
                    f"✅ Sua inscrição no evento '{instance.evento.titulo}' foi confirmada! "
                    f"O pagamento foi processado com sucesso."
                )
            else:
                mensagem_participante = (
                    f"✅ Parabéns! Sua inscrição no evento gratuito '{instance.evento.titulo}' "
                    f"foi confirmada com sucesso. Aguardamos você!"
                )
        elif instance.status == 'pendente':
            mensagem_participante = (
                f"⏳ Sua inscrição no evento '{instance.evento.titulo}' foi registrada com status PENDENTE. "
                f"Verifique seu e-mail para instruções de pagamento (valor: R$ {instance.evento.preco})."
            )
        else:  # cancelada (não deve acontecer no created, mas por segurança)
            mensagem_participante = (
                f"❌ Sua inscrição no evento '{instance.evento.titulo}' foi cancelada."
            )
        
        # Criar notificação para o participante
        Notificacao.objects.create(
            participante=instance.participante,
            evento=instance.evento,
            mensagem=mensagem_participante,
        )

        # Notificação para o ORGANIZADOR (nova inscrição)
        organizador = getattr(instance.evento, 'organizer', None)
        if organizador is not None:
            mensagem_organizador = (
                f"🎉 Nova inscrição ({instance.status}) recebida no evento '{instance.evento.titulo}' "
                f"de {instance.participante.nome}."
            )
            Notificacao.objects.create(
                organizador=organizador,
                evento=instance.evento,
                mensagem=mensagem_organizador,
            )
    else:
        # Atualização: notificar apenas se mudou para cancelada
        if instance.status == 'cancelada':
            # Notificar o participante
            Notificacao.objects.create(
                participante=instance.participante,
                evento=instance.evento,
                mensagem=(
                    f"❌ Sua inscrição no evento '{instance.evento.titulo}' foi cancelada. "
                    f"Você não poderá se inscrever novamente neste evento."
                ),
            )
            
            # Notificar o organizador
            organizador = getattr(instance.evento, 'organizer', None)
            if organizador is not None:
                Notificacao.objects.create(
                    organizador=organizador,
                    evento=instance.evento,
                    mensagem=(
                        f"ℹ️ A inscrição de {instance.participante.nome} no evento "
                        f"'{instance.evento.titulo}' foi cancelada."
                    ),
                )
