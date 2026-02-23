/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef7ed',
                    100: '#fdecd4',
                    200: '#fad5a8',
                    300: '#f6b871',
                    400: '#f19338',
                    500: '#ee7a12',
                    600: '#df6008',
                    700: '#b94809',
                    800: '#93390e',
                    900: '#77310f',
                    950: '#401605',
                },
            },
        },
    },
    plugins: [],
};
