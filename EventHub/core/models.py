from django.db import models
from django.contrib.auth.models import User

# Base para Soft Delete e controle de datas
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)   # quando foi criado
    updated_at = models.DateTimeField(auto_now=True)       # última atualização
    is_active = models.BooleanField(default=True)          # soft delete

    class Meta:
        abstract = True


# Evento principal
class Evento(BaseModel):
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    data_inicio = models.DateTimeField()
    data_fim = models.DateTimeField()
    local = models.CharField(max_length=255)
    capacidade = models.PositiveIntegerField()

    def __str__(self):
        return self.titulo

class Participante(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True)

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

    def __str__(self):
        return f"Notificação: {self.participante.nome} -> {self.evento.titulo}"