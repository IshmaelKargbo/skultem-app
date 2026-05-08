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
            root: 'bg-white/80 ring-2 shadow rounded-2xl shadown-md'
          },
        }
      }
    },
    textarea: {
      slots: {
        root: "w-full",
        base: 'rounded-xl'
      }
    },
    input: {
      defaultVariants: {
        size: "lg",
      },
      slots: {
        root: 'w-full',
        base: 'rounded-xl'
      }
    },
    select: {
      defaultVariants: {
        size: "lg",
      },
      slots: {
        base: 'w-full rounded-xl',
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
        size: "lg",
      },
      slots: {
        base: 'rounded-xl'
      }
    },
  },
});
