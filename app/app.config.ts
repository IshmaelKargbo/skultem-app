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
        th: 'font-display uppercase text-mute text-[12.5px]',
        td: 'text-neutral-800 py-2.5',
        loading: 'p-0'
      }
    },
    card: {
      variants: {
        variant: {
          outline: {
            root: 'bg-default shadow rounded-2xl shadown-md'
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
