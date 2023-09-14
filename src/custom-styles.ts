// Details: https://primevue.org/passthrough
const passThrough  = {
  global: {
    css: `
      *,
      *::after,
      *::before {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
      }

      html {
          font-family: Rubik, sans-serif;
          font-size: 16px;
          background-color: var(--yellow-50);
      }

      body {
          display: flex;
          min-height: 100vh;
      }

      #app {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
      }
    `
  },
  tabview: {
    root: {class: "shadow-xl"},
  },
  multiselect: {
    label: {
      class: "block overflow-hidden whitespace-nowrap cursor-pointer overflow-ellipsis text-gray-800 dark:text-white/80 p-2 transition duration-200"
    },
  },
  dropdown: {
    input: {
      class: "cursor-pointer block flex flex-auto overflow-hidden overflow-ellipsis whitespace-nowrap relative bg-transparent border-0 text-gray-800 dark:text-white/80 p-2 transition duration-200 bg-transparent rounded appearance-none font-sans text-base focus:outline-none focus:shadow-none",
    },
  },
  inputtext: {
    root: {
      class: "w-full m-0 font-sans text-gray-600 dark:text-white/80 bg-white dark:bg-gray-900 border border-gray-300 dark:border-blue-900/40 transition-colors duration-200 appearance-none rounded-lg hover:border-blue-500 focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)] dark:focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)] p-2 text-base",
    }
  },
  selectbutton: {
    button: {
      class: "inline-flex cursor-pointer select-none items-center align-bottom text-center overflow-hidden relative p-2 transition duration-200 border border-r-0 first:rounded-l-md first:rounded-tr-none first:rounded-br-none last:border-r last:rounded-tl-none last:rounded-bl-none last:rounded-r-md focus:outline-none focus:outline-offset-0 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)] dark:focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)] bg-white dark:bg-gray-900 text-gray-700 dark:text-white/80 border-gray-300 dark:border-blue-900/40 hover:bg-gray-50 dark:hover:bg-gray-800/80"
    }
  }

}

export default passThrough
