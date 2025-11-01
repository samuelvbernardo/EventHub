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
    organizer = models.ForeignKey(
        "Organizador",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="eventos",
    )
    capacidade = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    tipo = models.CharField(max_length=20, choices=[
        ("presencial", "Presencial"),
        ("virtual", "virtual"),
        ("hibrido", "Híbrido")
        ], 
        default="presencial"
    )
    preco = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)

    
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
    # Destinatário: ou participante OU organizador (um dos dois)
    participante = models.ForeignKey(
        Participante,
        on_delete=models.CASCADE,
        related_name="notificacoes",
        null=True,
        blank=True,
    )
    organizador = models.ForeignKey(
        "Organizador",
        on_delete=models.CASCADE,
        related_name="notificacoes",
        null=True,
        blank=True,
    )
    evento = models.ForeignKey(
        Evento,
        on_delete=models.CASCADE,
        related_name="notificacoes"
    )
    is_read = models.BooleanField(default=False)

    objects = ActiveManager()       # só retorna registros ativos
    all_objects = models.Manager()  # retorna tudo (inclusive deletados)

    def __str__(self):
        destinatario = None
        if self.participante:
            destinatario = self.participante.nome
        elif hasattr(self, "organizador") and self.organizador:
            destinatario = self.organizador.nome
        else:
            destinatario = "N/A"
        return f"Notificação: {destinatario} -> {self.evento.titulo}"


class Organizador(BaseModel):
    """Representa um organizador de eventos."""
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True)
    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=30, blank=True, null=True)
    empresa = models.CharField(max_length=200, blank=True, null=True)

    objects = ActiveManager()
    all_objects = models.Manager()

    def __str__(self):
        return self.nome