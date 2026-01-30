from django.shortcuts import redirect, render

from .forms import PhotoForm
from .models import Photo


def photo_upload(request):
    photos = list(Photo.objects.order_by('-uploaded_at'))
    latest_photo = photos[0] if photos else None
    frame_two = photos[1:3] if len(photos) > 1 else []
    other_photos = photos[3:]
    if request.method == 'POST':
        form = PhotoForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('gallery:photo_upload')
    else:
        form = PhotoForm()
    return render(
        request,
        'gallery/photo_upload.html',
        {
            'form': form,
            'latest_photo': latest_photo,
            'frame_two': frame_two,
            'other_photos': other_photos,
        },
    )
