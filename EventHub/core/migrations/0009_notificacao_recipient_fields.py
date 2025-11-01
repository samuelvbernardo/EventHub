from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_evento_organizer_notificacao_is_read'),
    ]

    operations = [
        migrations.AddField(
            model_name='notificacao',
            name='organizador',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notificacoes', to='core.organizador'),
        ),
        migrations.AlterField(
            model_name='notificacao',
            name='participante',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notificacoes', to='core.participante'),
        ),
    ]
