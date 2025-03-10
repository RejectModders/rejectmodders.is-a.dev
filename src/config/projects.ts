// projects
export const projectHeadLine = "What I've done and what I'm doing."
export const projectIntro = "I've worked on a variety of projects, from simple python bots, to complex websites."

export type ProjectItemType = {
    name: string
    description: string
    link: { href: string, label: string }
    date?: string
    logo?: string,
    category?: string[],
    tags?: string[],
    image?: string,
    techStack?: string[],
    gitStars?: number,
    gitForks?: number
  }
  
  // projects 
  export const projects: Array<ProjectItemType> = [
    {
      name: 'Disutils Team',
      description:
        'A dedicated group of individuals committed to enhancing and simplifying the Discord experience for all users.',
      link: { href: 'disutils.com', label: 'Disutils Team' },
      category: ['Website'],
      techStack: ['Next.js', 'TailwindCSS', 'Shadcn/UI'],
      tags: ['Discord Bots', 'Custom Bots']
    },
    {
      name: 'Is It Pink?',
      description:
        'A kids game I made for the fun of it.',
      link: { href: 'is-it.pink', label: 'Is It Pink?' },
      category: ['Website'],
      techStack: ['Next.js', 'TailwindCSS', 'Shadcn/UI'],
      tags: ['Game', 'Kids Game']
    },
    {
      name: 'Public CDN',
      description:
        'The best public CDN for free.',
      link: { href: 'cdn.is-it.pink', label: 'Best Directories' },
      category: ['Website'],
      techStack: ['Next.js', 'TailwindCSS', 'Shadcn/UI'],
      tags: ['CDN', 'Image Host']
    },
    {
      name: 'Ignited Hosting',
      description:
        'Fast server, reliable servers, and no bs.',
      link: { href: 'ignitedhosting.com', label: 'Ignited Hosting' },
      category: ['Website'],
      techStack: ['Next.js', 'TailwindCSS', 'Shadcn/UI'],
      tags: ['Hosting', 'Game Panel', 'FiveM']
    },
    {
      name: 'Ceebs',
      description:
        'Ceebs, food delivery bot for campus.',
      link: { href: 'ceebs.site', label: 'Ceebs' },
      category: ['Website'],
      techStack: ['Next.js', 'TailwindCSS', 'Shadcn/UI'],
      tags: ['Discord Bot', 'Food Delivery']
    },
  ]
  
  export const githubProjects: Array<ProjectItemType> = [
    {
      name: 'disckit',
      description: 'An open source utilities library for the disutils bots',
      link: { href: 'github.com/disutils/disckit', label: 'disckit' },
      gitStars: 1,
      gitForks: 0
    },
    {
      name: 'Is It Pink?',
      description:
        'portfolio template by corey chiu',
      link: { href: 'github.com/disutils/is-it.pink', label: 'Is It Pink?' },
      gitStars: 0,
      gitForks: 0
    },
    {
      name: 'Discord.py-Template',
      description:
        'A chrome extension template using plasmo, tailwind css, shadcn/ui',
      link: { href: 'github.com/RejectModders/Discord.py-Template', label: 'Discord.py-Template' },
      gitStars: 1,
      gitForks: 1
    },
  ]
  
