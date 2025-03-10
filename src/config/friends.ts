// friends
export const friendsHeadLine = "RejectModders Friends"
export const friendsIntro = "Meet some interesting friends."


// friends
export type FriendItemType = {
  name: string
  description?: string
  link: { href: string, label?: string }
  logo?: string
  image?: string
}


export const friends: Array<FriendItemType> = [
  {
    name: 'Corey Chiu',
    link: { href: 'https://coreychiu.com' },
    image: 'corey-chiu.jpg', 
  },
  {
    name: 'RejectModders',
    link: { href: 'https://pornhub.com' },
    image: 'rejectmodders.jpg',
  },
]

