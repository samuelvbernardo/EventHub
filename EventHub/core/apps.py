from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    
    def ready(self):
        # importa os signals para que sejam registrados
        import core.signals