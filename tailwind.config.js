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
        screens: {
          'xs': '547px',
        },
      },
    },
    variants: {
      extend: {
        fontWeight: ['hover'],
       }
    },
    plugins: [],
};
