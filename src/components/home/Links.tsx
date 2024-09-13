
import { useTheme } from "@/components/ThemeProvider"

const Links = () => {
    const { toggleTheme } = useTheme()

    return (
        <div className="absolute z-[1] top-2 right-2 flex flex-nowrap gap-x-2">
            <a className="hover:text-primary" href="https://twitter.com/chris_07734">
                <svg
                    className="h-6 w-6 fill-current"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-qa-id="TwitterIcon">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"></path>
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
