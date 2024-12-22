
import { useTheme } from "@/components/ThemeProvider"

const Links = () => {
    const { toggleTheme } = useTheme()

    return (
        <div className="grow self-center flex flex-nowrap justify-end gap-x-2 mr-2">
            <a className="hover:text-primary" href="https://bsky.app/profile/chris-n07734.bsky.social">
                <svg
                    className="h-6 w-6 fill-current"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-qa-id="BlueSkyIcon">
                    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"></path>
                </svg>
            </a>
            <a className="hover:text-primary" href="https://github.com/n07734/community-health">
                <svg
                    className="h-6 w-6 fill-current"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-testid="GitHubIcon">
                    <path d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 01.64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 010-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 010 2.93c.83.74 1.2 1.74 1.2 2.94 0 4.21-2.57 5.13-5.04 5.4.45.37.82.92.82 2.02v3.03c0 .27.1.64.73.55A11 11 0 0012 1.27"></path>
                </svg>
            </a>
            <a
                href="#theme"
                onClick={(e) => {
                    e.preventDefault()
                    toggleTheme()
                }}
                className="theme-icon hover:text-primary"
            >
                <svg
                    className="h-6 w-6 sun fill-current dark:display-none"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-qa-id="SunnyIcon"
                >
                    <path d="m6.76 4.84-1.8-1.79-1.41 1.41 1.79 1.79zM4 10.5H1v2h3zm9-9.95h-2V3.5h2zm7.45 3.91-1.41-1.41-1.79 1.79 1.41 1.41zm-3.21 13.7 1.79 1.8 1.41-1.41-1.8-1.79zM20 10.5v2h3v-2zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6m-1 16.95h2V19.5h-2zm-7.45-3.91 1.41 1.41 1.79-1.8-1.41-1.41z"></path>
                </svg>
                <svg
                    className="h-6 w-6 moon fill-current"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-qa-id="MoonIcon"
                >
                    <path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2"></path>
                </svg>
            </a>
        </div>
    );
};

export default Links
