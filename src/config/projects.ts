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
      name: 'Devtoolset',
      description: 'Open-source & database-free developer tools navigator / 开源无数据库配置的开发者工具导航站',
      link: { href: 'github.com/iAmCorey/devtoolset', label: 'Devtoolset' },
      gitStars: 203,
      gitForks: 67
    },
    {
      name: 'Corey Chiu Portfolio Template',
      description:
        'portfolio template by corey chiu',
      link: { href: 'github.com/iAmCorey/coreychiu-portfolio-template', label: 'Corey Chiu Portfolio Template' },
      gitStars: 229,
      gitForks: 30
    },
    {
      name: 'Chrome Extension Plasmo Template',
      description:
        'A chrome extension template using plasmo, tailwind css, shadcn/ui',
      link: { href: 'github.com/iAmCorey/chrome-extension-plasmo-template', label: 'Chrome Extension Plasmo Template' },
      gitStars: 54,
      gitForks: 10
    },
    {
      name: 'Awesome Indie Hacker Tools',
      description:
        '独立开发/出海开发相关技术栈及工具收录 / Find the best tools for indie hackers here',
      link: { href: 'github.com/iAmCorey/awesome-indie-hacker-tools', label: 'Awesome Indie Hacker Tools' },
      gitStars: 815,
      gitForks: 69
    },
    {
      name: 'Awesome AI Directory',
      description:
        'AI资源工具导航站收录 / Find all the best AI directories',
      link: { href: 'github.com/iAmCorey/awesome-ai-directory', label: 'Awesome AI Directory' },
      gitStars: 40,
      gitForks: 7
    },
    {
      name: 'Producthunt Daily Bot',
      description:
        'A bot getting product hunt daily top products',
      link: { href: 'github.com/iAmCorey/producthunt-daily-bot', label: 'Producthunt Daily Bot' },
      gitStars: 3,
      gitForks: 3
    },
    {
      name: 'Cantonese Echoes',
      description:
        'Cantonese Echoes / 粵語殘片',
      link: { href: 'github.com/iAmCorey/Cantonese-Echoes', label: 'Cantonese Echoes' },
      gitStars: 1
    },
  ]
  
