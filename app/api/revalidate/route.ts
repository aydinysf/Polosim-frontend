import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js ISR Revalidation API Endpoint
 * POST /api/revalidate
 *
 * Admin panelde CMS içeriği değiştiğinde bu endpoint çağrılır.
 * İlgili cache tag'ini kırarak sayfa yenilenmesini tetikler.
 *
 * Headers:
 *   X-Revalidation-Secret: Paylaşılan secret key
 *
 * Body:
 *   { type: 'menu' | 'page' | 'banner' | 'faq' | 'setting' | 'testimonial' | 'review' | 'gallery',
 *     identifier?: string }  // slug, handle vb.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Secret kontrolü
    const secret = request.headers.get('X-Revalidation-Secret');
    const expectedSecret = process.env.REVALIDATION_SECRET;

    if (!expectedSecret) {
      console.warn('[Revalidate] REVALIDATION_SECRET not configured');
      return NextResponse.json(
        { error: 'Server not configured for revalidation' },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      console.warn('[Revalidate] Invalid secret received');
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    // 2. Body'den type ve identifier oku
    const body = await request.json();
    const { type, identifier } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing "type" field' },
        { status: 400 }
      );
    }

    // 3. İlgili tag'leri revalidate et
    const tags = getTagsForType(type, identifier);
    
    for (const tag of tags) {
      try {
        revalidateTag(tag);
        console.log(`[Revalidate] Tag revalidated: ${tag}`);
      } catch (e) {
        console.warn(`[Revalidate] Failed to revalidate tag: ${tag}`, e);
      }
    }

    console.log(`[Revalidate] Success — type: ${type}, identifier: ${identifier}, tags: ${tags.join(', ')}`);

    return NextResponse.json({
      revalidated: true,
      type,
      identifier,
      tags,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Revalidate] Error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}

/**
 * Type'a göre revalidate edilecek tag'leri belirle.
 * Bu tag'ler fetch() çağrılarında next: { tags: [...] } ile eşleşmelidir.
 */
function getTagsForType(type: string, identifier?: string): string[] {
  const tags: string[] = [];

  switch (type) {
    case 'menu':
      tags.push('menus');
      if (identifier) tags.push(`menu-${identifier}`); // menu-main-menu, menu-footer
      break;
    case 'page':
      tags.push('pages');
      if (identifier) tags.push(`page-${identifier}`); // page-about-us
      break;
    case 'banner':
      tags.push('banners');
      break;
    case 'faq':
      tags.push('faqs');
      break;
    case 'setting':
      tags.push('settings');
      break;
    case 'testimonial':
      tags.push('testimonials');
      break;
    case 'review':
      tags.push('reviews');
      break;
    case 'gallery':
      tags.push('galleries');
      break;
    default:
      // Bilinmeyen type — tüm CMS tag'lerini revalidate et
      tags.push('menus', 'pages', 'banners', 'faqs', 'settings', 'testimonials', 'reviews', 'galleries');
  }

  return tags;
}

// GET isteği ile durum kontrolü
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
