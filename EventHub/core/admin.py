from django.contrib import admin
from .models import *

@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'data_inicio', 'data_fim', 'local', 'capacidade', 'is_active')
    search_fields = ('titulo', 'local')
    list_filter = ('data_inicio', 'data_fim', 'is_active')
    ordering = ('-data_inicio',)

@admin.register(Participante)
class ParticipanteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'email')
    search_fields = ('nome', 'email')
    ordering = ('nome',)

@admin.register(Inscricao)
class InscricaoAdmin(admin.ModelAdmin):
    list_display = ('participante', 'evento', 'data_inscricao')
    search_fields = ('participante__nome', 'evento__titulo')
    list_filter = ('data_inscricao',)
    ordering = ('-data_inscricao',)

@admin.register(Notificacao)
class NotificacaoAdmin(admin.ModelAdmin):
    list_display = ('mensagem', 'participante', 'evento')
    search_fields = ('participante__nome', 'evento__titulo', 'mensagem')
    ordering = ('-id',)