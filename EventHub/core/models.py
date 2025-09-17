from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from core.managers import ActiveManager 

# Base para Soft Delete e controle de datas
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)  # data de criação
    updated_at = models.DateTimeField(auto_now=True)      # data de atualização
    is_deleted = models.BooleanField(default=False)       # soft delete
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True  # não cria tabela no banco

    def delete(self, using=None, keep_parents=False):
        """Soft delete: marca como deletado em vez de remover"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        """Restaura um item deletado"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class Evento(BaseModel):
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    data_inicio = models.DateTimeField()
    data_fim = models.DateTimeField()
    local = models.CharField(max_length=255)
    capacidade = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    
    objects = ActiveManager()       # só retorna registros ativos
    all_objects = models.Manager()  # retorna tudo (inclusive deletados)

    def __str__(self):
        return self.titulo

class Participante(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True)

    objects = ActiveManager()       # só retorna registros ativos
    all_objects = models.Manager()  # retorna tudo (inclusive deletados)

    def __str__(self):
        return self.nome


class Inscricao(BaseModel):
    participante = models.ForeignKey(
        Participante,
        on_delete=models.CASCADE,
        related_name="inscricoes"
    )
    evento = models.ForeignKey(
        Evento,
        on_delete=models.CASCADE,
        related_name="inscricoes"
    )
    data_inscricao = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("pendente", "Pendente"),
            ("confirmada", "Confirmada"),
            ("cancelada", "Cancelada")
        ],
        default="pendente"
    )

    objects = ActiveManager()       # só retorna registros ativos
    all_objects = models.Manager()  # retorna tudo (inclusive deletados)

    class Meta:
        unique_together = ("participante", "evento")  # evita duplicação

    def __str__(self):
        return f"{self.participante.nome} - {self.evento.titulo}"


class Notificacao(BaseModel):
    mensagem = models.TextField()
    participante = models.ForeignKey(
        Participante,
        on_delete=models.CASCADE,
        related_name="notificacoes"
    )
    evento = models.ForeignKey(
        Evento,
        on_delete=models.CASCADE,
        related_name="notificacoes"
    )

    objects = ActiveManager()       # só retorna registros ativos
    all_objects = models.Manager()  # retorna tudo (inclusive deletados)

    def __str__(self):
        return f"Notificação: {self.participante.nome} -> {self.evento.titulo}"