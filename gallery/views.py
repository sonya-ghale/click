from django.shortcuts import redirect, render
from typing import cast

from .forms import PhotoForm
from .models import Photo

LAYOUTS: dict[str, dict[str, object]] = {
    'strip-4': {
        'title': 'Photo Strip',
        'subtitle': '4 frames in a vertical strip',
        'container_class': 'flex flex-col gap-2.5',
        'slot_class': 'w-full aspect-[4/1]',
        'slots': 4,
    },
    'square-4': {
        'title': 'Square 2x2',
        'subtitle': '4 frames in a square grid',
        'container_class': 'grid grid-cols-2 gap-2.5',
        'slot_class': 'aspect-square',
        'slots': 4,
    },
    'solo-1': {
        'title': 'Solo Star',
        'subtitle': 'Single portrait frame',
        'container_class': 'flex',
        'slot_class': 'w-full min-h-[300px]',
        'slots': 1,
    },
    'grid-6': {
        'title': 'Gallery Mix',
        'subtitle': '6 frames in a 2x3 grid',
        'container_class': 'grid grid-cols-2 grid-rows-3 gap-2',
        'slot_class': 'aspect-[4/3]',
        'slots': 6,
    },
    'duo-2': {
        'title': 'Duo Story',
        'subtitle': '2 landscape frames',
        'container_class': 'flex flex-col gap-3',
        'slot_class': 'w-full aspect-[3/2]',
        'slots': 2,
    },

}


def _photo_file_exists(photo):
    if not photo.image or not photo.image.name:
        return False
    try:
        return photo.image.storage.exists(photo.image.name)
    except OSError:
        return False


def photo_upload(request):
    raw = list(Photo.objects.order_by('-uploaded_at'))
    photos = [p for p in raw if _photo_file_exists(p)]
    latest_photo = photos[0] if photos else None
    frame_two = photos[1:3] if len(photos) > 1 else []
    other_photos = photos[3:]
    booth_slots = [photos[i] if i < len(photos) else None for i in range(4)]
    if request.method == 'POST':
        form = PhotoForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('gallery:photo_upload')
    else:
        form = PhotoForm()
    booth_slots_data = [
        {'url': p.image.url, 'title': p.title or ''} if p else None for p in booth_slots
    ]

    return render(
        request,
        'gallery/photo_upload.html',
        {
            'form': form,
            'latest_photo': latest_photo,
            'frame_two': frame_two,
            'other_photos': other_photos,
            'booth_slots': booth_slots,
            'booth_slots_data': booth_slots_data,
        },
    )


def frames(request):
    return render(request, "frames.html")


def frame_editor(request):
    key = request.GET.get('layout', 'strip-4')
    layout: dict[str, object] = LAYOUTS.get(key, LAYOUTS['strip-4']).copy()
    layout['key'] = key if key in LAYOUTS else 'strip-4'
    layout['indexes'] = range(cast(int, layout['slots']))
    return render(request, "frame/editor.html", {'layout': layout})


def page_dashboard(request):
    return render(request, "page_dashboard.html")

def two_frame(request):
    return render(request, "frame/two_frame.html")