import { LucideIcon } from "lucide-react"

export const Icons = {
  website: (props: React.ComponentProps<typeof LucideIcon>) => (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17L12 12L2 17Z"
        fill="currentColor"
      />
    </svg>
  ),
  twitter: (props: React.ComponentProps<typeof LucideIcon>) => (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23 3a10.945 10.945 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A4.48 4.48 0 0 0 15 11a4.48 4.48 0 0 0 2 3.72V20A4.48 4.48 0 0 1 9.5 23a4.48 4.48 0 0 1-4-4.45A4.48 4.48 0 0 1 1 10c0-1.01.3-2.04.87-2.96 4.05 4.99 4.3 5.47 5.98 4.7 1.54-1.04 2.9-2.53 3.87-4.14z"
        fill="currentColor"
      />
    </svg>
  ),
  linkedin: (props: React.ComponentProps<typeof LucideIcon>) => (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM5 19h14v-2H5v2zM7 7h2v9H7V7zm10 0h2v9h-2V7z"
        fill="currentColor"
      />
    </svg>
  ),
  instagram: (props: React.ComponentProps<typeof LucideIcon>) => (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 3.686c-2.58 0-2.933.014-3.89.077-1.512.118-2.163.998-2.28 2.28-.063 1.041-.077 1.31-.077 3.89 0 2.581.014 2.933.077 3.89.119 1.512.998 2.163 2.28 2.28 1.041.063 1.31.077 3.89.077 2.58 0 2.933-.013 3.89-.077 1.512-.119 2.163-.998 2.28-2.28.063-1.041.077-1.31.077-3.89 0-2.581-.013-2.933-.077-3.89-.119-1.512-.998-2.163-2.28-2.28-1.041-.063-1.31-.077-3.89-.077zM12 13c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0-8c-2.667 0-8 1.332-8 4 0 2.668 5.333 4 8 4s8-1.332 8-4c0-2.667-5.333-4-8-4z"
        fill="currentColor"
      />
    </svg>
  ),
} as const
