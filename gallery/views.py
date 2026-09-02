from django.shortcuts import redirect, render
from typing import cast

from .forms import PhotoForm
from .models import Photo

LAYOUTS: dict[str, dict[str, object]] = {
    'strip-4': {
        'title': 'Photo Strip',
        'subtitle': '4 frames in a vertical strip',
        'slots': 4,
        # Export spacing (pixels on the downloaded image)
        'pad': 46,
        'gap': 42,
        # Preview spacing on the editor card (scaled down)
        'preview_pad': 14,
        'preview_gap': 12,
        'export_width': 720,
        'export_slice_h': 540,
        'template': 'frame/layouts/strip_4.html',
    },
    'square-4': {
        'title': 'Square 2x2',
        'subtitle': '4 frames in a square grid',
        'slots': 4,
        'pad': 24,
        'gap': 16,
        'preview_pad': 12,
        'preview_gap': 8,
        'export_width': 1200,
        'template': 'frame/layouts/square_4.html',
    },
    'solo-1': {
        'title': 'Solo Star',
        'subtitle': 'Single portrait frame',
        'slots': 1,
        'pad': 48,
        'gap': 0,
        'preview_pad': 16,
        'preview_gap': 0,
        'export_width': 1200,
        'export_height': 1600,
        'template': 'frame/layouts/solo_1.html',
    },
    'grid-6': {
        'title': 'Gallery Mix',
        'subtitle': '6 frames in a 2x3 grid',
        'slots': 6,
        'pad': 20,
        'gap': 12,
        'preview_pad': 10,
        'preview_gap': 6,
        'export_width': 1200,
        'template': 'frame/layouts/grid_6.html',
    },
    'duo-2': {
        'title': 'Duo Story',
        'subtitle': '2 landscape frames',
        'slots': 2,
        'pad': 40,
        'gap': 32,
        'preview_pad': 14,
        'preview_gap': 10,
        'export_width': 1000,
        'export_slice_h': 375,
        'template': 'frame/layouts/duo_2.html',
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