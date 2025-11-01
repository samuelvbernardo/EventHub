from rest_framework.permissions import BasePermission


class IsOrganizador(BasePermission):
    """Permite acesso apenas se o usuário estiver vinculado a um Organizador."""

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        # verifica se existe um Organizador associado
        try:
            organizador = getattr(user, 'organizador', None)
            return organizador is not None
        except Exception:
            return False

    def has_object_permission(self, request, view, obj):
        """Permite operações em objetos apenas se o organizador dono do objeto for o usuário."""
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        try:
            organizador = getattr(user, 'organizador', None)
            if organizador is None:
                return False

            # Se o objeto for um Evento, comparar o campo organizer
            if hasattr(obj, 'organizer'):
                return getattr(obj, 'organizer') == organizador

            # Se for outro objeto relacionado a evento (ex: Inscricao.evento), tentar obter evento
            if hasattr(obj, 'evento') and hasattr(obj.evento, 'organizer'):
                return getattr(obj.evento, 'organizer') == organizador

            return False
        except Exception:
            return False
