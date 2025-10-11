import { encodeBase64 } from "hono/utils/encode";

export const truncate = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength - 1) + '…';
}

export const mapImageURLToDataURL = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
        throw new Error('Failed to fetch image or not an image');
    }
    
    const buffer = await response.arrayBuffer();
    const base64 = encodeBase64(buffer);
    const contentType = response.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${base64}`;
};
