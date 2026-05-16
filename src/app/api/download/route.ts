import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'document.pdf';

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    
    // Ensure filename has correct extension if missing
    let finalFilename = filename;
    if (!finalFilename.includes('.')) {
      const extensionMap: Record<string, string> = {
        'application/pdf': '.pdf',
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      };
      const ext = extensionMap[contentType];
      if (ext) finalFilename += ext;
    }

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${finalFilename}"`);
    headers.set('Content-Type', contentType);

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download proxy error:', error);
    return new NextResponse('Error downloading file', { status: 500 });
  }
}
