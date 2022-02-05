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
        colors: {
          // #FF9D22 #FF8B60 #FFDB74
          'default-color': '#FFAD4D',
          'spotify': '#00782a',
          'youtube': '#b31800'
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
