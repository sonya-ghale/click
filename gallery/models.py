from django.db import models


class Photo(models.Model):
    title = models.CharField(max_length=120, blank=True)
    image = models.ImageField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or f'Photo {self.pk}'
