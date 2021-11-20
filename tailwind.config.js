module.exports = {
    prefix: '',
    purge: {
      content: [
        './src/**/*.{html,ts}',
      ]
    },
    darkMode: 'class', // or 'media' or 'class'
    theme: {
      extend: {
        backgroundImage: {
          'spotify': "url('/assets/images/spotifyIcon.svg')",
          'youtube': "url('/assets/images/youtubeIcon.svg')",
          'search': "url('/assets/images/searchIcon.svg')",
        }
      },
    },
    variants: {
      extend: {
        fontWeight: ['hover'],
       }
    },
    plugins: [],
};
