import shutil
import tempfile
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image

from .models import Photo


class PhotoUploadTests(TestCase):
    def setUp(self):
        self.media_dir = tempfile.mkdtemp()
        self.override = override_settings(MEDIA_ROOT=self.media_dir)
        self.override.enable()

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.media_dir, ignore_errors=True)

    def test_photo_upload_creates_record(self):
        buffer = BytesIO()
        Image.new('RGB', (100, 100), 'blue').save(buffer, format='JPEG')
        buffer.seek(0)
        upload = SimpleUploadedFile('test.jpg', buffer.getvalue(), content_type='image/jpeg')

        response = self.client.post(
            reverse('gallery:photo_upload'),
            {'title': 'Test Photo', 'image': upload},
            follow=True,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Photo.objects.count(), 1)
        photo = Photo.objects.first()
        self.assertTrue(photo.image.name.startswith('uploads/test'))
        self.assertEqual(response.context['latest_photo'], photo)
        self.assertEqual(response.context['frame_two'], [])
        self.assertEqual(response.context['other_photos'], [])
