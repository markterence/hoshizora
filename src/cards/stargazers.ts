import { RepositoryStargazerInfo, StargazerUser } from "../types";
import { truncate } from "../utils/common";
import { useSVGCard } from "../utils/svg-card";
import { GithubSVG } from "./icons/github-svg"
export interface StargazerCardConfig {
    shouldShowUsernames?: boolean;
    title?: string;
    showTitle?: boolean;
    extra?: Record<string, any>;
}
export function createStargazerCard(data: RepositoryStargazerInfo, config: StargazerCardConfig) {
    const MAX_AVATARS = 9;
    const NUM_NAMES_TO_SHOW = 3;
    const COUNT_AVATARS = 9;
    const AVATAR_CLIP_PATH_CX_START = 80;
    const AVATAR_CLIP_PATH_CY = 74;
    const AVATAR_START_X = 56;
    const AVATAR_Y = 54;
    const AVATAR_SIZE = 42;
    const AVATAR_GROUP_CSS_TRANSLATE_Y = '-10px';
    const AVATAR_GROUP_CSS_TRANSLATE_Y_BREAK = '-16px';
    const AVATAR_GROUP_CSS_TRANSLATE_Y_NO_NAMES = '0px';

    const { 
        name,
        stargazerCount,
        stargazers,
    } = data;

    const svgCard = useSVGCard({
        width: 520,
        height: 132,
        borderRadius: 8,
        desc: `${stargazerCount} Stargazers`,
        title: `${config.extra?.owner}-${name}`,
    });

    let cssTemplateVars = {
        avatarGroupTranslateY: AVATAR_GROUP_CSS_TRANSLATE_Y,
    };
    
    const css = (vars: typeof cssTemplateVars) => `
    .star {
        opacity: 0;
        transform-box: fill-box;
        transform-origin: center;
        animation: twinkle var(--dur, 4s) ease-in-out infinite;
    }
    .star-warm {
        fill: #ffd700;
    }
    .star-cool {
        fill: #87ceeb;
    }
    .star-white {
        fill: #ffffff;
    }
    .star-amber {
        fill: #ffb347;
    }
    .star-ice {
        fill: #b6e5ff;
    }

    @keyframes twinkle {
        0% {
            opacity: 0.08;
            transform: scale(1);
        }

        45% {
            opacity: 1;
            transform: scale(1.35);
        }

        55% {
            opacity: 0.9;
            transform: scale(1.15);
        }

        100% {
            opacity: 0.06;
            transform: scale(1);
        }
    }

    .avatar-border {
        fill: none;
        stroke: #ffffff;
        stroke-width: 2;
    }

    .avatar-group {
        transform: translate(-38px, ${vars.avatarGroupTranslateY});
    }

    .label-text {
        fill: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 14px;
    }

    .username {
        font-weight: bold;
    }

    .others-count {
        font-weight: bold;
        fill: #58a6ff;
    }
    `;

    const resolveNumAvatarsToShow = () => {
        let num = COUNT_AVATARS;
        if (COUNT_AVATARS > MAX_AVATARS) {
            num = MAX_AVATARS;
        }
        // Few stargazers (less than MAX can handle)
        if (stargazerCount < num) {
            return stargazerCount;
        }

        return num;
    }

    const numStargazerAvatarsToShow = resolveNumAvatarsToShow();
    
    const getStargazersToDisplay = () => {
        return stargazers.nodes.slice(0, numStargazerAvatarsToShow);
    }

    // Total Count of stargazers - the names shown
    let othersCount = stargazerCount - NUM_NAMES_TO_SHOW;
    let avatarClipPaths: string[] = [];
    let didBreakLineText = false;

    function createAvatars (stargazerUsers: StargazerUser[]) {
        if (stargazerUsers.length === 0) {
            return '';
        }

        let avatarsArr: string[] = [];
        // Avatar spacing offset (too little or negative will cause overlapping avatars)
        const offsetX = 4;
        stargazerUsers.forEach((stargazer, index) => {
            // Non-overlapping avatars
            const x = AVATAR_START_X + index * (AVATAR_SIZE + offsetX);
            const clipPathId = `avatar-clip-${index}`;

            const avatarUrl = stargazer.avatarUrl;
            const cx = AVATAR_CLIP_PATH_CX_START + index * (AVATAR_SIZE + offsetX);

            avatarClipPaths.push(`
                <clipPath id="${clipPathId}">
                    <circle cx="${cx}" cy="${AVATAR_CLIP_PATH_CY}" r="${AVATAR_SIZE / 2}" />
                </clipPath>
            `);

            avatarsArr.push(`
                <image
                    href="${avatarUrl}"
                    x="${x}"
                    y="${AVATAR_Y}"
                    width="${AVATAR_SIZE}"
                    height="${AVATAR_SIZE}"
                    clip-path="url(#${clipPathId})"
                    aria-label="${stargazer.login}"
                />
                <circle
                    class="avatar-border"
                    cx="${cx}"
                    cy="${AVATAR_CLIP_PATH_CY}"
                    r="${AVATAR_SIZE / 2}"
                />
            `);
        });
 
        return `<!-- avatar fragment -->${avatarsArr.join('').trim()}`
    }

    /**
     * Creates the message: "@{user1}, {user2}, {user3} and {count} others starred this repository".
     */
    function renderStargazerNames(stargazerUsers: StargazerUser[]) {
        if (!config?.shouldShowUsernames) {
            return '';
        }

        if (stargazerUsers.length === 0) {
            return '';
        }

        const createUsernameSVGText = (truncatedUsernames: string[]): string[] => {
            let elements: string[] = [];
            truncatedUsernames.forEach((username) => {
                elements.push(`<tspan class="username">${username}</tspan>`);
            });
            return elements;
        }

        let usernamesArr: string[] = [];
        // The breakpoints here puts the "and X others" part on a new line.
        // This fixes the overflow issue when there are many stargazers and names are long.
        const firstThreeNames = stargazerUsers.slice(0, NUM_NAMES_TO_SHOW);
        const breakpointStringTestArr: string[] = [];

        firstThreeNames.forEach((stargazer, index) => {
            const truncatedUsername = truncate(stargazer.login, 12);
            usernamesArr.push(`@${truncatedUsername}`);
        });

        const renderSuffixPhrase = (): string => {
            if (stargazerUsers.length === 0) { 
                return '';
            }

            let markup = '';

            // determine if we need to break line when the "first three usernames + othersCount" is too long
            breakpointStringTestArr.push(usernamesArr.join(', '));
            if (othersCount > 0) {
                // When there are other more users.
                breakpointStringTestArr.push(` and ${othersCount} others`);
                const breakpointStringTest = breakpointStringTestArr.join('');
                const breakpointLen = breakpointStringTest.length;

                // 49 is the number of characters that fit in one line in this design to avoid overflow.
                didBreakLineText = breakpointLen >= 49;

                const othersCountHuman = othersCount.toLocaleString();
                markup += '<tspan> and </tspan>';
                markup += `<tspan class="others-count">${othersCountHuman} others</tspan>`;
            }

            if (othersCount > 0 && didBreakLineText) {
                // Have the "starred this repository" text positioned below the username line.
                markup+= `<tspan x="60" dy="1.2em">starred this repository</tspan>`
            } else {
                markup+= `<tspan> starred this repository</tspan>`
            }

            return markup;
        }

        return `
            <text x="56" y="112" class="label-text">
                ${createUsernameSVGText(usernamesArr).join('<tspan>, </tspan>')}
                ${renderSuffixPhrase()}
            </text>
        `;
    }
    
        const renderRepoName = () => {
            if (config?.extra?.repoName) {
                return (`
                    <g transform="translate(20, 0)">
                        <svg x="0" y="4" width="20" height="20" fill="#ffffff">
                            <use href="#github-icon" />
                        </svg>
                        <text x="26"
                            y="20"
                            style="font-size:16px; font-weight:600;" fill="#ffffff"
                            class="label-text"
                        >
                        <tspan>${config.extra.owner}</tspan>/<tspan>${config.extra.repoName}</tspan>
                        </text> 
                    </g>
                `);
            }
            return '';
        }

    function renderAvatarGroup(stargazerUsers: StargazerUser[]) {
        const renderTitle = () => {
            if (config?.showTitle) {
                return (`
                    <text x="58" y="46" class="label-text" style="font-size:16px; font-weight:600;">
                        ${config?.title || 'Stargazers'}
                    </text>
                `);
            } 
            return '';
        }


        const avatarsFragment = createAvatars(stargazerUsers);
        const usernamesNode = renderStargazerNames(stargazerUsers);
        return `
            <!-- Avatar Group -->
            ${renderRepoName()}
            <g class="avatar-group">
                ${renderTitle()}
     
                ${avatarsFragment}
                ${usernamesNode}
            </g>
        `
    }

    function fixCSS() {
        if (!config?.shouldShowUsernames) {
            // Fix the CSS translateY when usernames are not shown.
            cssTemplateVars.avatarGroupTranslateY = AVATAR_GROUP_CSS_TRANSLATE_Y_NO_NAMES;
        }
        
        if(config?.shouldShowUsernames && config?.showTitle) {
            // Fix the CSS translateY when both usernames and title are shown.
            cssTemplateVars.avatarGroupTranslateY = "0px"
        }

        if (didBreakLineText && (config?.showTitle && config?.shouldShowUsernames)) {
            cssTemplateVars.avatarGroupTranslateY = '-4px';
        } else if (didBreakLineText) {
            // Set a new translateY for avatar-group to adjust the position
            // when the "and X others" part is on a new line.
            cssTemplateVars.avatarGroupTranslateY = AVATAR_GROUP_CSS_TRANSLATE_Y_BREAK;
        }
    }

    const theStars = `
    <g aria-hidden="true">
        <!-- Main stars with color variety -->
        <circle class="star star-warm" cx="32" cy="28" r="1.4" style="--dur:3.6s; animation-delay:0.2s" />
        <circle class="star star-white" cx="80" cy="50" r="0.9" style="--dur:2.8s; animation-delay:1.1s" />
        <circle class="star star-cool" cx="120" cy="18" r="1.8" style="--dur:4.6s; animation-delay:0.6s" />
        <circle class="star star-amber" cx="160" cy="70" r="1.1" style="--dur:3.0s; animation-delay:2.0s" />
        <circle class="star star-white" cx="212" cy="40" r="0.7" style="--dur:2.2s; animation-delay:0.9s" />
        <circle class="star star-ice" cx="264" cy="22" r="1.3" style="--dur:5.2s; animation-delay:1.6s" />
        <circle class="star star-warm" cx="310" cy="62" r="0.8" style="--dur:3.8s; animation-delay:0.4s" />
        <circle class="star star-cool" cx="360" cy="28" r="1.6" style="--dur:4.0s; animation-delay:2.8s" />
        <circle class="star star-white" cx="410" cy="48" r="1.0" style="--dur:2.6s; animation-delay:1.9s" />
        <circle class="star star-amber" cx="470" cy="20" r="0.6" style="--dur:3.1s; animation-delay:0.3s" />

        <!-- Right side additional stars -->
        <circle class="star star-warm" cx="450" cy="35" r="0.8" style="--dur:3.4s; animation-delay:1.3s" />
        <circle class="star star-ice" cx="485" cy="45" r="1.2" style="--dur:4.2s; animation-delay:0.7s" />
        <circle class="star star-white" cx="502" cy="28" r="0.6" style="--dur:2.9s; animation-delay:2.4s" />
        <circle class="star star-cool" cx="475" cy="60" r="0.9" style="--dur:3.7s; animation-delay:1.8s" />
        <circle class="star star-amber" cx="495" cy="52" r="0.5" style="--dur:2.5s; animation-delay:0.9s" />

        <circle class="star star-ice" cx="18" cy="120" r="1.1" style="--dur:3.3s; animation-delay:1.2s" />
        <circle class="star star-warm" cx="60" cy="150" r="0.9" style="--dur:2.7s; animation-delay:0.7s" />
        <circle class="star star-white" cx="110" cy="110" r="1.9" style="--dur:4.8s; animation-delay:2.1s" />
        <circle class="star star-cool" cx="150" cy="135" r="1.0" style="--dur:3.9s; animation-delay:0.5s" />
        <circle class="star star-amber" cx="200" cy="160" r="0.7" style="--dur:2.4s; animation-delay:1.4s" />
        <circle class="star star-white" cx="246" cy="118" r="1.4" style="--dur:4.4s; animation-delay:0.8s" />
        <circle class="star star-ice" cx="292" cy="140" r="0.8" style="--dur:3.2s; animation-delay:2.6s" />
        <circle class="star star-warm" cx="340" cy="125" r="1.5" style="--dur:5.0s; animation-delay:1.0s" />
        <circle class="star star-cool" cx="380" cy="100" r="1.2" style="--dur:3.7s; animation-delay:0.1s" />
        <circle class="star star-amber" cx="430" cy="130" r="0.6" style="--dur:2.9s; animation-delay:2.2s" />

        <!-- Right side bottom stars -->
        <circle class="star star-white" cx="460" cy="115" r="0.7" style="--dur:3.1s; animation-delay:1.5s" />
        <circle class="star star-ice" cx="490" cy="105" r="1.0" style="--dur:4.1s; animation-delay:0.8s" />
        <circle class="star star-warm" cx="505" cy="125" r="0.5" style="--dur:2.8s; animation-delay:2.0s" />
        <circle class="star star-cool" cx="475" cy="135" r="0.8" style="--dur:3.5s; animation-delay:1.7s" />

        <!-- Small accent stars -->
        <circle class="star star-amber" cx="502" cy="20" r="0.3" style="--dur:2.7s; animation-delay:1.6s" />
        <circle class="star star-ice" cx="42" cy="12" r="0.4" style="--dur:3.1s; animation-delay:0.9s" />
        <circle class="star star-white" cx="78" cy="104" r="0.5" style="--dur:2.3s; animation-delay:0.4s" />
        <circle class="star star-cool" cx="132" cy="76" r="0.3" style="--dur:2.9s; animation-delay:1.2s" />
        <circle class="star star-warm" cx="192" cy="24" r="0.4" style="--dur:3.5s; animation-delay:0.7s" />
        <circle class="star star-white" cx="250" cy="54" r="0.5" style="--dur:2.6s; animation-delay:1.0s" />
        <circle class="star star-amber" cx="308" cy="88" r="0.4" style="--dur:3.3s; animation-delay:0.2s" />
        <circle class="star star-ice" cx="462" cy="32" r="0.3" style="--dur:2.8s; animation-delay:1.4s" />
        <circle class="star star-cool" cx="412" cy="12" r="0.5" style="--dur:3.7s; animation-delay:0.6s" />
        <circle class="star star-warm" cx="372" cy="52" r="0.4" style="--dur:2.4s; animation-delay:0.1s" />

    </g>
    `;

    const stargazersToDisplay = getStargazersToDisplay();
    const avatarGroup = renderAvatarGroup(stargazersToDisplay);

    const svgContent: string[] = [];
    svgContent.push(GithubSVG());
    svgContent.push(`<rect width="100%" height="100%" fill="#001428" rx="8" ry="8" />`)
    // when no stargazers
    if (stargazerCount === 0) { 
        svgContent.push(`
            <g class="no-stargazers-group">
                <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" class="label-text" style="font-size:16px; font-weight:500; fill:#aaa;">
                    Not starred yet
                </text>
                <text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" class="label-text" style="font-style: italic; font-size:0.9rem; fill:#777;">
                    A quiet night sky
                </text>
            </g>
        `);
    }
    else {
        svgContent.push(`
            <defs>
                ${avatarClipPaths.join('')}
            </defs>
        `);
    }
    svgContent.push(avatarGroup);
    svgContent.push(theStars);

    fixCSS();
    svgCard.setCSS(css(cssTemplateVars));
    return svgCard.renderSVG(svgContent.join(''));
}