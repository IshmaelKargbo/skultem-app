export default defineAppConfig({
  ui: {
    colors: {
      primary: "app",
      secondary: "sec",
      neutral: "zinc",
    },
    checkbox: {
      variants: {
        variant: {
          list: {
            root: ''
          },
          card: {
            root: 'border border-muted rounded-lg inline-flex w-auto'
          }
        }
      }
    },
    breadcrumb: {
      variants: {
        active: {
          false: 'text-white hover:text-white'
        }
      }
    },
    table: {
      slots: {
        tr: 'hover:bg-app-50/20'
      }
    },
    card: {
      slots: {
        body: 'p-5 sm:p-5',
        header: 'p-5 sm:p-5',
        footer: 'p-5 sm:p-5',
      },
      variants: {
        variant: {
          outline: {
            root: 'bg-default ring-1 ring-default/40 divide-y divide-default/40'
          },
        }
      }
    },
    textarea: {
      slots: {
        root: "w-full"
      }
    },
    input: {
      defaultVariants: {
        size: "lg",
      },
      slots: {
        root: 'w-full'
      }
    },
    select: {
      defaultVariants: {
        size: "lg",
      },
      slots: {
        base: 'w-full',
      }
    },
    selectMenu: {
      slots: {
        base: 'w-full'
      },
      defaultVariants: {
        size: "lg"
      }
    },
    button: {
      defaultVariants: {
        size: "md",
      },
    },
  },
});
