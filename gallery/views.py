from django.shortcuts import redirect, render
from typing import cast

from .forms import PhotoForm
from .models import Photo

# pad = space around the photos, gap = space between photos (pixels, preview and download)
# cols/rows = how photos are arranged in the downloaded image
LAYOUTS: dict[str, dict[str, object]] = {
    'strip-4': {
        'title': 'Photo Strip',
        'subtitle': '4 frames in a vertical strip',
        'slots': 4,
        'pad': 6,
        'gap': 6,
        'cols': 1,
        'rows': 4,
        'template': 'frame/layouts/strip_4.html',
    },
    'square-4': {
        'title': 'Square 2x2',
        'subtitle': '4 frames in a square grid',
        'slots': 4,
        'pad': 6,
        'gap': 6,
        'cols': 2,
        'rows': 2,
        'template': 'frame/layouts/square_4.html',
    },
    'solo-1': {
        'title': 'Solo Star',
        'subtitle': 'Single portrait frame',
        'slots': 1,
        'pad': 6,
        'gap': 6,
        'cols': 1,
        'rows': 1,
        'template': 'frame/layouts/solo_1.html',
    },
    'grid-6': {
        'title': 'Gallery Mix',
        'subtitle': '6 frames in a 2x3 grid',
        'slots': 6,
        'pad': 6,
        'gap': 6,
        'cols': 2,
        'rows': 3,
        'template': 'frame/layouts/grid_6.html',
    },
    'duo-2': {
        'title': 'Duo Story',
        'subtitle': '2 landscape frames',
        'slots': 2,
        'pad': 6,
        'gap': 6,
        'cols': 1,
        'rows': 2,
        'template': 'frame/layouts/duo_2.html',
    },
}


# Download sizes: output keeps each kiosk's width:height proportion (mid-range of its dimensions)
DOWNLOAD_SIZES: list[dict[str, object]] = [
    {
        'key': 'slim-pillar',
        'title': 'Slim / iPad Pillar Booth',
        'dimensions': '45–60 cm W × 45–60 cm D × 1.6–1.8 m H',
        'best_for': 'Sleek modern look, tablet-based setups, easy transport',
        'icon': 'tablet_android',
        'width': 740,
        'height': 2400,
    },
    {
        'key': 'dslr-tower',
        'title': 'Heavy-Duty DSLR Tower',
        'dimensions': '60–75 cm W × 60 cm D × 1.7–2.0 m H',
        'best_for': 'Professional DSLR cameras, internal sub-dye printers, ring lights',
        'icon': 'photo_camera',
        'width': 876,
        'height': 2400,
    },
    {
        'key': 'tabletop',
        'title': 'Tabletop / Countertop Unit',
        'dimensions': '45 cm W × 30 cm D × 60–75 cm H',
        'best_for': 'Placed on a bar, desk, or tripod; ultra-portable',
        'icon': 'desktop_windows',
        'width': 1600,
        'height': 2400,
    },
]


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
    layouts = [{'key': k, 'title': v['title']} for k, v in LAYOUTS.items()]
    return render(
        request,
        "frame/editor.html",
        {'layout': layout, 'layouts': layouts, 'download_sizes': DOWNLOAD_SIZES},
    )


def page_dashboard(request):
    return render(request, "page_dashboard.html")

def two_frame(request):
    return render(request, "frame/two_frame.html")