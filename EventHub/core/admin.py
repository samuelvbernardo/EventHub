from django.contrib import admin
from .models import Evento, Participante, Inscricao, Notificacao, Organizador

# Admin base para aplicar soft delete
class SoftDeleteAdmin(admin.ModelAdmin):
    """
    Admin base para aplicar soft delete em todos os modelos que herdam de BaseModel.
    """
    def delete_model(self, request, obj):
        obj.delete()

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()

    def get_queryset(self, request):
        # Mostra apenas registros não deletados por padrão
        qs = super().get_queryset(request)
        return qs.filter(is_deleted=False)


@admin.register(Evento)
class EventoAdmin(SoftDeleteAdmin):
    list_display = (
        "titulo", "data_inicio", "data_fim", "local",
        "capacidade", "is_active", "created_at", "updated_at", "is_deleted"
    )
    list_filter = ("is_active", "is_deleted")
    search_fields = ("titulo", "descricao", "local")


@admin.register(Participante)
class ParticipanteAdmin(SoftDeleteAdmin):
    list_display = (
        "nome", "email", "user", "created_at", "updated_at", "is_deleted"
    )
    list_filter = ("is_deleted",)
    search_fields = ("nome", "email", "user__username")


@admin.register(Inscricao)
class InscricaoAdmin(SoftDeleteAdmin):
    list_display = (
        "id", "participante", "evento", "status",
        "data_inscricao", "created_at", "updated_at", "is_deleted"
    )
    list_filter = ("status", "is_deleted")
    search_fields = ("participante__nome", "evento__titulo")


@admin.register(Notificacao)
class NotificacaoAdmin(SoftDeleteAdmin):
    list_display = (
        "id", "mensagem", "participante", "evento",
        "created_at", "updated_at", "is_deleted"
    )
    list_filter = ("is_deleted",)
    search_fields = ("mensagem", "participante__nome", "evento__titulo")

@admin.register(Organizador)
class OrganizadorAdmin(SoftDeleteAdmin):
    list_display = ("user", "nome", "email", "telefone", "empresa")
    list_filter = ("is_deleted",)
    search_fields = ("empresa", "user")