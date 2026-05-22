export default defineAppConfig({
  ui: {
    colors: {
      primary: "indigo",
      secondary: "emerald",
      neutral: "gray",
    },

    checkbox: {
      variants: {
        variant: {
          list: {
            root: '',
          },
          card: {
            root: 'border border-muted rounded-lg inline-flex w-auto dark:border-gray-700 dark:bg-gray-800',
          },
        },
      },
    },
    breadcrumb: {
      variants: {
        active: {
          false: 'text-white hover:text-gray-200 dark:text-gray-300 dark:hover:text-white',
        },
      },
    },

    table: {
      slots: {
        th: 'font-display uppercase light:text-muted text-[12.5px] dark:text-gray-500',
        td: 'py-2 text-gray-800 dark:text-gray-200',
        loading: 'p-0',
      },
    },

    card: {
      variants: {
        variant: {
          outline: {
            root:
              'bg-white/80 dark:bg-gray-900 ring-2 ring-gray-100 dark:ring-gray-800 shadow rounded-2xl shadow',
            base: 'text-gray-800 dark:text-gray-200',
          },
        },
      },
    },

    textarea: {
      slots: {
        root: 'w-full',
        base:
          'rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100',
      },
    },

    input: {
      defaultVariants: {
        size: 'xl',
      },
      slots: {
        root: 'w-full',
        base:
          'rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100',
      },
    },
    modal: {
      slots: {
        base: 'rounded-2xl bg-white dark:bg-gray-900',
        overlay: 'bg-black/50',
      },
    },

    select: {
      defaultVariants: {
        size: 'xl',
      },
      slots: {
        base:
          'w-full rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100',
      },
    },

    selectMenu: {
      slots: {
        base:
          'w-full rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700',
      },
      defaultVariants: {
        size: 'xl',
      },
    },
    badge: {
      variants: {
        size: {
          md: 'text-xs px-2 py-1 gap-1 rounded-xl'
        }
      }
    },
    button: {
      defaultVariants: {
        size: 'lg',
      },
      slots: {
        base: 'rounded-xl',
      },
    },
  },
});