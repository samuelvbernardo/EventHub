from django.db import models
from django.conf import settings

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
