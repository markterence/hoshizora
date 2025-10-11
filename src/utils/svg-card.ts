export interface SVGCardOptions {
    width?: number;
    height?: number;
    borderRadius?: number;
    title?: string;
    desc?: string;
}
export function useSVGCard(options: SVGCardOptions = {}) {
    const defaultOptions: SVGCardOptions = {
        width: 300,
        height: 100,
        borderRadius: 8,
        title: "",
        desc: "",
    };

    const config = { ...defaultOptions, ...options };

    let customCSS = "";

    function setCSS(css: string) {
        customCSS = css;
    }

    function renderSVG(slot: string): string {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" 
                width="${config.width}" 
                height="${config.height}" 
                viewBox="0 0 ${config.width} ${config.height}" 
                role="img" 
                aria-labelledby="${config.title}"
            >
                <title>${config.title}</title>
                <desc>${config.desc}</desc>
                <style>
                    ${customCSS}
                </style>
                ${slot}
            </svg>
        `.trim()
    }

    return {
        setCSS,
        renderSVG,
    };
}